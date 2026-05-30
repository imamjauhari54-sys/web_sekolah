import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, contactTable } from "@workspace/db";
import { SubmitContactBody, DeleteContactMessageParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/contact", async (_req, res): Promise<void> => {
  const rows = await db.select().from(contactTable).orderBy(desc(contactTable.createdAt));
  res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/contact", async (req, res): Promise<void> => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!parsed.data.name || !parsed.data.email || !parsed.data.subject || !parsed.data.message) {
    res.status(400).json({ error: "name, email, subject and message are required" });
    return;
  }

  const [message] = await db.insert(contactTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    phone: parsed.data.phone,
  }).returning();

  res.status(201).json({ ...message, createdAt: message.createdAt.toISOString() });
});

router.delete("/contact/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteContactMessageParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [msg] = await db.delete(contactTable).where(eq(contactTable.id, params.data.id)).returning();
  if (!msg) {
    res.status(404).json({ error: "Message not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
