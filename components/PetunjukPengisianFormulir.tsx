'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  HelpCircle,
  Home,
  Hourglass,
  Info,
  Lock,
  Pill,
  Play,
  RotateCw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';
import { FormDetail, PatientProfile, TelehealthConfig } from '@/lib/telehealth-api';

interface PetunjukPengisianFormulirProps {
  config: TelehealthConfig;
  profile: PatientProfile | null;
  formDetail?: FormDetail | null;
  onStartForm: () => void;
  onBack: () => void;
  onOpenHelpdesk?: () => void;
  loading?: boolean;
}

export function PetunjukPengisianFormulir({
  config,
  profile,
  formDetail,
  onStartForm,
  onBack,
  onOpenHelpdesk,
  loading = false,
}: PetunjukPengisianFormulirProps) {
  const [agreed, setAgreed] = useState(false);

  const patientName = profile?.nama || 'Citra Lestari Putri';
  const patientRm = profile?.no_rm || 'RM-2024-004821';

  return (
    <div className="space-y-6 pb-10">
      {/* ------------------------------------------------------------- */}
      {/* 1. Breadcrumb & Endpoint Bar */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[#64748B]">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 hover:text-[#0D9488] transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Beranda</span>
          </button>
          <span className="text-[#CBD5E1]" aria-hidden="true">&gt;</span>
          <span className="hover:text-[#0D9488] cursor-pointer" onClick={onBack}>
            Buat Assessment
          </span>
          <span className="text-[#CBD5E1]" aria-hidden="true">&gt;</span>
          <span className="font-semibold text-[#0F172A]">Petunjuk Pengisian</span>
        </nav>

        {/* Right Status Badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-bold text-[#065F46]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span>FORMULIR AKTIF & TERVALIDASI</span>
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Hero Header Card */}
      {/* ------------------------------------------------------------- */}
      <section
        aria-label="Informasi Formulir Keluhan Pasien"
        className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-7 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/20 shadow-xs">
              <FileSpreadsheet className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488]">
                PROSEDUR PRA-KONSULTASI ELEKTRONIK
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-[#0F172A] leading-tight">
                Formulir Keluhan Pasien Sebelum Konsultasi
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-4xl pt-0.5">
                Sampaikan keluhan utama, riwayat kesehatan, dan obat-obatan yang sedang dikonsumsi sebelum sesi telemedis dokter spesialis untuk mempercepat diagnosis yang tepat dan terukur.
              </p>
            </div>
          </div>

          {/* 4 Meta Metrics Strip */}
          <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-4 border-t border-[#E2E8F0]">
            <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[#0D9488]">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] text-[#64748B] uppercase tracking-wider">Jenis Rekam</span>
                <span className="block truncate text-xs font-bold text-[#0F172A]">Anamnesis Klinis Awal</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[#0D9488]">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] text-[#64748B] uppercase tracking-wider">Estimasi Waktu</span>
                <span className="block truncate text-xs font-bold text-[#0F172A]">5 - 8 Menit</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[#0D9488]">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] text-[#64748B] uppercase tracking-wider">Total Butir</span>
                <span className="block truncate text-xs font-bold text-[#0F172A]">12 Pertanyaan Terarah</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-[#0D9488]">
                <RotateCw className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] text-[#64748B] uppercase tracking-wider">Penyimpanan</span>
                <span className="block truncate text-xs font-bold text-[#0F172A]">Draf Otomatis Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. Two-Column Layout */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column (8 cols): Tujuan & Petunjuk 4 Langkah */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card 1: Tujuan & Manfaat Pengisian Formulir */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
                <h2 className="font-display text-sm font-bold text-[#0F172A]">
                  Tujuan & Manfaat Pengisian Formulir
                </h2>
              </div>
              <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2 py-0.5 text-[11px] font-bold text-[#0F766E]">
                Integrasi Rekam Medis (EMR)
              </span>
            </div>

            <p className="text-xs leading-relaxed text-[#475569]">
              Data keluhan terstruktur ini ditransmisikan secara langsung ke modul Electronic Medical Record (EMR) spesialis penyakit dalam guna memastikan sesi konsultasi video berjalan terarah, mendalam, dan bebas jeda anamnesis berulang.
            </p>

            {/* Doctor Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#0D9488]/30 bg-[#0D9488]/15 text-[#0F766E] font-bold text-sm">
                  RP
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#0F172A]">
                    dr. Raditya Pratama, Sp.PD
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Spesialis Penyakit Dalam • Konsultasi Virtual Terjadwal
                  </p>
                  <p className="flex items-center gap-1.5 text-[10px] text-[#059669] font-medium pt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    <span>Siap Menelaah Berkas • SIP: 446.1/7821-DINKES/2021</span>
                  </p>
                </div>
              </div>

              <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2.5 py-1 text-xs font-bold text-[#0F766E]">
                Dokter Pemeriksa
              </span>
            </div>

            {/* Security & Standard Boxes */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1 text-xs">
              <div className="flex items-start gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3">
                <Lock className="h-4 w-4 text-[#0D9488] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[#0F172A]">Enkripsi Medis End-to-End</span>
                  <p className="text-[11px] leading-relaxed text-[#64748B]">
                    Standar AES-256 terenkripsi saat transit dan penyimpanan riwayat rekam medis.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3">
                <Scale className="h-4 w-4 text-[#0D9488] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[#0F172A]">Standar Kemenkes RI & HIPAA</span>
                  <p className="text-[11px] leading-relaxed text-[#64748B]">
                    Kepatuhan regulasi penyelenggaraan telemedis dan perlindungan data pribadi kesehatan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Petunjuk Pengisian Terstruktur (4 Langkah) */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                SKEMA NAVIGASI DATA
              </span>
              <h2 className="font-display text-base font-bold text-[#0F172A]">
                Petunjuk Pengisian Terstruktur (4 Langkah)
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Berdasarkan panduan standar pengisian formulir keluhan, data dikumpulkan dalam empat segmen klinis berurutan:
              </p>
            </div>

            {/* 4 Step Blocks Grid */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {/* Step 1 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0D9488] text-xs font-bold text-[#FFFFFF]">
                    1
                  </span>
                  <Clock className="h-4 w-4 text-[#0D9488]" />
                </div>
                <h3 className="font-display text-xs font-bold text-[#0F172A]">
                  Keluhan Utama & Kronologi
                </h3>
                <p className="text-[11px] leading-relaxed text-[#64748B]">
                  Deskripsikan gejala yang dirasakan, kapan pertama kali timbul, serta apakah keluhan berlangsung terus-menerus atau hilang timbul.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0D9488] text-xs font-bold text-[#FFFFFF]">
                    2
                  </span>
                  <Activity className="h-4 w-4 text-[#0D9488]" />
                </div>
                <h3 className="font-display text-xs font-bold text-[#0F172A]">
                  Tingkat Nyeri & Lokasi Tubuh
                </h3>
                <p className="text-[11px] leading-relaxed text-[#64748B]">
                  Pilih intensitas skala nyeri visual (NRS 0–10) dan tandai area anatomi tubuh yang menjadi titik utama ketidaknyamanan.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0D9488] text-xs font-bold text-[#FFFFFF]">
                    3
                  </span>
                  <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
                </div>
                <h3 className="font-display text-xs font-bold text-[#0F172A]">
                  Riwayat Penyakit & Alergi
                </h3>
                <p className="text-[11px] leading-relaxed text-[#64748B]">
                  Informasikan riwayat penyakit terdahulu, riwayat kesehatan keluarga, serta reaksi alergi terhadap zat antibiotik atau obat spesifik.
                </p>
              </div>

              {/* Step 4 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0D9488] text-xs font-bold text-[#FFFFFF]">
                    4
                  </span>
                  <Pill className="h-4 w-4 text-[#0D9488]" />
                </div>
                <h3 className="font-display text-xs font-bold text-[#0F172A]">
                  Konsumsi Obat Berjalan
                </h3>
                <p className="text-[11px] leading-relaxed text-[#64748B]">
                  Cantumkan nama suplemen, obat resep, maupun obat bebas yang sedang dikonsumsi dalam kurun waktu 14 hari terakhir.
                </p>
              </div>
            </div>

            {/* Pedoman Integritas & Mekanisme Formulir */}
            <div className="border-t border-[#E2E8F0] pt-4 space-y-2.5">
              <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-[#0D9488]" />
                <span>Pedoman Integritas & Mekanisme Formulir:</span>
              </span>

              <ul className="space-y-2 text-xs text-[#334155]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#059669] shrink-0 mt-0.5" />
                  <span>
                    <strong>Kebenaran Riil:</strong> Jawab seluruh pertanyaan sesuai kondisi fisik aktual yang dirasakan tanpa melebih-lebihkan atau mengurangi keterangan.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#059669] shrink-0 mt-0.5" />
                  <span>
                    <strong>Tanda Bintang (*):</strong> Butir wajib diisi demi kelengkapan anamnesis minimum sebelum tombol kirim terbuka.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none text-[#0D9488] shrink-0 font-bold">🔀</span>
                  <span>
                    <strong>Conditional Logic:</strong> Beberapa pertanyaan spesifik akan muncul otomatis secara dinamis bergantung pada pilihan jawaban Anda sebelumnya.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <RotateCw className="h-3.5 w-3.5 text-[#0D9488] shrink-0 mt-0.5" />
                  <span>
                    <strong>Penyimpanan Draf:</strong> Jawaban tersimpan otomatis setiap perpindahan langkah; Anda dapat kembali kapan saja sebelum submisi final.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="h-3.5 w-3.5 text-[#D97706] shrink-0 mt-0.5" />
                  <span>
                    <strong>Kunci Permanen:</strong> Setelah dikirim final, formulir berstatus <em>Finalized</em> dan tidak dapat diedit kembali demi menjaga integritas data klinis dokter.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Parameter Sesi & Persetujuan Komitmen */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card 1: Parameter Sesi FRM-KELUHAN */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-display text-sm font-bold text-[#0F172A]">Parameter Sesi</h3>
              <span className="font-mono text-xs font-bold text-[#0D9488]">FRM-KELUHAN</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[11px] text-[#64748B]">Nama Pasien:</span>
                <p className="font-bold text-[#0F172A]">{patientName}</p>
                <p className="font-mono text-[11px] text-[#64748B]">No. RM: {patientRm}</p>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0]">
                <span className="text-[11px] text-[#64748B]">Akun Pelapor / Mahasiswa:</span>
                <p className="font-bold text-[#0F172A]">NIM {config.nim}</p>
                <p className="text-[11px] text-[#64748B]">Kelas {config.kelas} - Informatika Medis</p>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B]">Target Durasi Pengerjaan:</span>
                  <span className="text-[10px] text-[#94A3B8]">(Timer aktif saat form dibuka)</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-sm text-[#0F172A]">5 - 8</span>
                  <span className="text-xs text-[#64748B]">Menit</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#E2E8F0]" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                <span className="text-[11px] text-[#64748B]">Status Saat Ini:</span>
                <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2.5 py-0.5 text-[11px] font-bold text-[#0F766E]">
                  Siap Diinisiasi
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Persetujuan & Komitmen (Informed Consent) */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
              <h3 className="font-display text-sm font-bold text-[#0F172A]">
                Persetujuan & Komitmen
              </h3>
            </div>

            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Pernyataan kesediaan pasien sebelum membuka sesi rekaman anamnesis:
            </p>

            {/* Checkbox box */}
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] accent-[#0D9488]"
              />
              <span className="font-medium leading-relaxed">
                Saya telah membaca petunjuk pengisian dan bersedia memberikan informasi klinis yang sebenar-benarnya untuk proses self-assessment pra-konsultasi.
              </span>
            </label>

            {/* Confidentiality note */}
            <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-[11px] text-[#1E40AF] flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Seluruh data dilindungi kerahasiaan medis dan hanya dapat diakses oleh dokter pemeriksa dan tim medis SelfCare ID.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={!agreed || loading}
                onClick={onStartForm}
                className="inline-flex w-full min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-4 py-2.5 text-xs font-bold text-[#FFFFFF] shadow-xs transition-colors hover:bg-[#0F766E] disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#94A3B8]"
              >
                {loading ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
                <span>Mulai Mengisi Formulir</span>
              </button>

              {!agreed && (
                <p className="text-center text-[10px] text-[#94A3B8]">
                  Centang persetujuan di atas untuk membuka formulir.
                </p>
              )}

              <button
                type="button"
                onClick={onBack}
                className="inline-flex w-full min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Dashboard</span>
              </button>
            </div>
          </div>

          {/* Card 3: Help Desk Widget */}
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3.5 flex items-center justify-between text-xs text-[#1D4ED8]">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 shrink-0 text-[#2563EB]" />
              <span className="font-semibold">Butuh bantuan teknis?</span>
            </div>
            <button
              type="button"
              onClick={onOpenHelpdesk}
              className="inline-flex items-center gap-1 font-bold hover:underline"
            >
              <span>Helpdesk</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Pernyataan Medis & Peringatan Gawat Darurat (Red Banner) */}
      {/* ------------------------------------------------------------- */}
      <section
        aria-label="Peringatan gawat darurat medis"
        className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)]"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DC2626] text-[#FFFFFF] shadow-xs">
            <AlertOctagon className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-sm font-bold text-[#991B1B]">
              Pernyataan Medis & Peringatan Gawat Darurat
            </h2>
            <p className="text-xs text-[#991B1B] leading-relaxed">
              Pengisian self-assessment ini <strong className="underline">BUKAN</strong> pengganti diagnosis medis definitif, pemeriksaan fisik langsung secara tatap muka, atau penanganan gawat darurat. Jika Anda mengalami <strong>nyeri dada mendadak yang menjalar, sesak napas berat, kelemahan anggota gerak sebelah sisi, atau penurunan kesadaran</strong>, segera hentikan pengisian ini dan hubungi <strong>Layanan Darurat 119</strong> atau langsung kunjungi <strong>Instalasi Gawat Darurat (IGD)</strong> rumah sakit terdekat.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
