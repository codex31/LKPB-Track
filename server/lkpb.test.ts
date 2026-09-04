import { describe, expect, it } from "vitest";
import { __parseLkpbCsvForTests, DEFAULT_LKPB_SOURCES, parseLkpbCsv } from "./lkpb";

const detailFixture = [
  "SUMMARY DETAIL LKPB",
  "NO,NO DO,NAMA CUSTOMER,TANGGAL JALUR AWAL,TANGGAL REINSTALL,SLA BERJALAN,STATUS,KATEGORI LKPB,REASON",
  '1,5A.XH.000016,MITRA PROPERTI,6 Agu 2026,5 Sep 2026,29 Day,FINISH,CACAT,"KULIT PADA BAGIAN SANDARAN SOFA SOBEK"',
  '2,D7.XF.000605,SOPHIA,21 Agu 2026,20 Sep 2026,14 Day,OPEN,CACAT,"BARANG TUGU MASIH CACAT"',
  '3,5A.XG.000053,GESIA 1,13 Jul 2026,12 Agu 2026,53 Day,OPEN,CACAT VENDOR,"TIDAK ADA CANTOLAN, PART A"',
].join("\n");

const poolFixture = [
  '"No.","Pool Name","Achv","Tanggal","Total Jalur","Total Team","Prod.","Bobot","Pending Resch","Rusong","Tungkom","Brg.","Inst.","Total","Open ","Lanjut Install ","Cancel ","LKPB ","(n/a) ","Instalasi Target","Real."',
  '"1","POOL BALIKPAPAN","100,00%","01 Feb 2025","38","5","8","64","3","-","8","1","-","12","-","1","-","1","-","24","24"',
  '"2","POOL BALIKPAPAN","100,00%","02 Feb 2025","27","4","7","66","3","-","1","-","-","4","-","-","-","1","-","22","22"',
].join("\n");

describe("LKPB sheet parser", () => {
  it("extracts case records with server-computed week, month, and SLA from the Detail LKPB layout", () => {
    const parsed = __parseLkpbCsvForTests(detailFixture);
    expect(parsed.records).toHaveLength(3);
    expect(parsed.records[2]).toMatchObject({ noDo: "5A.XG.000053", customer: "GESIA 1", slaDays: 53, status: "OPEN", category: "CACAT VENDOR", year: "2026", pool: "Pool Singkawang", month: 202607 });
    expect(parsed.records[0]).toMatchObject({ noDo: "5A.XH.000016", week: 2, month: 202608 });
    expect(parsed.records[1]).toMatchObject({ noDo: "D7.XF.000605", week: 4, month: 202608 });
    expect(parsed.records[0].jalurAwalDate).toBe("2026-08-06");
  });

  it("extracts daily pool metrics from 2025 pool spreadsheets", () => {
    const parsed = parseLkpbCsv(poolFixture, DEFAULT_LKPB_SOURCES[1]);
    expect(parsed.records).toHaveLength(0);
    expect(parsed.poolSummary).toMatchObject({ year: "2025", pool: "Pool Balikpapan", days: 2, lkpb: 2, target: 46, real: 46, achievement: 100 });
  });

  it("returns only Detail LKPB records and ignores any weekly block in the sheet", () => {
    const csvWithWeekly = [
      "STATUS,W1,W2,W3,W4,,W5",
      "OPEN,0,0,0,1,,0",
      "FINISH,1,0,0,1,,0",
      ",1-6,7-13,14-20,21-27,,28-31",
      "SUMMARY DETAIL LKPB",
      "NO,NO DO,NAMA CUSTOMER,TANGGAL JALUR AWAL,TANGGAL REINSTALL,SLA BERJALAN,STATUS,KATEGORI LKPB,REASON",
      "1,DO-1,CUSTOMER,1 Sep 2026,2 Sep 2026,1 Day,OPEN,CACAT,REASON",
    ].join("\n");
    const parsed = __parseLkpbCsvForTests(csvWithWeekly);
    expect(parsed.records).toHaveLength(1);
    expect(parsed.records[0]).toMatchObject({ noDo: "DO-1", week: 1, month: 202609 });
  });
});
