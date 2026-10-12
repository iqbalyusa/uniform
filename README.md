# Pribadi · Manajemen Seragam

Aplikasi persediaan seragam bersama untuk SD, SMP, dan SMA Pribadi. Antarmuka berbahasa Indonesia, ringkas, dengan matriks ukuran dan pencatatan cepat.

## Menjalankan lokal

Gunakan Node.js 22.13 atau lebih baru, lalu:

```sh
npm ci
npm run build
npm run dev
```

Buka http://127.0.0.1:5173. Pratinjau hanya mendengarkan loopback dan langsung membuka mode bersama tanpa akun aplikasi. Database SQLite tersimpan di `.sites-runtime/preview.sqlite`; data pratinjau tidak masuk paket penerbitan. Setelah mengubah kode, jalankan build dan mulai ulang pratinjau.

```sh
npm test
npx tsc --noEmit
```

## Hosting dan akses

Versi online memakai Cloudflare Worker, database D1 bersama, serta **Sign in with ChatGPT** yang dikelola Sites. Build menggunakan esbuild; paket distribusi ada di `dist`. Manifest `.openai/hosting.json` mengikat situs dan database. Migrasi SQL berurutan ada di `drizzle` dan disertakan pada paket penerbitan.

Pengelolaan akun aplikasi **dinonaktifkan sementara** melalui `accountsEnabled = false` di `lib/access.ts`. Semua pengunjung yang dapat membuka situs bisa mencatat penerimaan, pengeluaran, penyesuaian, impor, cadangan, dan pengaturan stok tanpa mendaftarkan petugas. Halaman Petugas & akses disembunyikan dan endpoint pengelolaan anggota dinonaktifkan. Daftar anggota lama, termasuk Rahma dan Afro, tetap tersimpan; ubah flag menjadi `true`, build, lalu deploy untuk mengaktifkan kembali aturan akun dan peran sebelumnya.

Situs tetap **privat di Sites**. Akses hosting masih memerlukan akun ChatGPT yang diizinkan pemilik. Mode bersama ini tidak mengubah daftar akses hosting atau mengirim undangan.

## Aturan stok

- 21 seragam tetap: 12 nasional per jenjang dan 9 seragam dengan persediaan bersama.
- Ukuran lama 0 serta 1–2 sampai 29–30 dan ukuran baru 0–15 memakai persediaan terpisah.
- Penerimaan baru hanya ke ukuran Baru. Pengeluaran dapat memakai stok Lama hingga habis.
- Pengeluaran wajib memiliki nama siswa dan kelas. Penyesuaian wajib memiliki alasan.
- Jumlah harus bilangan bulat; stok tidak boleh negatif. Permintaan berulang memakai ID yang sama untuk menghindari pencatatan ganda. Perubahan bersamaan diperiksa secara atomik di database.
- Riwayat baru pada mode bersama memakai label **Pengunjung tanpa akun**, waktu, dan nilai sebelum/sesudah. Riwayat lama mempertahankan nama asli. Riwayat tidak dapat diubah atau dihapus melalui aplikasi.
- Stok kosong ditampilkan terpisah dari stok menipis. Batas menipis dapat diatur, awalnya 5 pcs.

## Impor, ekspor, dan cadangan

Impor `.xlsx`, CSV, atau JSON sampai 5 MB. Pilih lembar, baris judul, bentuk tabel, dan pemetaan kolom; periksa pratinjau sebelum menerapkan. Mode penggantian hanya mengubah kombinasi yang tercantum pada berkas. Data yang tidak tercantum tetap ada. Perubahan stok setelah pratinjau mengharuskan pratinjau ulang. Impor membuat cadangan otomatis data sebelumnya dan menyimpan rincian perubahan.

Cadangan JSON mencakup stok dan riwayat. Riwayat dari prototype/berkas lama disimpan sebagai arsip sumber, tanpa mengatasnamakan akun pengguna baru. Ekspor stok dan riwayat menggunakan Excel.

Repositori publik ini hanya berisi kode aplikasi dan migrasi skema. Data stok operasional, database lokal, ekspor inventaris, dan migrasi impor workbook tidak disertakan. Aplikasi dimulai dengan saldo kosong; impor stok nyata melalui halaman Impor & cadangan pada hosting privat. Manifest belum diikat ke proyek Sites tertentu.

## Struktur

`app/uniform-app.tsx` dan `app/import-panel.tsx` berisi UI; `lib/server.ts` menangani izin dan transaksi; `worker/index.ts` menangani HTTP; `db/schema.ts` dan `drizzle` berisi skema/migrasi. `tests` menguji aturan stok, akses, transaksi bersamaan, dan impor. `PRODUCT.md` dan `DESIGN.md` merekam konteks produk dan sistem desain.
