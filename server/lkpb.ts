export const LKPB_SOURCE_URL = "https://docs.google.com/spreadsheets/d/1dv47cVgG4-mCR17HN5tUicViQDiwt-4DUVrMOR97CJE/edit?gid=753848820#gid=753848820";
const ORIGINAL_SAMPLE_ID = "10yajj552DnuKf0-rroYqcdyET60WjTCe58PknW7L6Dw";
const CSV_BASE = "https://docs.google.com/spreadsheets/d";

export type LkpbRecord = { no: number; noDo: string; customer: string; jalurAwal: string; jalurAwalDate: string | null; reinstall: string; sla: string; slaDays: number; status: string; category: string; reason: string; year: string; pool: string; week: number; month: number };
export type PoolSummary = { year: string; pool: string; sourceKey: string; label: string; days: number; lkpb: number; open: number; target: number; real: number; achievement: number };
export type PoolIssue = { pool: string; year: string; total: number; open: number; finish: number; avgSlaDays: number; overdue: number; topCategory: string };
export type LkpbSource = { sourceKey: string; year: string; pool: string; label: string; spreadsheetId: string; sheetName: string };
export type LkpbDashboard = {
  records: LkpbRecord[];
  summary: { total: number; open: number; finish: number; completionRate: number; avgSlaDays: number; overdue: number };
  categories: Array<{ name: string; count: number; percentage: number }>;
  slaBuckets: Array<{ name: string; count: number; percentage: number; tone: "good" | "watch" | "risk" }>;
  poolSummaries: PoolSummary[]; poolIssues: PoolIssue[]; months: number[]; years: string[]; pools: string[]; sources: Array<LkpbSource & { enabled: number }>;
  sourceUrl: string; lastSyncedAt: string; isFallback: boolean;
};

const source = (sourceKey: string, year: string, pool: string, label: string, spreadsheetId: string): LkpbSource => ({ sourceKey, year, pool, label, spreadsheetId, sheetName: "Detail LKPB" });
export const DEFAULT_LKPB_SOURCES: LkpbSource[] = [
  source("2026-master", "2026", "Pool Singkawang", "Sep 2026 · Pool Singkawang", ORIGINAL_SAMPLE_ID),
  source("2025-balikpapan", "2025", "Pool Balikpapan", "Feb 2025 · Pool Balikpapan", "1pGeL6g2oOMsU3SsdvCZGGuBiCYI-97FCKr33T4vJBss"),
  source("2025-banjarmasin", "2025", "Pool Banjarmasin", "Feb 2025 · Pool Banjarmasin", "1KnX9O-nFDX8E-CHCDEBvrFL9KZ_tgQ4sFFwLUevar8U"),
  source("2025-banten", "2025", "Pool Banten", "Feb 2025 · Pool Banten", "1mvqfuSKi5qkfIlCCCXh4GN0m9QRPAdBpjVo50gPJ30M"),
  source("2025-cilegon", "2025", "Pool Cilegon", "Feb 2025 · Pool Cilegon", "17-1sOrw_hJ9ZKEahaGw6PAjQ_z5xjVjbbgJ9RQsPqjo"),
  source("2025-jakarta-barat", "2025", "Pool Jakarta Barat", "Feb 2025 · Pool Jakarta Barat", "1cy62fhHSUVtwrquLv6bY0GF3oOqcKSvoizkqvHjb1vY"),
  source("2025-pontianak", "2025", "Pool Pontianak", "Feb 2025 · Pool Pontianak", "1hqcQV1uLjIvhAv_UYs9oOiZ9eXjAfqOMJXDJlmUKGig"),
  source("2025-samarinda", "2025", "Pool Samarinda", "Feb 2025 · Pool Samarinda", "1A8DTu_vH6cbXKRHW596uRpEpwJpyR8JpmGDhQqS6nbc"),
  source("2025-singkawang", "2025", "Pool Singkawang", "Feb 2025 · Pool Singkawang", "1-9UH4NQ6PLCZTK_CPIzZs9zhczd7gd_7Lv3xM6lgS_U"),
  source("2025-tarakan", "2025", "Pool Tarakan", "Mar 2025 · Pool Tarakan", "11eYfzBgcy5RMrjTzuXgt3xUq6qGVJ8Vxs2HlB6RajoY"),
  // September 2026 — semua pool (diambil dari SUMMARY JALUR DAILY POOL tab 2026)
  source("2026-balikpapan", "2026", "Pool Balikpapan", "Sep 2026 · Pool Balikpapan", "1Bp-mxoU3IWzpn7hx4RyABst-uI0-k_3cX3aCd_Ilw-4"),
  source("2026-banjarmasin", "2026", "Pool Banjarmasin", "Sep 2026 · Pool Banjarmasin", "1KAlfIOcl1jePRNV5G7zkrUDnR3dXL-ogaCAsvv4_Vr4"),
  source("2026-banten", "2026", "Pool Banten", "Sep 2026 · Pool Banten", "1tTTg_kFX4clhHRnX8zh7b32s6MgZJPuo2uQ4M5WGbx4"),
  source("2026-cilegon", "2026", "Pool Cilegon", "Sep 2026 · Pool Cilegon", "1IJax9ePEkoOVHLHh6mS5PsDkR-LLjRqEnGX5sbrX6iw"),
  source("2026-madiun", "2026", "Pool Madiun", "Sep 2026 · Pool Madiun", "1r0TwpG13HbEuZJsRqSsUqaDYBtJ-D5cORSvMLqoliTQ"),
  source("2026-palangkaraya", "2026", "Pool Palangkaraya", "Sep 2026 · Pool Palangkaraya", "1y9W6arr3bfygN1ksyfK_eyXN0PlXPzqb8wZvCcIXd2U"),
  source("2026-pontianak", "2026", "Pool Pontianak", "Sep 2026 · Pool Pontianak", "1vyWNRGsPJ3zxG0_lrDLsAKkXgGCPA8yD2myKyvGFgLQ"),
  source("2026-samarinda", "2026", "Pool Samarinda", "Sep 2026 · Pool Samarinda", "15GXFLwOzGPikKYCiI6vb-4I4Ar9imIYtfu6H_QUJ-bw"),
  source("2026-solo", "2026", "Pool Solo", "Sep 2026 · Pool Solo", "1CyK0AxM1rhc2DK5uazP3cSJRBu_fynu-tSuLJf6jtSU"),
  source("2026-tarakan", "2026", "Pool Tarakan", "Sep 2026 · Pool Tarakan", "1EGC2SkBiR59TooVGqIoRWJOLiLCiiieTVmOw3z3IV8s"),
];

