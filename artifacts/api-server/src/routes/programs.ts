import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, programsTable } from "@workspace/db";
import {
  CreateProgramBody,
  UpdateProgramParams,
  UpdateProgramBody,
  DeleteProgramParams,
  ListProgramsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/programs", async (_req, res): Promise<void> => {
  const rows = await db.select().from(programsTable);
  res.json(ListProgramsResponse.parse(rows));
});

router.post("/programs", async (req, res): Promise<void> => {
  const parsed = CreateProgramBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!parsed.data.name || !parsed.data.level || !parsed.data.description) {
    res.status(400).json({ error: "name, level and description are required" });
    return;
  }

  const [program] = await db.insert(programsTable).values({
    name: parsed.data.name,
    level: parsed.data.level,
    description: parsed.data.description,
    duration: parsed.data.duration,
    imageUrl: parsed.data.imageUrl,
  }).returning();

  res.status(201).json(program);
});

router.patch("/programs/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateProgramParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProgramBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [program] = await db.update(programsTable).set(parsed.data).where(eq(programsTable.id, params.data.id)).returning();
  if (!program) {
    res.status(404).json({ error: "Program not found" });
    return;
  }

  res.json(program);
});

router.delete("/programs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteProgramParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [program] = await db.delete(programsTable).where(eq(programsTable.id, params.data.id)).returning();
  if (!program) {
    res.status(404).json({ error: "Program not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
