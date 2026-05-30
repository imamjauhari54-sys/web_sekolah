import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use((req: Request, res: Response, next) => {
  logger.info({ method: req.method, url: req.url?.split("?")[0] });
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser(process.env["SESSION_SECRET"] ?? "fallback-secret"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
