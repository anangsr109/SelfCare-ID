# SelfCare ID TeleHealth — Self-Assessment Terintegrasi

SelfCare ID TeleHealth adalah platform aplikasi web klinis dan sistem *self-assessment* pasien mandiri yang terintegrasi langsung dengan **Telehealth API**. Aplikasi ini dirancang untuk memfasilitasi alur konsultasi virtual, dokumentasi rekam medis elektronik (RME), serta pengisian dan evaluasi formulir triase mandiri pasien.

Proyek ini disusun untuk pemenuhan tugas Ujian Tengah Semester (UTS) mata kuliah Telehealth.

---

## Identitas Mahasiswa

- **NIM:** C2C023109
- **Nama:** Anang Sugeng Riyadi
- **Kelas:** Informatika Kesehatan B
- **Program Studi:** S1 Informatika — Universitas Muhammadiyah Semarang (UNIMUS)

---

## Fitur Utama

### 1. Modul Self-Assessment Telehealth (Integrasi API)
- **Beranda & Profil Pasien:** Menampilkan identitas pasien terdaftar (`/me`), nomor rekam medis (RM), ringkasan statistik laporan, dan peringatan klarifikasi aktif.
- **Persetujuan Medis & Petunjuk:** Alur persetujuan medis (*informed consent*) wajib sebelum memulai pengisian formulir.
- **Pengisian Formulir Bertahap & Logika Dinamis:** Pengisian formulir keluhan (`FRM-KELUHAN`) dan kuesioner pendukung dengan logika syarat tampil (*show_if* condition engine) secara dinamis.
- **Simpan Draf Mandiri:** Mendukung penyimpanan draf sebagian (`simpan_draf`) dan kemampuan melanjutkan pengisian kapan saja.
- **Pemeriksaan Jawaban (/validate):** Validasi otomatis kelengkapan jawaban dan kepatuhan aturan wajib sebelum laporan dikirim ke server.
- **Pengiriman Formulir Resmi:** Submit laporan final ke sistem kesehatan (`kirim`).
- **Skrining Khusus (GAD-7):** Skrining kesehatan mental kecemasan Generalized Anxiety Disorder-7 dengan perhitungan skor otomatis dan interpretasi keparahan.
- **Riwayat & Pelacakan Status:** Pemantauan status laporan real-time (*draft*, *terkirim*, *sedang ditinjau*, *perlu klarifikasi*, *sudah ditinjau*).
- **Tanggapan Klarifikasi:** Antarmuka interaktif bagi pasien untuk menjawab pertanyaan atau klarifikasi dari petugas medis/dosen penilai.
- **Hasil & Tindak Lanjut Medis:** Tinjauan diagnosis kerja, catatan dokter penanggung jawab, serta instruksi rencana tindak lanjut pasca-peninjauan.
- **Pengaturan Akun & Presets Token:** Kemudahan beralih akun pasien secara instan (Pasien P-001, P-002, dan P-003) serta kustomisasi token Bearer dan Base URL.

### 2. Ruang Konsultasi Virtual & Telemetri Real-Time
- Simulasi konsol video-audio telehealth klinis dengan kendali mikrofon, kamera, berbagi layar, dan ruang pesan.
- Visualisasi grafik gelombang telemetri EKG Lead-I dan plethysmograph SpO2 secara langsung.
- Pemantauan 5 tanda vital utama: Detak Jantung, Tekanan Darah, Saturasi SpO2, Laju Pernapasan, dan Suhu Tubuh.

### 3. Rekam Medis Elektronik (RME)
- Ringkasan hasil laboratorium biomarker dan panel metabolik.
- Form pencatatan medis SOAP (*Subjective, Objective, Assessment, Plan*) dengan tanda tangan dokter.
- Modul peresepan dan pemesanan obat (e-Prescription) dengan status pemrosesan farmasi.
- Saluran pesan langsung antara dokter dan pasien.

### 4. Manajemen Antrean & Pemantauan Multi-Pasien
- **Antrean Pasien Virtual:** Filter triase berdasarkan status hemodinamik dan konektivitas ruang konsultasi.
- **Ronde Klinis:** Penjadwalan dan tinjauan kasus medis akademik antar dokter spesialis.

---

## Peringatan Medis

> **PENTING:**  
> *Hasil self-assessment bukan diagnosis. Laporan Anda akan ditinjau oleh tenaga kesehatan.*

---

## Konfigurasi Lingkungan (.env.local)

Berkas konfigurasi terletak pada `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL="https://telehealth.informatikaunimus.site/api"
NEXT_PUBLIC_NIM="C2C023109"
NEXT_PUBLIC_NAMA="Anang Sugeng Riyadi"
NEXT_PUBLIC_KELAS="IK-7B"
NEXT_PUBLIC_DEFAULT_TOKEN="tlh_pasien_e89c3a630df4c65d4d75856ab900959834fd49e2"
```

### Kredensial Token Pasien (Telehealth API v2.0)
- **P-001 (Budi Santoso):** `tlh_pasien_e89c3a630df4c65d4d75856ab900959834fd49e2`
- **P-002 (Siti Aminah):** `tlh_pasien_14e0b0ed213d717074a5503f07253004ae620661`
- **P-003 (Andi Wijaya):** `tlh_pasien_18337a01caa11e8d627efc338033f82e139807df`

---

## Cara Menjalankan Aplikasi

Pastikan Node.js (versi 18 ke atas) telah terpasang pada komputer Anda.

### 1. Memasang Dependensi
```bash
npm install
```

### 2. Menjalankan Server Pengembangan
Jika menggunakan PowerShell di Windows dan menemui kendala script policy, gunakan perintah:
```powershell
npm.cmd run dev
```
Atau jika script execution policy telah diatur ke `RemoteSigned`:
```powershell
npm run dev
```

### 3. Mengakses Aplikasi
Buka peramban (browser) dan akses:
```
http://localhost:3000
```

### 4. Membangun Versi Produksi (Build)
```powershell
npm.cmd run build
npm.cmd run start
```

---

## Tumpukan Teknologi (Tech Stack)

- **Kerangka Kerja:** [Next.js](https://nextjs.org/) 15 (App Router)
- **Library UI:** [React](https://react.dev/) 19 & TypeScript
- **Tata Letak & Gaya:** [Tailwind CSS](https://tailwindcss.com/) v4
- **Ikonografi:** [Lucide React](https://lucide.dev/)
- **Animasi:** [Motion](https://motion.dev/)
- **API Backend:** Telehealth API (Informatika UNIMUS)
