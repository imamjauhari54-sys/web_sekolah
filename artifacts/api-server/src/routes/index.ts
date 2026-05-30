import { Router, type IRouter } from "express";
import healthRouter from "./health";
import newsRouter from "./news";
import eventsRouter from "./events";
import programsRouter from "./programs";
import galleryRouter from "./gallery";
import contactRouter from "./contact";
import statsRouter from "./stats";
import adminRouter from "./admin";
import schoolProfileRouter from "./school-profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(schoolProfileRouter);
router.use(newsRouter);
router.use(eventsRouter);
router.use(programsRouter);
router.use(galleryRouter);
router.use(contactRouter);
router.use(statsRouter);

export default router;
