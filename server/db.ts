import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertLkpbSourceSetting, InsertUser, adminSettings, lkpbSourceSettings, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { DEFAULT_LKPB_SOURCES } from './lkpb';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function ensureLkpbSources() {
  const db = await getDb();
  if (!db) return DEFAULT_LKPB_SOURCES.map((source) => ({ ...source, id: 0, enabled: 1 }));
  try {
    for (const source of DEFAULT_LKPB_SOURCES) {
      const values: InsertLkpbSourceSetting = { ...source, enabled: 1 };
      await db.insert(lkpbSourceSettings).values(values).onDuplicateKeyUpdate({ set: { label: source.label, pool: source.pool, year: source.year, spreadsheetId: source.spreadsheetId, sheetName: source.sheetName } });
    }
    return await db.select().from(lkpbSourceSettings);
  } catch (error) {
    console.warn("[Database] Source settings unavailable:", error);
    return DEFAULT_LKPB_SOURCES.map((source) => ({ ...source, id: 0, enabled: 1 }));
  }
}

export async function setLkpbSourceEnabled(sourceKey: string, enabled: boolean) {
  const db = await getDb();
  if (!db) return { sourceKey, enabled: enabled ? 1 : 0 };
  await db.update(lkpbSourceSettings).set({ enabled: enabled ? 1 : 0, updatedAt: new Date() }).where(eq(lkpbSourceSettings.sourceKey, sourceKey));
  const rows = await db.select().from(lkpbSourceSettings).where(eq(lkpbSourceSettings.sourceKey, sourceKey)).limit(1);
  return rows[0];
}

const ADMIN_PW_KEY = "admin_password_hash";

export async function getAdminPasswordHash(): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(adminSettings).where(eq(adminSettings.settingKey, ADMIN_PW_KEY)).limit(1);
  return rows[0]?.settingValue ?? null;
}

export async function setAdminPasswordHash(hash: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const values = { settingKey: ADMIN_PW_KEY, settingValue: hash };
  await db.insert(adminSettings).values(values).onDuplicateKeyUpdate({ set: { settingValue: hash, updatedAt: new Date() } });
}
