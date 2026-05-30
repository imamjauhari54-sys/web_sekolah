import { Router, type IRouter } from "express";
import crypto from "node:crypto";

const router: IRouter = Router();

function makeToken(secret: string): string {
  return crypto.createHmac("sha256", secret).update("sma-nusantara-admin").digest("hex");
}

router.post("/admin/login", (req, res): void => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env["ADMIN_PASSWORD"] ?? "admin123";

  if (!password || password !== adminPassword) {
    res.status(401).json({ error: "Password salah." });
    return;
  }

  const secret = process.env["SESSION_SECRET"] ?? "fallback-secret";
  const token = makeToken(secret);

  res.cookie("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({ ok: true });
});

router.get("/admin/check", (req, res): void => {
  const secret = process.env["SESSION_SECRET"] ?? "fallback-secret";
  const expected = makeToken(secret);
  const actual = (req.cookies as Record<string, string | undefined>)["admin_token"];

  if (actual !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json({ ok: true });
});

router.post("/admin/logout", (_req, res): void => {
  res.clearCookie("admin_token", { path: "/" });
  res.json({ ok: true });
});

export default router;
