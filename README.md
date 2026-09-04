# LKPB TRACK

LKPB TRACK adalah dashboard operasional untuk memantau **Laporan Kerusakan & Penyimpangan Barang (LKPB)**. Aplikasi mengambil data dari tab `Detail LKPB` pada satu atau beberapa Google Spreadsheet, mengagregasikan status, SLA, kategori, tahun, dan pool, lalu menampilkannya melalui dashboard publik. Admin dapat mengaktifkan atau menonaktifkan sumber spreadsheet dari Control Room.

## Kapabilitas

| Area | Kapabilitas |
|---|---|
| Dashboard | KPI total case, status, SLA watchlist, kategori, weekly pulse, pool performance, pencarian, filter tahun/pool |
| Data | Fetch CSV server-side dari Google Sheets, parser multi-format untuk Detail LKPB dan pool daily metrics |
| Admin | Login berbasis server secret, registry source, enable/disable sheet, status database dan sinkronisasi |
| Security | Signed HTTP-only admin cookie, same-origin mutation check, scrypt-hashed password, explicit proxy trust |
| Deployment | Node.js production build, Dockerfile, Docker Compose dengan MySQL dan migration startup |

## Prasyarat

- Node.js 22 atau kompatibel.
- pnpm 10.
- MySQL 8 atau database MySQL-compatible yang mendukung Drizzle ORM.
- Google Spreadsheet yang dapat dibaca melalui endpoint CSV Google Visualization. Spreadsheet harus memiliki tab `Detail LKPB`.

## Menjalankan secara lokal

```bash
pnpm install
# Buat .env lokal sendiri dan isi variabel pada tabel di bawah; jangan commit file ini.
pnpm check
pnpm test
pnpm build
pnpm dev
```

File `.env.local.example` tidak disimpan oleh repository karena secret dikelola oleh environment atau secret manager. Gunakan daftar variabel pada tabel berikut.

| Variabel | Wajib | Keterangan |
|---|---:|---|
| `DATABASE_URL` | Ya | Connection string MySQL, contoh `mysql://user:password@localhost:3306/lkpb` |
| `JWT_SECRET` | Ya | Secret acak panjang untuk session OAuth/admin; wajib pada production |
| `ADMIN_USERNAME` | Ya | Username Control Room |
| `ADMIN_PASSWORD` | Ya | Password Control Room yang kuat |
| `TRUST_PROXY` | Disarankan | Jumlah reverse proxy tepercaya, default `1` production dan `0` development |
| `PORT` | Tidak | Port HTTP, default `3000` |
| `OAUTH_SERVER_URL` | Jika OAuth dipakai | Base URL provider Manus OAuth |
| `VITE_APP_ID` | Jika OAuth dipakai | Application ID OAuth |
| `OWNER_OPEN_ID` | Jika OAuth dipakai | Open ID pemilik aplikasi |
| `BUILT_IN_FORGE_API_URL` | Opsional | Endpoint Forge untuk fitur framework yang digunakan |
| `BUILT_IN_FORGE_API_KEY` | Opsional | API key Forge server-side |

Jalankan migration pada database yang sudah tersedia dengan `pnpm db:migrate`. Untuk membuat migration baru setelah perubahan schema, gunakan `pnpm db:generate`, review SQL yang dihasilkan, kemudian jalankan `pnpm db:migrate`.

## Deployment dengan Docker Compose di VPS

```bash
git clone https://github.com/codex31/LKPB-Track.git
cd LKPB-Track
# Buat file .env secara lokal dan isi secret; jangan commit.
# Isi MYSQL_PASSWORD, MYSQL_ROOT_PASSWORD, JWT_SECRET,
# ADMIN_USERNAME, ADMIN_PASSWORD, serta konfigurasi OAuth bila diperlukan.
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:3000/healthz
```

Compose menjalankan MySQL persistent melalui volume `mysql_data`. Container aplikasi menunggu database sehat, menjalankan `pnpm db:migrate`, lalu menjalankan server production. Letakkan Nginx, Caddy, atau reverse proxy lain di depan port aplikasi dan set `TRUST_PROXY=1` bila hanya ada satu proxy tepercaya. Jangan membuka port MySQL ke internet.

Untuk deployment tanpa Docker, jalankan `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm db:migrate`, lalu `NODE_ENV=production pnpm start`. Gunakan systemd atau supervisor untuk restart otomatis.

## Validasi sebelum merge/deploy

```bash
pnpm check
pnpm test
pnpm build
```

Endpoint `GET /healthz` harus mengembalikan `ok`. Dashboard dapat dibuka pada `/`, sedangkan Control Room berada di `/admin`.

## Struktur ringkas

- `client/`: React/Vite UI.
- `server/`: Express, tRPC, parser Google Sheets, database helper, dan security.
- `drizzle/`: schema serta migration SQL.
- `shared/`: konstanta dan type yang dipakai lintas client/server.
- `Dockerfile` dan `docker-compose.yml`: artefak deployment VPS.
- `ARCHITECTURE.md`: batas komponen dan alur data.
- `PROJECT.md`: panduan kontribusi untuk AI agent dan developer.

## Catatan keamanan

Kredensial admin tidak memiliki fallback. Aplikasi menolak login bila `ADMIN_USERNAME`, `ADMIN_PASSWORD`, atau `JWT_SECRET` belum dikonfigurasi. Jangan menaruh credential pada source code, browser bundle, issue, log, atau repository. Password admin disimpan sebagai hash scrypt di tabel `admin_settings` dan dapat diganti dari Control Room; nilai environment hanya dipakai sebagai seed awal.

## Lisensi

Lisensi belum ditetapkan secara eksplisit. Tambahkan file lisensi sebelum distribusi publik.

## References

[1]: https://docs.docker.com/compose/ "Docker Compose documentation"
[2]: https://orm.drizzle.team/docs/migrations "Drizzle ORM migration documentation"
[3]: https://developers.google.com/sheets/api "Google Sheets API documentation"
