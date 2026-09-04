import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  ExternalLink,
  FileSpreadsheet,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TimerReset,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

type StatusFilter = "ALL" | "OPEN" | "FINISH";

const formatSync = (value: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

const monthLabel = (key: number) => {
  const year = Math.floor(key / 100);
  const month = key % 100;
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric" }).format(date);
};

export default function Home() {
  const { data, isLoading, isFetching, error, refetch } = trpc.lkpb.dashboard.useQuery(undefined, {
    staleTime: 60_000,
  });
  const now = new Date();
  const todayLabel = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(now);
  const greeting = now.getHours() < 11 ? "Good morning" : now.getHours() < 15 ? "Good afternoon" : "Good evening";
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [category, setCategory] = useState("ALL");
  const [year, setYear] = useState("ALL");
  const [pool, setPool] = useState("ALL");
  const [month, setMonth] = useState("ALL");
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  const filteredRecords = useMemo(() => {
    if (!data) return [];
    const keyword = search.toLowerCase().trim();
    return data.records.filter((record) => {
      const matchesStatus = status === "ALL" || record.status === status;
      const matchesCategory = category === "ALL" || record.category === category;
      const matchesYear = year === "ALL" || record.year === year;
      const matchesPool = pool === "ALL" || record.pool === pool;
      const matchesMonth = month === "ALL" || record.month === Number(month);
      const haystack = `${record.noDo} ${record.customer} ${record.reason}`.toLowerCase();
      return matchesStatus && matchesCategory && matchesYear && matchesPool && matchesMonth && (!keyword || haystack.includes(keyword));
    });
  }, [data, status, category, year, pool, month, search]);

  const resetFilters = () => {
    setStatus("ALL");
    setCategory("ALL");
    setYear("ALL");
    setPool("ALL");
    setMonth("ALL");
    setSearch("");
  };

  if (isLoading) return <LoadingScreen />;
  if (error || !data) return <ErrorScreen onRetry={() => refetch()} />;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-[#101b31] text-white transition-transform duration-200 lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[82px] items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5c84b] text-[#12203a] shadow-[0_0_0_5px_rgba(245,200,75,0.12)]">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-[0.08em]">LKPB TRACK</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Operations control</p>
          </div>
          <button onClick={() => setMobileNav(false)} className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden" aria-label="Tutup navigasi"><X className="h-4 w-4" /></button>
        </div>

        <nav className="flex-1 px-3 py-7">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
          <button className="flex w-full items-center gap-3 rounded-xl bg-[#243351] px-3 py-3 text-left text-sm font-semibold text-white shadow-[inset_3px_0_0_#f5c84b]">
            <LayoutDashboard className="h-[18px] w-[18px] text-[#f5c84b]" />
            Overview
          </button>
          <button className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
            <BarChart3 className="h-[18px] w-[18px]" />
            Analytics
            <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-[10px]">Soon</span>
          </button>
          <button className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
            <CircleHelp className="h-[18px] w-[18px]" />
            Help center
          </button>
          <Link href="/admin" className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
            <SlidersHorizontal className="h-[18px] w-[18px]" />
            Admin control
          </Link>
        </nav>

        <div className="border-t border-white/10 p-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between">
              <div><p className="text-xs font-semibold text-slate-300">Source sheet</p><p className="mt-1 text-[11px] text-slate-500">Detail LKPB</p></div>
              <FileSpreadsheet className="h-4 w-4 text-[#f5c84b]" />
            </div>
            <a href={data.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-[#f5c84b] hover:text-white">Open Google Sheet <ExternalLink className="h-3 w-3" /></a>
          </div>
          <p className="mt-5 px-1 text-[10px] leading-4 text-slate-600">Data refresh otomatis dari Google Sheets<br />Last sync {formatSync(data.lastSyncedAt)}</p>
        </div>
      </aside>

      {mobileNav && <button className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setMobileNav(false)} aria-label="Tutup navigasi" />}

      <main className="min-h-screen lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[82px] items-center justify-between border-b border-slate-200/80 bg-[#f5f7fb]/90 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 lg:hidden" aria-label="Buka navigasi"><Menu className="h-4 w-4" /></button>
            <div><p className="text-xs font-medium capitalize text-slate-500">{todayLabel}</p><h1 className="mt-1 text-xl font-bold tracking-tight text-[#101b31] md:text-2xl">{greeting}, Operations team</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live data</span>
            <button onClick={() => refetch()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow md:px-4" aria-label="Refresh data"><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /><span className="hidden md:inline">Refresh</span></button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce9ff] text-xs font-bold text-[#2756a4]">OT</div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-9">
          <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total LKPB" value={data.summary.total} description="Semua laporan tercatat" icon={<FileSpreadsheet />} accent="blue" />
            <KpiCard label="Open cases" value={data.summary.open} description={`${data.summary.overdue} perlu perhatian`} icon={<AlertTriangle />} accent="amber" trend="Prioritas" />
            <KpiCard label="Finish cases" value={data.summary.finish} description={`${data.summary.completionRate}% completion rate`} icon={<CheckCircle2 />} accent="green" trend="On track" />
            <KpiCard label="Average SLA" value={`${data.summary.avgSlaDays}d`} description="Rata-rata hari berjalan" icon={<Clock3 />} accent="violet" />
          </section>

          {data.poolSummaries.length > 0 && <section className="mb-5 glass-panel p-5 md:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Pool performance</p><h2 className="mt-1 text-lg font-bold tracking-tight text-[#101b31]">Daily LKPB by pool</h2><p className="mt-1 text-xs text-slate-400">Aggregate dari source 2025 yang aktif · klik pool untuk memfilter register.</p></div><span className="rounded-lg bg-white/70 px-2.5 py-1.5 text-[10px] font-bold text-[#2c63d6]">{data.poolSummaries.length} active pools</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.poolSummaries.slice(0, 8).map((item) => <button key={item.sourceKey} onClick={() => { setYear(item.year); setPool(item.pool); document.getElementById("detail-table")?.scrollIntoView({ behavior: "smooth" }); }} className="rounded-xl border border-white/80 bg-white/40 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-lg"><div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-bold text-slate-700">{item.pool}</p><span className="text-[10px] font-bold text-[#2c63d6]">{item.achievement}%</span></div><div className="mt-3 flex items-end justify-between"><div><p className="text-xl font-bold tracking-tight text-[#10203b]">{item.lkpb}</p><p className="text-[10px] text-slate-400">LKPB events · {item.days} days</p></div><div className="text-right text-[10px] text-slate-500"><p>Real <strong className="text-slate-700">{item.real}</strong></p><p>Target <strong className="text-slate-700">{item.target}</strong></p></div></div><div className="mt-3 h-1.5 rounded-full bg-white/70"><div className="h-full rounded-full bg-[#2c63d6]" style={{ width: `${Math.min(item.achievement, 100)}%` }} /></div></button>)}</div>{data.poolSummaries.length > 8 && <p className="mt-4 text-center text-[11px] font-semibold text-slate-400">Showing top 8 pools by registry. Use Admin control to manage sources.</p>}</section>}

          <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,27,49,0.04)] md:p-6">
              <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Weekly pulse</p><h2 className="mt-1 text-lg font-bold tracking-tight text-[#101b31]">Progress by week</h2></div><div className="flex items-center gap-2"><select value={month} onChange={(event) => setMonth(event.target.value)} className="h-8 rounded-lg border border-slate-200 bg-[#f8fafc] px-2 text-[11px] font-semibold text-slate-600 outline-none focus:border-[#2c63d6]"><option value="ALL">All months</option>{data.months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}</select><div className="flex items-center gap-3 text-[11px] font-medium text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#f5c84b]" />Open</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#2c63d6]" />Finish</span></div></div></div>
              <div className="mt-8 flex h-[220px] items-end justify-between gap-2 px-1 sm:gap-5">
                {(() => {
                  const sourceRecords = month === "ALL" ? data.records : data.records.filter((r) => r.month === Number(month));
                  const weekMap = new Map<number, { open: number; finish: number }>();
                  sourceRecords.forEach((r) => {
                    if (r.week <= 0) return;
                    const cur = weekMap.get(r.week) ?? { open: 0, finish: 0 };
                    if (r.status === "OPEN") cur.open += 1;
                    if (r.status === "FINISH") cur.finish += 1;
                    weekMap.set(r.week, cur);
                  });
                  const weeks = Array.from(weekMap.keys()).sort((a, b) => a - b);
                  if (!weeks.length) return <p className="w-full text-center text-xs text-slate-400">No weekly data for the selected filter.</p>;
                  const max = Math.max(...weeks.flatMap((w) => [weekMap.get(w)?.open ?? 0, weekMap.get(w)?.finish ?? 0]), 1);
                  return weeks.map((w) => {
                    const week = weekMap.get(w)!;
                    return <div key={w} className="flex h-full flex-1 flex-col items-center justify-end gap-3"><div className="flex h-[170px] w-full max-w-[74px] items-end justify-center gap-1.5"><div className="w-[28%] rounded-t-md bg-[#f5c84b] transition-all" style={{ height: `${Math.max((week.open / max) * 100, week.open ? 8 : 2)}%` }} title={`${week.open} open`} /><div className="w-[28%] rounded-t-md bg-[#2c63d6] transition-all" style={{ height: `${Math.max((week.finish / max) * 100, week.finish ? 8 : 2)}%` }} title={`${week.finish} finish`} /></div><div className="text-center"><p className="text-xs font-bold text-slate-700">Week {w}</p><p className="mt-1 text-[10px] text-slate-400">{week.open + week.finish} cases</p></div></div>;
                  });
                })()}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f7f9fc] px-3 py-2.5 text-xs text-slate-500"><Activity className="h-3.5 w-3.5 text-[#2c63d6]" /> Week number computed from TANGGAL JALUR AWAL (Aug 2 2026 = week 1) · SLA is computed server-side.</div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,27,49,0.04)] md:p-6">
              <div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">SLA health</p><h2 className="mt-1 text-lg font-bold tracking-tight text-[#101b31]">Age distribution</h2></div><TimerReset className="h-5 w-5 text-slate-300" /></div>
              <div className="mt-7 space-y-5">{data.slaBuckets.map((bucket) => <div key={bucket.name}><div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-slate-700">{bucket.name}</span><span className="font-bold text-slate-900">{bucket.count} <span className="font-medium text-slate-400">({bucket.percentage}%)</span></span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${bucket.tone === "good" ? "bg-emerald-500" : bucket.tone === "watch" ? "bg-[#f5c84b]" : "bg-[#ee6f4d]"}`} style={{ width: `${Math.max(bucket.percentage, bucket.count ? 4 : 0)}%` }} /></div></div>)}</div>
              <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#f6df9e] bg-[#fff9e8] p-3.5"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#c29100]" /><p className="text-xs leading-5 text-[#806418]"><strong className="font-bold">Watchlist:</strong> {data.summary.overdue} open case{data.summary.overdue === 1 ? "" : "s"} sudah berjalan ≥ 30 hari.</p></div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,27,49,0.04)] md:p-6"><div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Issue mix</p><h2 className="mt-1 text-lg font-bold tracking-tight text-[#101b31]">LKPB by category</h2></div><span className="rounded-lg bg-[#eef4ff] px-2 py-1 text-[10px] font-bold text-[#2c63d6]">{data.categories.length} categories</span></div><div className="mt-6 space-y-4">{data.categories.map((item, index) => <div key={item.name} className="flex items-center gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${index === 0 ? "bg-[#e6efff] text-[#2c63d6]" : "bg-[#f1f3f7] text-slate-500"}`}>{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-semibold text-slate-700">{item.name}</p><p className="text-xs font-bold text-slate-900">{item.count} <span className="font-medium text-slate-400">({item.percentage}%)</span></p></div><div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#2c63d6]" style={{ width: `${Math.max(item.percentage, 3)}%` }} /></div></div></div>)}</div></div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,27,49,0.04)] md:p-6"><div className="flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Quick view</p><h2 className="mt-1 text-lg font-bold tracking-tight text-[#101b31]">Status overview</h2></div><ArrowUpRight className="h-5 w-5 text-slate-300" /></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#fff9e8] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-[#9a7400]"><span className="h-2 w-2 rounded-full bg-[#f5c84b]" />Open</div><p className="mt-3 text-3xl font-bold tracking-tight text-[#101b31]">{data.summary.open}</p><p className="mt-1 text-[11px] text-slate-500">{data.summary.total ? Math.round((data.summary.open / data.summary.total) * 100) : 0}% of total cases</p></div><div className="rounded-xl bg-[#eef4ff] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-[#2c63d6]"><span className="h-2 w-2 rounded-full bg-[#2c63d6]" />Finish</div><p className="mt-3 text-3xl font-bold tracking-tight text-[#101b31]">{data.summary.finish}</p><p className="mt-1 text-[11px] text-slate-500">{data.summary.completionRate}% completion rate</p></div></div><div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100"><SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" /></span><span className="text-xs font-medium text-slate-600">Need a deeper view?</span></div><button onClick={() => document.getElementById("detail-table")?.scrollIntoView({ behavior: "smooth" })} className="text-xs font-bold text-[#2c63d6] hover:underline">Open table</button></div></div>
          </section>

          {data.poolIssues.length > 0 && <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,27,49,0.04)] md:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Per pool</p><h2 className="mt-1 text-lg font-bold tracking-tight text-[#101b31]">Issue summary per pool</h2><p className="mt-1 text-xs text-slate-400">Klik pool untuk langsung filter ke tabel di bawah.</p></div><span className="rounded-lg bg-white/70 px-2.5 py-1.5 text-[10px] font-bold text-[#2c63d6]">{data.poolIssues.length} pools</span></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs"><thead><tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><th className="py-2 pr-3">Pool</th><th className="py-2 px-3 text-center">Total</th><th className="py-2 px-3 text-center">Open</th><th className="py-2 px-3 text-center">Finish</th><th className="py-2 px-3 text-center">Avg SLA</th><th className="py-2 px-3 text-center">Overdue</th><th className="py-2 pl-3">Top category</th></tr></thead><tbody>{data.poolIssues.map((p) => <tr key={p.pool} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"><td className="py-2.5 pr-3"><button onClick={() => { setPool(p.pool); document.getElementById("detail-table")?.scrollIntoView({ behavior: "smooth" }); }} className="text-left font-semibold text-[#101b31] hover:text-[#2c63d6] hover:underline">{p.pool}</button></td><td className="py-2.5 px-3 text-center font-bold text-slate-700">{p.total}</td><td className="py-2.5 px-3 text-center"><span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${p.open ? "bg-[#fff7dc] text-[#b18300]" : "text-slate-400"}`}>{p.open}</span></td><td className="py-2.5 px-3 text-center"><span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${p.finish ? "bg-[#e6f4ec] text-[#17824d]" : "text-slate-400"}`}>{p.finish}</span></td><td className="py-2.5 px-3 text-center font-medium text-slate-600">{p.avgSlaDays}d</td><td className="py-2.5 px-3 text-center"><span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${p.overdue ? "bg-[#fde4d8] text-[#c64f35]" : "text-slate-400"}`}>{p.overdue}</span></td><td className="py-2.5 pl-3 text-slate-600">{p.topCategory}</td></tr>)}</tbody></table></div></section>}

          <section id="detail-table" className="mt-5 rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,27,49,0.04)]"><div className="border-b border-slate-100 p-5 md:p-6"><div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Case register</p><h2 className="mt-1 text-lg font-bold tracking-tight text-[#101b31]">LKPB detail records</h2><p className="mt-1 text-xs text-slate-400">Showing {filteredRecords.length} of {data.records.length} records</p></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search DO, customer..." className="h-10 w-full rounded-xl border border-slate-200 bg-[#f8fafc] pl-9 pr-3 text-xs outline-none transition focus:border-[#2c63d6] focus:ring-2 focus:ring-[#2c63d6]/10 sm:w-[210px]" /></div><select value={year} onChange={(event) => setYear(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-[#f8fafc] px-3 text-xs font-semibold text-slate-600 outline-none focus:border-[#2c63d6]"><option value="ALL">All years</option>{data.years.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={pool} onChange={(event) => setPool(event.target.value)} className="h-10 max-w-[180px] rounded-xl border border-slate-200 bg-[#f8fafc] px-3 text-xs font-semibold text-slate-600 outline-none focus:border-[#2c63d6]"><option value="ALL">All pools</option>{data.pools.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={month} onChange={(event) => setMonth(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-[#f8fafc] px-3 text-xs font-semibold text-slate-600 outline-none focus:border-[#2c63d6]"><option value="ALL">All months</option>{data.months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="h-10 rounded-xl border border-slate-200 bg-[#f8fafc] px-3 text-xs font-semibold text-slate-600 outline-none focus:border-[#2c63d6]"><option value="ALL">All status</option><option value="OPEN">Open</option><option value="FINISH">Finish</option></select><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-[#f8fafc] px-3 text-xs font-semibold text-slate-600 outline-none focus:border-[#2c63d6]"><option value="ALL">All category</option>{data.categories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select><button onClick={resetFilters} className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50">Reset</button></div></div></div><div className="overflow-x-auto"><table className="w-full min-w-[860px] border-collapse text-left"><thead><tr className="border-b border-slate-100 bg-[#fbfcfe] text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"><th className="px-5 py-3.5 md:px-6">No. DO</th><th className="px-5 py-3.5">Customer</th><th className="px-5 py-3.5">Pool</th><th className="px-5 py-3.5">Jalur awal</th><th className="px-5 py-3.5">Reinstall</th><th className="px-5 py-3.5">SLA</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Category</th><th className="px-5 py-3.5">Reason</th></tr></thead><tbody>{filteredRecords.map((record) => <tr key={`${record.no}-${record.noDo}`} className="border-b border-slate-50 last:border-0 hover:bg-[#fbfcff]"><td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-[#2c63d6] md:px-6">{record.noDo}</td><td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-700">{record.customer}</td><td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-slate-500">{record.pool}</td><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{record.jalurAwal}</td><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{record.reinstall}</td><td className="whitespace-nowrap px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold ${record.slaDays >= 30 ? "bg-[#fff0ed] text-[#c64f35]" : record.slaDays >= 15 ? "bg-[#fff9e8] text-[#a17800]" : "bg-[#eaf8f1] text-[#17824d]"}`}><Clock3 className="h-3 w-3" />{record.sla}</span></td><td className="whitespace-nowrap px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-bold ${record.status === "OPEN" ? "text-[#ad7d00]" : "text-[#18834d]"}`}><span className={`h-1.5 w-1.5 rounded-full ${record.status === "OPEN" ? "bg-[#f5c84b]" : "bg-emerald-500"}`} />{record.status}</span></td><td className="whitespace-nowrap px-5 py-4"><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-wide text-slate-600">{record.category}</span></td><td className="max-w-[260px] truncate px-5 py-4 text-xs text-slate-500" title={record.reason}>{record.reason}</td></tr>)}</tbody></table>{filteredRecords.length === 0 && <div className="px-6 py-12 text-center"><Search className="mx-auto h-6 w-6 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">Tidak ada record yang cocok</p><button onClick={resetFilters} className="mt-2 text-xs font-bold text-[#2c63d6] hover:underline">Reset filter</button></div>}</div><div className="flex flex-col items-start justify-between gap-3 border-t border-slate-100 px-5 py-4 text-[11px] text-slate-400 sm:flex-row sm:items-center md:px-6"><span>Source: Google Sheets / Detail LKPB</span><a href={data.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-semibold text-[#2c63d6] hover:underline">View source sheet <ExternalLink className="h-3 w-3" /></a></div></section>
          <p className="mt-7 text-center text-[11px] text-slate-400">LKPB TRACK · Internal operations dashboard · Data refresh {formatSync(data.lastSyncedAt)}</p>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ label, value, description, icon, accent, trend }: { label: string; value: string | number; description: string; icon: React.ReactNode; accent: "blue" | "amber" | "green" | "violet"; trend?: string }) {
  const styles = { blue: "bg-[#eaf1ff] text-[#2c63d6]", amber: "bg-[#fff7dc] text-[#b18300]", green: "bg-[#e8f8ef] text-[#17824d]", violet: "bg-[#f1ecff] text-[#7555c7]" };
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,27,49,0.04)]"><div className="flex items-start justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[accent]}`}>{icon}</div>{trend && <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400">{trend}</span>}</div><p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p><p className="mt-1 text-[28px] font-bold tracking-tight text-[#101b31]">{value}</p><p className="mt-1 text-xs text-slate-400">{description}</p></div>;
}

function LoadingScreen() { return <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#2c63d6]" /><p className="mt-4 text-sm font-semibold text-slate-600">Loading LKPB data...</p><p className="mt-1 text-xs text-slate-400">Syncing with Google Sheets</p></div></div>; }
function ErrorScreen({ onRetry }: { onRetry: () => void }) { return <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] p-6"><div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><AlertTriangle className="mx-auto h-8 w-8 text-[#c64f35]" /><h1 className="mt-4 text-lg font-bold text-[#101b31]">Data belum bisa dimuat</h1><p className="mt-2 text-sm leading-6 text-slate-500">Periksa koneksi ke Google Sheets, lalu coba refresh kembali.</p><button onClick={onRetry} className="mt-5 rounded-xl bg-[#2c63d6] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#2453b6]">Try again</button></div></div>; }
