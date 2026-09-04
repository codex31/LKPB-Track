export const LKPB_SOURCE_URL =
  "https://docs.google.com/spreadsheets/d/10yajj552DnuKf0-rroYqcdyET60WjTCe58PknW7L6Dw/edit?usp=drivesdk";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/10yajj552DnuKf0-rroYqcdyET60WjTCe58PknW7L6Dw/gviz/tq?tqx=out:csv&sheet=Detail%20LKPB";

type LkpbRecord = {
  no: number;
  noDo: string;
  customer: string;
  jalurAwal: string;
  reinstall: string;
  sla: string;
  slaDays: number;
  status: "OPEN" | "FINISH" | string;
  category: string;
  reason: string;
};

type WeekSummary = {
  label: string;
  range: string;
  open: number;
  finish: number;
};

export type LkpbDashboard = {
  records: LkpbRecord[];
  weekly: WeekSummary[];
  summary: {
    total: number;
    open: number;
    finish: number;
    completionRate: number;
    avgSlaDays: number;
    overdue: number;
  };
  categories: Array<{ name: string; count: number; percentage: number }>;
  slaBuckets: Array<{ name: string; count: number; percentage: number; tone: "good" | "watch" | "risk" }>;
  sourceUrl: string;
  lastSyncedAt: string;
  isFallback: boolean;
};

function clean(value: string | undefined) {
  return (value ?? "").replace(/\u00a0/g, " ").trim();
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }
  return rows;
}

function parseDays(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

const fallbackRecords: LkpbRecord[] = [
  { no: 1, noDo: "5A.XH.000016", customer: "MITRA PROPERTI", jalurAwal: "6 Agu 2026", reinstall: "5 Sep 2026", sla: "29 Day", slaDays: 29, status: "FINISH", category: "CACAT", reason: "KULIT PADA BAGIAN SANDARAN SOFA SOBEK" },
  { no: 2, noDo: "D7.XF.000605", customer: "SOPHIA", jalurAwal: "21 Agu 2026", reinstall: "20 Sep 2026", sla: "14 Day", slaDays: 14, status: "OPEN", category: "CACAT", reason: "BARANG TUGU MASIH CACAT" },
  { no: 3, noDo: "5A.XH.000057", customer: "RUDI", jalurAwal: "21 Agu 2026", reinstall: "24 Agu 2026", sla: "14 Day", slaDays: 14, status: "FINISH", category: "CACAT", reason: "SUDUT PINTU PENYOK" },
  { no: 4, noDo: "5A.XG.000115", customer: "HENY", jalurAwal: "25 Jul 2026", reinstall: "31 Agu 2026", sla: "41 Day", slaDays: 41, status: "FINISH", category: "CACAT", reason: "BAGIAN DEPAN SOFA SOBEK" },
  { no: 5, noDo: "5A.XG.000053", customer: "GESIA 1", jalurAwal: "13 Jul 2026", reinstall: "12 Agu 2026", sla: "53 Day", slaDays: 53, status: "OPEN", category: "CACAT VENDOR", reason: "TIDAK ADA CANTOLAN UNTUK AMBALAN BAWAH DI PART A" },
  { no: 6, noDo: "5A.XG.000076", customer: "ROSNAZIZI", jalurAwal: "18 Jul 2026", reinstall: "30 Sep 2026", sla: "48 Day", slaDays: 48, status: "OPEN", category: "CACAT", reason: "BAGIAN BAWAH DIPAN SOBEK" },
];

function buildDashboard(records: LkpbRecord[], weekly: WeekSummary[], isFallback: boolean): LkpbDashboard {
  const total = records.length;
  const open = records.filter((item) => item.status === "OPEN").length;
  const finish = records.filter((item) => item.status === "FINISH").length;
  const categoryMap = new Map<string, number>();
  records.forEach((record) => categoryMap.set(record.category, (categoryMap.get(record.category) ?? 0) + 1));
  const categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count, percentage: total ? Math.round((count / total) * 1000) / 10 : 0 }))
    .sort((a, b) => b.count - a.count);

  const bucketDefs = [
    { name: "< 15 hari", test: (days: number) => days < 15, tone: "good" as const },
    { name: "15–29 hari", test: (days: number) => days >= 15 && days < 30, tone: "watch" as const },
    { name: "≥ 30 hari", test: (days: number) => days >= 30, tone: "risk" as const },
  ];
  const slaBuckets = bucketDefs.map(({ name, test, tone }) => {
    const count = records.filter((record) => test(record.slaDays)).length;
    return { name, count, percentage: total ? Math.round((count / total) * 1000) / 10 : 0, tone };
  });

  return {
    records,
    weekly,
    summary: {
      total,
      open,
      finish,
      completionRate: total ? Math.round((finish / total) * 100) : 0,
      avgSlaDays: total ? Math.round((records.reduce((sum, record) => sum + record.slaDays, 0) / total) * 10) / 10 : 0,
      overdue: records.filter((record) => record.slaDays >= 30 && record.status === "OPEN").length,
    },
    categories,
    slaBuckets,
    sourceUrl: LKPB_SOURCE_URL,
    lastSyncedAt: new Date().toISOString(),
    isFallback,
  };
}

