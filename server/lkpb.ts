export const LKPB_SOURCE_URL = "https://docs.google.com/spreadsheets/d/1dv47cVgG4-mCR17HN5tUicViQDiwt-4DUVrMOR97CJE/edit?gid=753848820#gid=753848820";
const ORIGINAL_SAMPLE_ID = "10yajj552DnuKf0-rroYqcdyET60WjTCe58PknW7L6Dw";
const CSV_BASE = "https://docs.google.com/spreadsheets/d";

export type LkpbRecord = { no: number; noDo: string; customer: string; jalurAwal: string; reinstall: string; sla: string; slaDays: number; status: string; category: string; reason: string; year: string; pool: string };
export type PoolSummary = { year: string; pool: string; sourceKey: string; label: string; days: number; lkpb: number; open: number; target: number; real: number; achievement: number };
export type LkpbSource = { sourceKey: string; year: string; pool: string; label: string; spreadsheetId: string; sheetName: string };
export type LkpbDashboard = {
  records: LkpbRecord[]; weekly: Array<{ label: string; range: string; open: number; finish: number }>;
  summary: { total: number; open: number; finish: number; completionRate: number; avgSlaDays: number; overdue: number };
  categories: Array<{ name: string; count: number; percentage: number }>;
  slaBuckets: Array<{ name: string; count: number; percentage: number; tone: "good" | "watch" | "risk" }>;
  poolSummaries: PoolSummary[]; years: string[]; pools: string[]; sources: Array<LkpbSource & { enabled: number }>;
  sourceUrl: string; lastSyncedAt: string; isFallback: boolean;
};

const source = (sourceKey: string, year: string, pool: string, label: string, spreadsheetId: string): LkpbSource => ({ sourceKey, year, pool, label, spreadsheetId, sheetName: "Detail LKPB" });
export const DEFAULT_LKPB_SOURCES: LkpbSource[] = [
  source("2026-master", "2026", "MASTER", "2026 · Detail LKPB master sample", ORIGINAL_SAMPLE_ID),
  source("2025-balikpapan", "2025", "Pool Balikpapan", "Feb 2025 · Pool Balikpapan", "1pGeL6g2oOMsU3SsdvCZGGuBiCYI-97FCKr33T4vJBss"),
  source("2025-banjarmasin", "2025", "Pool Banjarmasin", "Feb 2025 · Pool Banjarmasin", "1KnX9O-nFDX8E-CHCDEBvrFL9KZ_tgQ4sFFwLUevar8U"),
  source("2025-banten", "2025", "Pool Banten", "Feb 2025 · Pool Banten", "1mvqfuSKi5qkfIlCCCXh4GN0m9QRPAdBpjVo50gPJ30M"),
  source("2025-cilegon", "2025", "Pool Cilegon", "Feb 2025 · Pool Cilegon", "17-1sOrw_hJ9ZKEahaGw6PAjQ_z5xjVjbbgJ9RQsPqjo"),
  source("2025-jakarta-barat", "2025", "Pool Jakarta Barat", "Feb 2025 · Pool Jakarta Barat", "1cy62fhHSUVtwrquLv6bY0GF3oOqcKSvoizkqvHjb1vY"),
  source("2025-pontianak", "2025", "Pool Pontianak", "Feb 2025 · Pool Pontianak", "1hqcQV1uLjIvhAv_UYs9oOiZ9eXjAfqOMJXDJlmUKGig"),
  source("2025-samarinda", "2025", "Pool Samarinda", "Feb 2025 · Pool Samarinda", "1A8DTu_vH6cbXKRHW596uRpEpwJpyR8JpmGDhQqS6nbc"),
  source("2025-singkawang", "2025", "Pool Singkawang", "Feb 2025 · Pool Singkawang", "1-9UH4NQ6PLCZTK_CPIzZs9zhczd7gd_7Lv3xM6lgS_U"),
  source("2025-tarakan", "2025", "Pool Tarakan", "Mar 2025 · Pool Tarakan", "11eYfzBgcy5RMrjTzuXgt3xUq6qGVJ8Vxs2HlB6RajoY"),
];

function clean(value: string | undefined) { return (value ?? "").replace(/\u00a0/g, " ").trim(); }
function parseCsv(input: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let i = 0; i < input.length; i += 1) { const char = input[i]; const next = input[i + 1]; if (char === '"') { if (quoted && next === '"') { cell += '"'; i += 1; } else quoted = !quoted; } else if (char === "," && !quoted) { row.push(cell); cell = ""; } else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") i += 1; row.push(cell); if (row.some((v) => v.trim())) rows.push(row); row = []; cell = ""; } else cell += char; }
  if (cell || row.length) { row.push(cell); if (row.some((v) => v.trim())) rows.push(row); } return rows;
}
function number(value: string | undefined) { const result = Number(clean(value).replace(/[^0-9.-]/g, "")); return Number.isFinite(result) ? result : 0; }
function days(value: string) { const match = value.match(/\d+/); return match ? Number(match[0]) : 0; }

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