function clean(value: string | undefined) { return (value ?? "").replace(/\u00a0/g, " ").trim(); }
function parseCsv(input: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let i = 0; i < input.length; i += 1) { const char = input[i]; const next = input[i + 1]; if (char === '"') { if (quoted && next === '"') { cell += '"'; i += 1; } else quoted = !quoted; } else if (char === "," && !quoted) { row.push(cell); cell = ""; } else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") i += 1; row.push(cell); if (row.some((v) => v.trim())) rows.push(row); row = []; cell = ""; } else cell += char; }
  if (cell || row.length) { row.push(cell); if (row.some((v) => v.trim())) rows.push(row); } return rows;
}
function number(value: string | undefined) { const result = Number(clean(value).replace(/[^0-9.-]/g, "")); return Number.isFinite(result) ? result : 0; }
function days(value: string) { const match = value.match(/\d+/); return match ? Number(match[0]) : 0; }

const MONTH_ID: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5, jul: 6, agu: 7, sep: 8, okt: 9, nov: 10, des: 11 };
function parseIdDate(value: string): Date | null {
  const s = clean(value); if (!s) return null;
  const m = s.match(/^(\d{1,2})[\s-]+([A-Za-z]+)[\s-]+(\d{4})$/); if (!m) return null;
  const day = Number(m[1]); const month = MONTH_ID[m[2].toLowerCase().slice(0, 3)]; const year = Number(m[3]);
  if (month === undefined || !day) return null;
  return new Date(year, month, day);
}
function monthKey(date: Date): number { return date.getFullYear() * 100 + (date.getMonth() + 1); }
function weekInMonth(date: Date): number {
  const day = date.getDate();
  if (day <= 3) return 1;
  if (day <= 10) return 2;
  if (day <= 17) return 3;
  if (day <= 24) return 4;
  return 5;
}

