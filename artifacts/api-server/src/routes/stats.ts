import { Router, type IRouter } from "express";
import { db, newsTable, eventsTable, programsTable } from "@workspace/db";
import { count } from "drizzle-orm";
import { GetStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [newsCount] = await db.select({ count: count() }).from(newsTable);
  const [eventsCount] = await db.select({ count: count() }).from(eventsTable);
  const [programsCount] = await db.select({ count: count() }).from(programsTable);

  const now = new Date();
  const allEvents = await db.select().from(eventsTable);
  const upcomingEvents = allEvents.filter((e) => e.date >= now);

  const stats = {
    totalStudents: 1250,
    totalTeachers: 87,
    totalPrograms: programsCount.count,
    yearsEstablished: 45,
    recentNewsCount: newsCount.count,
    upcomingEventsCount: upcomingEvents.length,
  };

  res.json(GetStatsResponse.parse(stats));
});

export default router;
