import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";

export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "admin";
export const ADMIN_COOKIE = "lkpb_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function secret() {
  return ENV.cookieSecret || "lkpb-track-development-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createAdminToken(now = Date.now()) {
  const payload = `admin:${now + SESSION_TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

export function isAdminSession(req: Request) {
  const raw = req.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE}=`))?.split("=").slice(1).join("=");
  if (!raw) return false;
  const decoded = decodeURIComponent(raw);
  const [payload, signature] = decoded.split(".");
  if (!payload || !signature || !/^admin:\d+$/.test(payload)) return false;
  const expected = sign(payload);
  try {
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  } catch { return false; }
  return Number(payload.split(":")[1]) > Date.now();
}

export function setAdminCookie(res: Response) {
  res.cookie(ADMIN_COOKIE, createAdminToken(), { httpOnly: true, sameSite: "lax", secure: ENV.isProduction, maxAge: SESSION_TTL_MS, path: "/" });
}

export function clearAdminCookie(res: Response) {
  res.clearCookie(ADMIN_COOKIE, { httpOnly: true, sameSite: "lax", secure: ENV.isProduction, path: "/" });
}
