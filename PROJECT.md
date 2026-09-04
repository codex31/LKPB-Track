# LKPB TRACK Project Guide

Dokumen ini adalah kontrak kerja untuk developer dan AI agent yang berkontribusi pada LKPB TRACK. Baca `README.md` untuk menjalankan aplikasi dan `ARCHITECTURE.md` untuk memahami batas komponen sebelum mengubah kode.

## Prinsip kerja

Aplikasi harus tetap **server-authoritative** untuk spreadsheet, database, dan secret. Client hanya memanggil prosedur tRPC dan tidak boleh mengakses Google Sheets atau membaca credential admin secara langsung. Perubahan harus kecil, dapat diuji, dan mudah di-rollback.

Parser harus tahan terhadap variasi format spreadsheet. Jangan menganggap posisi baris sebagai data valid tanpa memeriksa header. Baris summary, grand total, dan blank row tidak boleh menjadi case LKPB. Jika blok weekly tidak ada, hasil weekly harus kosong, bukan hasil tebakan.

Admin mutation harus tetap memiliki dua lapisan: session signed yang valid dan same-origin request. Jangan mengganti origin check dengan CORS permisif. Jangan menambahkan password fallback untuk memudahkan development.

## Peta file aktif

| Path | Isi |
|---|---|
| `client/src/App.tsx` | Route `/`, `/admin`, dan fallback `/404` |
| `client/src/pages/Home.tsx` | Dashboard utama |
| `client/src/pages/Admin.tsx` | Control Room |
| `client/src/pages/NotFound.tsx` | Fallback route |
| `client/src/components/ui/{button,card,sonner,tooltip}.tsx` | UI primitives yang benar-benar dipakai |
| `client/src/contexts/ThemeContext.tsx` | Theme provider lokal |
| `server/_core/index.ts` | Express entrypoint dan server lifecycle |
| `server/_core/env.ts` | Environment parsing dan validation |
| `server/routers.ts` | tRPC contract, auth boundary, admin mutations |
| `server/adminAuth.ts` | Signed admin session, origin check, scrypt password verification |
| `server/lkpb.ts` | Source registry integration, CSV parser, aggregator |
| `server/db.ts` | Database operations |
| `drizzle/schema.ts` | Database schema |
| `drizzle/*.sql` | Migration history |
| `Dockerfile` | Reproducible production image |
| `docker-compose.yml` | VPS deployment dengan MySQL |

## Workflow perubahan fitur

1. Tulis acceptance criteria yang dapat diverifikasi.
2. Periksa graph import dan schema sebelum menambah file baru.
3. Ubah schema terlebih dahulu jika fitur membutuhkan persistence.
4. Buat migration dengan `pnpm db:generate`, review SQL, lalu jalankan `pnpm db:migrate` pada environment target.
5. Tambahkan helper database di `server/db.ts` dan prosedur tRPC di `server/routers.ts`.
6. Hubungkan UI melalui `trpc.*.useQuery` atau `trpc.*.useMutation`.
7. Tambahkan regression test untuk parser, auth, dan state boundary.
8. Jalankan quality gate lengkap sebelum commit.

## Quality gate

```bash
pnpm check
pnpm test
pnpm build
```

Untuk deployment Docker, jalankan juga:

```bash
docker compose config
# setelah secret tersedia
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:3000/healthz
```

Build warning harus ditinjau. Warning yang menunjukkan placeholder environment, unresolved import, atau asset debug tidak boleh diabaikan. `pnpm test` harus melaporkan seluruh test pass. Jangan menganggap dev server yang sedang hidup sebagai bukti production build valid.

## Testing guidance

Test parser dengan fixture yang mewakili format 2025 pool daily, format 2026 Detail LKPB, summary row, blank row, dan file tanpa weekly block. Test security dengan token valid, token expired, signature tampered, foreign origin, missing origin, dan repeated failed login. Test router mutation dengan request tanpa session dan tanpa same-origin header.

## Deployment guidance

Untuk VPS satu instance, Docker Compose adalah jalur yang disarankan. Gunakan volume database persistent, reverse proxy HTTPS, firewall yang hanya membuka port 80/443, dan backup MySQL berkala. Set `TRUST_PROXY=1` jika terdapat satu reverse proxy. Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan `JWT_SECRET` melalui secret manager atau file environment yang permission-nya ketat.

Jangan commit `.env`, dump database, log runtime, screenshot QA, atau generated `dist/`. Jangan expose port 3306 ke internet. Jalankan migration sebelum service menerima traffic. Setelah deploy, cek `/healthz`, login admin, toggle source secara reversible, dan pastikan dashboard menampilkan source yang enabled.

## Checklist review AI agent

- Apakah perubahan menyentuh file aktif atau hanya template dead code?
- Apakah semua input eksternal divalidasi dan memiliki fallback yang aman?
- Apakah client tetap bebas dari secret dan direct spreadsheet fetch?
- Apakah mutation admin memerlukan session dan origin valid?
- Apakah perubahan memiliki regression test?
- Apakah `pnpm check`, `pnpm test`, dan `pnpm build` lulus?
- Apakah dokumentasi environment dan migration ikut diperbarui?
- Apakah ada file baru yang tidak di-import atau dependency baru yang tidak perlu?

## Prosedur rollback

Rollback kode dilakukan dengan revert commit atau checkpoint WebDev. Rollback schema harus menggunakan migration kompensasi yang eksplisit; jangan menghapus migration yang sudah diterapkan pada production. Sebelum rollback database, backup database terlebih dahulu.

## References

[1]: https://docs.github.com/en/get-started/learning-about-github/github-glossary "GitHub glossary"
[2]: https://pnpm.io/cli/install "pnpm install documentation"
[3]: https://docs.docker.com/engine/containers/start-containers-automatically/ "Docker container restart policies"