function parseDailyPool(rows: string[][], sourceInfo: LkpbSource): PoolSummary | null {
  const header = rows.findIndex((row) => clean(row[1]).toLowerCase() === "pool name" && clean(row[3]).toLowerCase() === "tanggal");
  if (header < 0) return null;
  const data = rows.slice(header + 1).filter((row) => /^\d+$/.test(clean(row[0])));
  if (!data.length) return null;
  const lkpb = data.reduce((sum, row) => sum + number(row[17]), 0);
  const open = data.reduce((sum, row) => sum + number(row[14]) + number(row[17]), 0);
  const target = data.reduce((sum, row) => sum + number(row[19]), 0);
  const real = data.reduce((sum, row) => sum + number(row[20]), 0);
  return { year: sourceInfo.year, pool: sourceInfo.pool, sourceKey: sourceInfo.sourceKey, label: sourceInfo.label, days: data.length, lkpb, open, target, real, achievement: target ? Math.round((real / target) * 1000) / 10 : 0 };
}

function parseDetail(rows: string[][], sourceInfo: LkpbSource): { records: LkpbRecord[] } {
  const headerIndex = rows.findIndex((row) => clean(row[1]).toUpperCase().includes("NO DO"));
  if (headerIndex < 0) return { records: [] };
  const header = rows[headerIndex].map((cell) => clean(cell).toUpperCase());
  const statusCol = header.findIndex((cell) => cell === "STATUS");
  const statusIdx = statusCol >= 0 ? statusCol : 6;
  const catIdx = header.findIndex((cell, i) => cell === "KATEGORI LKPB" && i > statusIdx);
  const catIdxFinal = catIdx >= 0 ? catIdx : 7;
  const reasonIdx = Math.max(statusIdx, catIdxFinal) + 1;
  const records = (headerIndex >= 0 ? rows.slice(headerIndex + 1) : []).filter((row) => !clean(row[1]).toUpperCase().startsWith("TOTAL") && clean(row[1]) && ["OPEN", "FINISH"].includes(clean(row[statusIdx]).toUpperCase())).map((row, index) => {
    const jalurAwalDate = parseIdDate(row[3]);
    const slaFromSheet = days(clean(row[5]));
    const slaDays = jalurAwalDate ? Math.max(0, Math.floor((Date.now() - jalurAwalDate.getTime()) / (24 * 60 * 60 * 1000))) : slaFromSheet;
    return {
      no: /^\d+$/.test(clean(row[0])) ? number(row[0]) : index + 1,
      noDo: clean(row[1]),
      customer: clean(row[2]),
      jalurAwal: clean(row[3]),
      jalurAwalDate: jalurAwalDate ? `${jalurAwalDate.getFullYear()}-${String(jalurAwalDate.getMonth() + 1).padStart(2, "0")}-${String(jalurAwalDate.getDate()).padStart(2, "0")}` : null,
      reinstall: clean(row[4]),
      sla: jalurAwalDate ? `${slaDays} Day` : clean(row[5]),
      slaDays,
      status: clean(row[statusIdx]).toUpperCase(),
      category: clean(row[catIdxFinal]).toUpperCase(),
      reason: clean(row[reasonIdx]),
      year: sourceInfo.year,
      pool: sourceInfo.pool,
      week: jalurAwalDate ? weekInMonth(jalurAwalDate) : 0,
      month: jalurAwalDate ? monthKey(jalurAwalDate) : 0,
    };
  });
  return { records };
}

export function parseLkpbCsv(csv: string, sourceInfo: LkpbSource) { const rows = parseCsv(csv); const poolSummary = parseDailyPool(rows, sourceInfo); if (poolSummary) return { records: [] as LkpbRecord[], poolSummary }; const detail = parseDetail(rows, sourceInfo); if (!detail.records.length) throw new Error(`No Detail LKPB records found for ${sourceInfo.label}`); return { ...detail, poolSummary: null }; }
export function __parseLkpbCsvForTests(csv: string) { return parseLkpbCsv(csv, DEFAULT_LKPB_SOURCES[0]); }

