import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, eventsTable } from "@workspace/db";
import {
  ListEventsQueryParams,
  CreateEventBody,
  GetEventParams,
  UpdateEventParams,
  UpdateEventBody,
  DeleteEventParams,
  ListEventsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/events", async (req, res): Promise<void> => {
  const query = ListEventsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let rows = await db.select().from(eventsTable).orderBy(desc(eventsTable.date));

  if (query.data.upcoming === true || (query.data.upcoming as unknown) === "true") {
    const now = new Date();
    rows = rows.filter((r) => r.date >= now);
  }

  res.json(ListEventsResponse.parse(rows.map((r) => ({
    ...r,
    date: r.date.toISOString(),
    endDate: r.endDate ? r.endDate.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }))));
});

router.post("/events", async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!parsed.data.title || !parsed.data.location || !parsed.data.date) {
    res.status(400).json({ error: "title, location and date are required" });
    return;
  }

  const [event] = await db.insert(eventsTable).values({
    title: parsed.data.title,
    location: parsed.data.location,
    date: new Date(parsed.data.date),
    endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    description: parsed.data.description,
    category: parsed.data.category ?? "Umum",
  }).returning();

  res.status(201).json({
    ...event,
    date: event.date.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : null,
    createdAt: event.createdAt.toISOString(),
  });
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetEventParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, params.data.id));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json({
    ...event,
    date: event.date.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : null,
    createdAt: event.createdAt.toISOString(),
  });
});

router.patch("/events/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateEventParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.date) updateData.date = new Date(parsed.data.date);
  if (parsed.data.endDate) updateData.endDate = new Date(parsed.data.endDate);

  const [event] = await db.update(eventsTable).set(updateData).where(eq(eventsTable.id, params.data.id)).returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json({
    ...event,
    date: event.date.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : null,
    createdAt: event.createdAt.toISOString(),
  });
});

router.delete("/events/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteEventParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db.delete(eventsTable).where(eq(eventsTable.id, params.data.id)).returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
