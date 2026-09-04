import { describe, expect, it } from "vitest";
import { __parseLkpbCsvForTests } from "./lkpb";

const fixture = [
  "STATUS,W1,W2,W3,W4,,W5",
  "OPEN,0,0,0,1,,0",
  "FINISH,1,0,0,1,,0",
  ",1-6,7-13,14-20,21-27,,28-31",
  "SUMMARY DETAIL LKPB",
  "NO,NO DO,NAMA CUSTOMER,TANGGAL JALUR AWAL,TANGGAL REINSTALL,SLA BERJALAN,STATUS,KATEGORI LKPB,REASON",
  '1,5A.XH.000016,MITRA PROPERTI,6 Agu 2026,5 Sep 2026,29 Day,FINISH,CACAT,"KULIT PADA BAGIAN SANDARAN SOFA SOBEK"',
  '2,D7.XF.000605,SOPHIA,21 Agu 2026,20 Sep 2026,14 Day,OPEN,CACAT,"BARANG TUGU MASIH CACAT"',
  '3,5A.XG.000053,GESIA 1,13 Jul 2026,12 Agu 2026,53 Day,OPEN,CACAT VENDOR,"TIDAK ADA CANTOLAN, PART A"',
].join("\n");

describe("LKPB sheet parser", () => {
  it("extracts case records and weekly status from the Detail LKPB layout", () => {
    const dashboard = __parseLkpbCsvForTests(fixture);

    expect(dashboard.records).toHaveLength(3);
    expect(dashboard.records[2]).toMatchObject({
      noDo: "5A.XG.000053",
      customer: "GESIA 1",
      slaDays: 53,
      status: "OPEN",
      category: "CACAT VENDOR",
    });
    expect(dashboard.summary).toMatchObject({ total: 3, open: 2, finish: 1, completionRate: 33, overdue: 1 });
    expect(dashboard.weekly[0]).toEqual({ label: "W1", range: "1-6", open: 0, finish: 1 });
    expect(dashboard.categories).toEqual([
      { name: "CACAT", count: 2, percentage: 66.7 },
      { name: "CACAT VENDOR", count: 1, percentage: 33.3 },
    ]);
    expect(dashboard.slaBuckets.map((bucket) => bucket.count)).toEqual([1, 1, 1]);
  });
});