function buildDashboard(records: LkpbRecord[], poolSummaries: PoolSummary[], sources: Array<LkpbSource & { enabled: number }>, isFallback = false): LkpbDashboard {
  const total = records.length; const open = records.filter((item) => item.status === "OPEN").length; const finish = records.filter((item) => item.status === "FINISH").length; const categoryMap = new Map<string, number>(); records.forEach((item) => categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + 1));
  const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count, percentage: total ? Math.round((count / total) * 1000) / 10 : 0 })).sort((a, b) => b.count - a.count);
  const defs = [{ name: "< 15 hari", test: (v: number) => v < 15, tone: "good" as const }, { name: "15–29 hari", test: (v: number) => v >= 15 && v < 30, tone: "watch" as const }, { name: "≥ 30 hari", test: (v: number) => v >= 30, tone: "risk" as const }];
  const slaBuckets = defs.map(({ name, test, tone }) => { const count = records.filter((item) => test(item.slaDays)).length; return { name, count, percentage: total ? Math.round((count / total) * 1000) / 10 : 0, tone }; });
  const years = Array.from(new Set(sources.map((item) => item.year))).sort().reverse(); const pools = Array.from(new Set([...records.map((item) => item.pool), ...poolSummaries.map((item) => item.pool)])).sort();
  const months = Array.from(new Set(records.map((item) => item.month).filter((m) => m > 0))).sort();
  const poolMap = new Map<string, LkpbRecord[]>();
  records.forEach((item) => { const arr = poolMap.get(item.pool) ?? []; arr.push(item); poolMap.set(item.pool, arr); });
  const poolIssues: PoolIssue[] = Array.from(poolMap.entries()).map(([pool, items]) => {
    const t = items.length; const o = items.filter((i) => i.status === "OPEN").length; const f = items.filter((i) => i.status === "FINISH").length;
    const overdue = items.filter((i) => i.status === "OPEN" && i.slaDays >= 30).length;
    const avgSlaDays = t ? Math.round((items.reduce((s, i) => s + i.slaDays, 0) / t) * 10) / 10 : 0;
    const catMap = new Map<string, number>(); items.forEach((i) => catMap.set(i.category, (catMap.get(i.category) ?? 0) + 1));
    const topCategory = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return { pool, year: items[0]?.year ?? "", total: t, open: o, finish: f, avgSlaDays, overdue, topCategory };
  }).sort((a, b) => b.open - a.open);
  return { records, poolSummaries, poolIssues, months, sources, years, pools, summary: { total, open, finish, completionRate: total ? Math.round((finish / total) * 100) : 0, avgSlaDays: total ? Math.round((records.reduce((sum, item) => sum + item.slaDays, 0) / total) * 10) / 10 : 0, overdue: records.filter((item) => item.status === "OPEN" && item.slaDays >= 30).length }, categories, slaBuckets, sourceUrl: LKPB_SOURCE_URL, lastSyncedAt: new Date().toISOString(), isFallback };
}

export async function getLkpbDashboard() {
  const { ensureLkpbSources } = await import("./db"); const configured = await ensureLkpbSources(); const sources = configured as Array<LkpbSource & { enabled: number }>; const enabledSources = sources.filter((item) => item.enabled === 1); const results = await Promise.allSettled(enabledSources.map(async (item) => { const url = `${CSV_BASE}/${item.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(item.sheetName)}`; const response = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { Accept: "text/csv" } }); if (!response.ok) throw new Error(`${response.status}`); return { item, parsed: parseLkpbCsv(await response.text(), item) }; }));
  const records: LkpbRecord[] = []; const poolSummaries: PoolSummary[] = []; results.forEach((result) => { if (result.status === "fulfilled") { records.push(...result.value.parsed.records); if (result.value.parsed.poolSummary) poolSummaries.push(result.value.parsed.poolSummary); } });
  if (!records.length && !poolSummaries.length) { const fallback = DEFAULT_LKPB_SOURCES[0]; const fallbackRows = await fetch(`${CSV_BASE}/${fallback.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Detail%20LKPB`).then((response) => response.text()).catch(() => ""); try { const parsed = parseLkpbCsv(fallbackRows, fallback); return buildDashboard(parsed.records, [], sources, false); } catch { return buildDashboard([], [], sources, true); } }
  return buildDashboard(records, poolSummaries, sources, false);
}
