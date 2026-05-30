import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, galleryTable } from "@workspace/db";
import {
  ListGalleryQueryParams,
  CreateGalleryItemBody,
  DeleteGalleryItemParams,
  ListGalleryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/gallery", async (req, res): Promise<void> => {
  const query = ListGalleryQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let rows = await db.select().from(galleryTable);
  if (query.data.category) {
    rows = rows.filter((r) => r.category === query.data.category);
  }

  res.json(ListGalleryResponse.parse(rows.map((r) => ({
    ...r,
    takenAt: r.takenAt ? r.takenAt.toISOString() : null,
  }))));
});

router.post("/gallery", async (req, res): Promise<void> => {
  const parsed = CreateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(galleryTable).values({
    ...parsed.data,
    takenAt: parsed.data.takenAt ? new Date(parsed.data.takenAt) : null,
  }).returning();

  res.status(201).json({
    ...item,
    takenAt: item.takenAt ? item.takenAt.toISOString() : null,
  });
});

router.delete("/gallery/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteGalleryItemParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db.delete(galleryTable).where(eq(galleryTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Gallery item not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
