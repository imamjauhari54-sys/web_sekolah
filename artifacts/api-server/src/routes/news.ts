import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, newsTable } from "@workspace/db";
import {
  ListNewsQueryParams,
  CreateNewsBody,
  GetNewsParams,
  GetNewsResponse,
  UpdateNewsParams,
  UpdateNewsBody,
  UpdateNewsResponse,
  DeleteNewsParams,
  ListNewsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/news", async (req, res): Promise<void> => {
  const query = ListNewsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const limit = query.data.limit ?? 20;
  const offset = query.data.offset ?? 0;

  let rows = await db
    .select()
    .from(newsTable)
    .orderBy(desc(newsTable.publishedAt))
    .limit(limit)
    .offset(offset);

  if (query.data.category) {
    rows = rows.filter((r) => r.category === query.data.category);
  }

  res.json(ListNewsResponse.parse(rows.map((r) => ({
    ...r,
    publishedAt: r.publishedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }))));
});

router.post("/news", async (req, res): Promise<void> => {
  const parsed = CreateNewsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!parsed.data.title || !parsed.data.content) {
    res.status(400).json({ error: "title and content are required" });
    return;
  }

  const [article] = await db
    .insert(newsTable)
    .values({
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt,
      category: parsed.data.category ?? "Umum",
      imageUrl: parsed.data.imageUrl,
      publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date(),
    })
    .returning();

  res.status(201).json(GetNewsResponse.parse({
    ...article,
    publishedAt: article.publishedAt.toISOString(),
    createdAt: article.createdAt.toISOString(),
  }));
});

router.get("/news/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetNewsParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [article] = await db
    .select()
    .from(newsTable)
    .where(eq(newsTable.id, params.data.id));

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json(GetNewsResponse.parse({
    ...article,
    publishedAt: article.publishedAt.toISOString(),
    createdAt: article.createdAt.toISOString(),
  }));
});

router.patch("/news/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateNewsParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateNewsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.publishedAt) {
    updateData.publishedAt = new Date(parsed.data.publishedAt);
  }

  const [article] = await db
    .update(newsTable)
    .set(updateData)
    .where(eq(newsTable.id, params.data.id))
    .returning();

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json(UpdateNewsResponse.parse({
    ...article,
    publishedAt: article.publishedAt.toISOString(),
    createdAt: article.createdAt.toISOString(),
  }));
});

router.delete("/news/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteNewsParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [article] = await db
    .delete(newsTable)
    .where(eq(newsTable.id, params.data.id))
    .returning();

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
