import { Router, type IRouter } from "express";
import { db, schoolProfileTable } from "@workspace/db";
import { UpdateSchoolProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/school-profile", async (_req, res): Promise<void> => {
  let [profile] = await db.select().from(schoolProfileTable).limit(1);

  if (!profile) {
    const [created] = await db.insert(schoolProfileTable).values({}).returning();
    profile = created;
  }

  res.json(profile);
});

router.patch("/school-profile", async (req, res): Promise<void> => {
  const parsed = UpdateSchoolProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let [profile] = await db.select().from(schoolProfileTable).limit(1);

  if (!profile) {
    const [created] = await db.insert(schoolProfileTable).values(parsed.data).returning();
    res.json(created);
    return;
  }

  const [updated] = await db
    .update(schoolProfileTable)
    .set(parsed.data)
    .returning();

  res.json(updated);
});

export default router;