function parseDetail(rows: string[][], sourceInfo: LkpbSource): { records: LkpbRecord[]; weekly: LkpbDashboard["weekly"] } {
  const headerIndex = rows.findIndex((row) => clean(row[1]).toUpperCase().includes("NO DO") && clean(row[2]).toUpperCase().includes("NAMA CUSTOMER"));
  const records = (headerIndex >= 0 ? rows.slice(headerIndex + 1) : []).filter((row) => /^\d+$/.test(clean(row[0])) && clean(row[1]) && clean(row[2]) && ["OPEN", "FINISH"].includes(clean(row[6]).toUpperCase())).map((row) => ({ no: number(row[0]), noDo: clean(row[1]), customer: clean(row[2]), jalurAwal: clean(row[3]), reinstall: clean(row[4]), sla: clean(row[5]), slaDays: days(clean(row[5])), status: clean(row[6]).toUpperCase(), category: clean(row[7]).toUpperCase(), reason: clean(row[8]), year: sourceInfo.year, pool: sourceInfo.pool }));
  const weeklyHeader = rows.findIndex((row) => clean(row[0]).toUpperCase() === "STATUS" && clean(row[1]).toUpperCase() === "W1");
  if (weeklyHeader < 0) return { records, weekly: [] };
  const weeklyIndexes = [1, 2, 3, 4, 6]; const rangeRow = rows[weeklyHeader + 3] ?? [];
  const weekly = ["W1", "W2", "W3", "W4", "W5"].map((label, index) => { const column = weeklyIndexes[index]; return { label, range: clean(rangeRow[column]) || "—", open: number(rows[weeklyHeader + 1]?.[column]), finish: number(rows[weeklyHeader + 2]?.[column]) }; });
  return { records, weekly };
}

export function parseLkpbCsv(csv: string, sourceInfo: LkpbSource) { const rows = parseCsv(csv); const poolSummary = parseDailyPool(rows, sourceInfo); if (poolSummary) return { records: [] as LkpbRecord[], weekly: [] as LkpbDashboard["weekly"], poolSummary }; const detail = parseDetail(rows, sourceInfo); if (!detail.records.length) throw new Error(`No Detail LKPB records found for ${sourceInfo.label}`); return { ...detail, poolSummary: null }; }
export function __parseLkpbCsvForTests(csv: string) { return parseLkpbCsv(csv, DEFAULT_LKPB_SOURCES[0]); }

function buildDashboard(records: LkpbRecord[], weekly: LkpbDashboard["weekly"], poolSummaries: PoolSummary[], sources: Array<LkpbSource & { enabled: number }>, isFallback = false): LkpbDashboard {
  const total = records.length; const open = records.filter((item) => item.status === "OPEN").length; const finish = records.filter((item) => item.status === "FINISH").length; const categoryMap = new Map<string, number>(); records.forEach((item) => categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + 1));
  const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count, percentage: total ? Math.round((count / total) * 1000) / 10 : 0 })).sort((a, b) => b.count - a.count);
  const defs = [{ name: "< 15 hari", test: (v: number) => v < 15, tone: "good" as const }, { name: "15–29 hari", test: (v: number) => v >= 15 && v < 30, tone: "watch" as const }, { name: "≥ 30 hari", test: (v: number) => v >= 30, tone: "risk" as const }];
  const slaBuckets = defs.map(({ name, test, tone }) => { const count = records.filter((item) => test(item.slaDays)).length; return { name, count, percentage: total ? Math.round((count / total) * 1000) / 10 : 0, tone }; });
  const years = Array.from(new Set(sources.map((item) => item.year))).sort().reverse(); const pools = Array.from(new Set([...records.map((item) => item.pool), ...poolSummaries.map((item) => item.pool)])).sort();
  return { records, weekly, poolSummaries, sources, years, pools, summary: { total, open, finish, completionRate: total ? Math.round((finish / total) * 100) : 0, avgSlaDays: total ? Math.round((records.reduce((sum, item) => sum + item.slaDays, 0) / total) * 10) / 10 : 0, overdue: records.filter((item) => item.status === "OPEN" && item.slaDays >= 30).length }, categories, slaBuckets, sourceUrl: LKPB_SOURCE_URL, lastSyncedAt: new Date().toISOString(), isFallback };
}

export async function getLkpbDashboard() {
  const { ensureLkpbSources } = await import("./db"); const configured = await ensureLkpbSources(); const sources = configured as Array<LkpbSource & { enabled: number }>; const enabledSources = sources.filter((item) => item.enabled === 1); const results = await Promise.allSettled(enabledSources.map(async (item) => { const url = `${CSV_BASE}/${item.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(item.sheetName)}`; const response = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { Accept: "text/csv" } }); if (!response.ok) throw new Error(`${response.status}`); return { item, parsed: parseLkpbCsv(await response.text(), item) }; }));
  const records: LkpbRecord[] = []; let weekly: LkpbDashboard["weekly"] = []; const poolSummaries: PoolSummary[] = []; results.forEach((result) => { if (result.status === "fulfilled") { records.push(...result.value.parsed.records); if (result.value.parsed.weekly.length) weekly = result.value.parsed.weekly; if (result.value.parsed.poolSummary) poolSummaries.push(result.value.parsed.poolSummary); } });
  if (!records.length && !poolSummaries.length) { const fallback = DEFAULT_LKPB_SOURCES[0]; const fallbackRows = await fetch(`${CSV_BASE}/${fallback.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Detail%20LKPB`).then((response) => response.text()).catch(() => ""); try { const parsed = parseLkpbCsv(fallbackRows, fallback); return buildDashboard(parsed.records, parsed.weekly, [], sources, false); } catch { return buildDashboard([], [], [], sources, true); } }
  return buildDashboard(records, weekly, poolSummaries, sources, false);
}