function parseSheet(csv: string): LkpbDashboard {
  const rows = parseCsv(csv);
  const headerIndex = rows.findIndex((row) => clean(row[1]).toUpperCase().includes("NO DO") && clean(row[2]).toUpperCase().includes("NAMA CUSTOMER"));
  const records = (headerIndex >= 0 ? rows.slice(headerIndex + 1) : [])
    .filter((row) => /^\d+$/.test(clean(row[0])))
    .map((row) => ({
      no: Number(clean(row[0])),
      noDo: clean(row[1]),
      customer: clean(row[2]),
      jalurAwal: clean(row[3]),
      reinstall: clean(row[4]),
      sla: clean(row[5]),
      slaDays: parseDays(clean(row[5])),
      status: clean(row[6]).toUpperCase(),
      category: clean(row[7]).toUpperCase(),
      reason: clean(row[8]),
    }));

  const weeklyHeader = rows.findIndex((row) => clean(row[0]).toUpperCase() === "STATUS" && clean(row[1]).toUpperCase() === "W1");
  const rangeRow = weeklyHeader >= 0 ? rows[weeklyHeader + 3] : [];
  const weeklyIndexes = [1, 2, 3, 4, 6];
  const weekly = ["W1", "W2", "W3", "W4", "W5"].map((label, index) => {
    const columnIndex = weeklyIndexes[index];
    return {
    label,
    range: clean(rangeRow[columnIndex]) || "—",
    open: Number(clean(rows[weeklyHeader + 1]?.[columnIndex])) || 0,
    finish: Number(clean(rows[weeklyHeader + 2]?.[columnIndex])) || 0,
    };
  });

  if (!records.length) throw new Error("No LKPB records found in sheet");
  return buildDashboard(records, weekly, false);
}

export async function getLkpbDashboard(): Promise<LkpbDashboard> {
  try {
    const response = await fetch(CSV_URL, { signal: AbortSignal.timeout(8000), headers: { Accept: "text/csv" } });
    if (!response.ok) throw new Error(`Google Sheets returned ${response.status}`);
    return parseSheet(await response.text());
  } catch (error) {
    console.warn("[LKPB] Falling back to sample data:", error);
    return buildDashboard(fallbackRecords, [
      { label: "W1", range: "1–6", open: 0, finish: 1 },
      { label: "W2", range: "7–13", open: 0, finish: 0 },
      { label: "W3", range: "14–20", open: 0, finish: 0 },
      { label: "W4", range: "21–27", open: 1, finish: 1 },
      { label: "W5", range: "28–31", open: 0, finish: 0 },
    ], true);
  }
}

export function __parseLkpbCsvForTests(csv: string) {
  return parseSheet(csv);
}
