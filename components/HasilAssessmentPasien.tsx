'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  FileText,
  CheckCircle2,
  User,
  Clock,
  Stethoscope,
  Download,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  Copy,
  CheckCheck,
  Thermometer,
  Scale,
  Pill,
  HeartPulse,
  Phone,
  FileCheck,
  Eye,
  Info,
} from 'lucide-react';
import {
  AssessmentDetail,
  PatientProfile,
  TelehealthConfig,
} from '@/lib/telehealth-api';
import { formatIndonesianDateTime, getRelativeTimeAgo } from '@/lib/realtime-date';

interface HasilAssessmentPasienProps {
  assessmentId?: string;
  detail?: AssessmentDetail | null;
  profile?: PatientProfile | null;
  config: TelehealthConfig;
  onBackToHistory: () => void;
  onTrackStatus: (id: string) => void;
  onOpenTindakLanjut?: (id: string) => void;
  onDownloadPdf?: () => void;
}

export const HasilAssessmentPasien: React.FC<HasilAssessmentPasienProps> = ({
  assessmentId = 'ASM-2024-89012',
  detail,
  profile,
  config,
  onBackToHistory,
  onTrackStatus,
  onOpenTindakLanjut,
  onDownloadPdf,
}) => {
  const [copied, setCopied] = useState(false);

  const displayId = detail?.id || assessmentId || 'ASM-2024-89012';
  const patientName = profile?.nama || config.nama || 'Citra Lestari Putri';
  const patientNim = config.nim || 'B2A021045';
  const patientRm = profile?.no_rm || 'RM-2024-004821';

  const handleCopyId = () => {
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (onDownloadPdf) {
      onDownloadPdf();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* 1. Breadcrumbs & Compliant Badges Row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            type="button"
            onClick={onBackToHistory}
            className="text-slate-500 hover:text-slate-800 transition-colors"
          >
            Beranda
          </button>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <button
            type="button"
            onClick={onBackToHistory}
            className="text-slate-500 hover:text-slate-800 transition-colors"
          >
            Riwayat Assessment
          </button>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="font-semibold text-slate-800">
            Hasil Assessment ({displayId})
          </span>
        </nav>

        {/* Security & Standard Badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
            <Lock className="h-3 w-3" />
            EHR-HL7 COMPLIANT
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <ShieldCheck className="h-3 w-3" />
            AES-256 ENCRYPTED
          </span>
        </div>
      </div>

      {/* 2. Main Title Banner & Header Info Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            {/* Top ID Line */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900">
                {displayId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {copied ? (
                  <CheckCheck className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              <span className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
                Terkirim & Menunggu Peninjauan Medis
              </span>
              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                HASIL REKAM ELEKTRONIK
              </span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Hasil Assessment Pasien
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Ringkasan data klinis mandiri yang diserahkan pasien sebelum telekonsultasi dokter spesialis.
            </p>
          </div>

          {/* Status Dokumen Klinis Box */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs space-y-1 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              STATUS DOKUMEN KLINIS
            </div>
            <div className="text-xs text-slate-800 font-semibold">
              Tersimpan di Rekam Medis Elektronik
            </div>
            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span>Tervalidasi &amp; Siap Ditelaah Dokter</span>
            </div>
          </div>
        </div>

        {/* Bottom Meta Row & Download Button */}
        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8 text-xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                FORMULIR SUMBER
              </div>
              <div className="mt-0.5 font-bold text-slate-900 text-sm">
                FRM-KELUHAN
              </div>
              <div className="text-slate-400 text-[11px]">Keluhan Pra-Konsultasi</div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                WAKTU SUBMIT
              </div>
              <div className="mt-0.5 font-bold text-slate-900 text-sm">
                {detail?.dibuat_pada ? formatIndonesianDateTime(detail.dibuat_pada) : getRelativeTimeAgo(50)}
              </div>
              <div className="text-slate-400 text-[11px]">Disinkronisasi Cloud Medis</div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DOKTER PEMERIKSA
              </div>
              <div className="mt-0.5 font-bold text-slate-900 text-sm">
                dr. Tirta Wijaya, Sp.PD
              </div>
              <div className="text-slate-400 text-[11px]">Spesialis Penyakit Dalam</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Unduh Resume (PDF)</span>
          </button>
        </div>
      </div>

      {/* 3. Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Sidebar Metrics & Patient Demographics (4 cols) */}
        {/* ========================================================= */}
        <div className="space-y-4 lg:col-span-4">
          {/* Card: Validasi Formulir */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-slate-500" />
                <h3 className="font-bold text-sm text-slate-900">Validasi Formulir</h3>
              </div>
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                Lengkap 100%
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="py-2 text-center">
              <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border-8 border-teal-50 bg-[#F0FDFA]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#0F766E]">100%</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    TERVALIDASI EHR
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed px-2">
                Seluruh 12 pertanyaan klinis wajib telah terverifikasi sistem tanpa anomali format.
              </p>
            </div>

            {/* Stat Rows */}
            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pertanyaan Wajib Terisi:</span>
                <span className="font-bold text-slate-900">12 / 12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pertanyaan Wajib Belum Diisi:</span>
                <span className="font-bold text-emerald-700">0 (Nol)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pertanyaan Opsional:</span>
                <span className="font-bold text-slate-900">0 (Semua terisi)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Integritas Skema:</span>
                <span className="font-mono text-emerald-700 font-bold">JSON Schema OK</span>
              </div>
            </div>
          </div>

          {/* Card: Identitas Pasien */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-sm text-teal-800">
                CL
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{patientName}</h3>
                <p className="font-mono text-xs text-slate-400">No. RM: {patientRm}</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">NIM Akademik:</span>
                <span className="font-mono font-bold text-slate-900">{patientNim}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Usia & Gender:</span>
                <span className="font-semibold text-slate-900">24 Tahun, Perempuan</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Penjamin / Asuransi:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  BPJS Kesehatan Aktif
                </span>
              </div>
            </div>
          </div>

          {/* Card: Aturan Tinjauan Medis */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Aturan Tinjauan Medis</h4>
                <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                  Data FRM-KELUHAN ini disajikan secara deskriptif non-skor agar dokter dapat mengkaji gejala secara murni sebelum temu virtual.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Structured Clinical Anamnesis Sections (8 cols) */}
        {/* ========================================================= */}
        <div className="space-y-4 lg:col-span-8">
          {/* Note Banner: Tipe Formulir Deskriptif */}
          <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-teal-950">
                  Tipe Formulir: Rekap Deskriptif Terstruktur
                </div>
                <div className="text-[11px] text-teal-800">
                  Sesuai protokol FRM-KELUHAN, formulir ini tidak menghasilkan skor numerik, melainkan anamnesis mandiri pasien.
                </div>
              </div>
            </div>
            <span className="rounded-md border border-teal-300 bg-white px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase tracking-wider w-fit shrink-0">
              NON-SCORING
            </span>
          </div>

          {/* SECTION A: Identitas Pengisi & Otoritas Data */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-xs font-bold text-teal-800">
                  A
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Identitas Pengisi & Otoritas Data
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Data Subjektif Pasien
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  PERTANYAAN KUNCI
                </div>
                <div className="text-slate-600 mt-0.5">Siapa yang mengisi formulir ini?</div>
                <div className="mt-1.5 flex items-center gap-1.5 font-bold text-sm text-slate-900">
                  <User className="h-4 w-4 text-teal-600" />
                  <span>Saya sendiri (Pasien Mandiri)</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  KONFIRMASI PROFIL PASIEN
                </div>
                <div className="text-slate-600 mt-0.5">Validasi NIK & Rekam Medis</div>
                <div className="mt-1.5 font-bold text-sm text-slate-900">
                  {patientName}{' '}
                  <span className="text-xs font-normal text-slate-500">(24 Th, Perempuan)</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: Keluhan Utama (Chief Complaint) */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-xs font-bold text-teal-800">
                  B
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Keluhan Utama (Chief Complaint)
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Data Subjektif Pasien
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  KONDISI SAAT INI
                </div>
                <div className="text-slate-600 mt-0.5">Apakah Anda memiliki keluhan saat ini?</div>
                <div className="mt-1.5 flex items-center gap-1.5 font-bold text-sm text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span>Ya, Mengalami Keluhan</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  AWITAN GEJALA (ONSET)
                </div>
                <div className="text-slate-600 mt-0.5">Sejak kapan keluhan muncul?</div>
                <div className="mt-1.5 flex items-center gap-1.5 font-bold text-sm text-slate-900">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>2 – 7 hari yang lalu</span>
                </div>
              </div>
            </div>

            {/* Transkripsi Asli Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  DESKRIPSI VERBATIM KELUHAN PASIEN
                </span>
                <span className="text-[10px] font-medium text-slate-400">Transkripsi Asli</span>
              </div>
              <p className="font-semibold text-sm text-slate-900 italic leading-relaxed">
                &ldquo;Sakit kepala berdenyut hebat di pelipis kanan disertai mual ringan dan silau bila terkena cahaya lampu.&rdquo;
              </p>
              <div className="text-[11px] text-slate-500 pt-1">
                Catatan: Pasien melaporkan foto-sensitivitas dan gangguan kenyamanan lambung simultan.
              </div>
            </div>
          </div>

          {/* SECTION C: Rincian Keluhan Klinis & Skala Fungsional */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-xs font-bold text-teal-800">
                  C
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Rincian Keluhan Klinis & Skala Fungsional
                </h3>
              </div>
              <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase">
                Skala Subjektif & Skala Fungsional
              </span>
            </div>

            {/* Row 1: Frekuensi & Durasi */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Frekuensi */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  FREKUENSI (7 HARI TERAKHIR)
                </div>
                <div className="font-bold text-base text-slate-900">4 — Sering</div>
                <div className="text-xs text-slate-500">
                  Hampir setiap hari kambuh secara intermiten
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <span className="h-2 w-5 rounded-full bg-teal-600" />
                  <span className="h-2 w-5 rounded-full bg-teal-600" />
                  <span className="h-2 w-5 rounded-full bg-teal-600" />
                  <span className="h-2 w-5 rounded-full bg-teal-600" />
                  <span className="h-2 w-5 rounded-full bg-slate-200" />
                </div>
              </div>

              {/* Durasi */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  DURASI TOTAL (SELAMA)
                </div>
                <div className="font-bold text-base text-slate-900">4 Hari Kumulatif</div>
                <div className="text-xs text-slate-500">
                  Dari rentang observasi 7 hari kalender
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mt-1">
                  <div className="h-full bg-teal-600 w-4/7" />
                </div>
              </div>
            </div>

            {/* Row 2: Tingkat Keparahan VAS & Gangguan Aktivitas */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Tingkat Keparahan VAS */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  TINGKAT KEPARAHAN INTENSITAS (VAS)
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-slate-900">
                    Tingkat 2 — Sedang
                  </span>
                  <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 font-mono">
                    VAS: 4 - 6
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Intensitas nyeri mengganggu konsentrasi namun masih dapat diajak berkomunikasi
                </p>
                <div className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold pt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Skala Analog Visual Tervalidasi</span>
                </div>
              </div>

              {/* Gangguan Aktivitas */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  GANGGUAN TERHADAP AKTIVITAS
                </div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-rose-700">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  <span>Ya, Mengganggu Aktivitas</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                    Bekerja / Belajar
                  </span>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                    Tidur / Istirahat
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Dampak: Penurunan produktivitas dan gangguan siklus REM.
                </p>
              </div>
            </div>

            {/* Row 3: Catatan Tambahan & Faktor Pemicu */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CATATAN TAMBAHAN & FAKTOR PEMICU
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                &ldquo;Rasa sakit kepala bertambah hebat jika melihat layar monitor kantor dalam durasi lama atau terpapar cahaya terang, dan membaik sedikit saat memejamkan mata di ruangan redup.&rdquo;
              </p>
            </div>
          </div>

          {/* SECTION D: Informasi Pendukung & Tanda Vital Mandiri */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-xs font-bold text-teal-800">
                  D
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Informasi Pendukung & Tanda Vital Mandiri
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pengukuran Mandiri & Farmakologi
              </span>
            </div>

            {/* Row 1: 3 Vitals boxes */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Suhu Tubuh */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    SUHU TUBUH
                  </span>
                  <span className="rounded bg-teal-50 px-1.5 py-0.2 text-[10px] font-bold text-teal-800">
                    Mandiri
                  </span>
                </div>
                <div className="font-bold text-xl text-slate-900 flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-teal-600" />
                  <span>36.8 °C</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-700">
                  Normotermia (Normal)
                </div>
                <div className="text-[10px] text-slate-400">Termometer Digital • 20 Nov</div>
              </div>

              {/* Berat Badan */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    BERAT BADAN
                  </span>
                  <span className="rounded bg-teal-50 px-1.5 py-0.2 text-[10px] font-bold text-teal-800">
                    Mandiri
                  </span>
                </div>
                <div className="font-bold text-xl text-slate-900 flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-teal-600" />
                  <span>52 kg</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-700">
                  IMT Estimasi: 20.8 (Ideal)
                </div>
                <div className="text-[10px] text-slate-400">Timbangan Rumah • 20 Nov</div>
              </div>

              {/* Riwayat Klinis */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    RIWAYAT KLINIS
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                    Terkonfirmasi
                  </span>
                </div>
                <div className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4 text-slate-500" />
                  <span>Hipertensi</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600">
                  Status: Terkontrol Baik
                </div>
                <div className="text-[10px] text-slate-400">Sistem Medis SelfCare ID</div>
              </div>
            </div>

            {/* Row 2: Riwayat Alergi */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  RIWAYAT ALERGI OBAT & MAKANAN
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Apakah Anda memiliki alergi terhadap obat tertentu atau makanan khusus?
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 w-fit shrink-0">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Tidak ada riwayat alergi
              </span>
            </div>

            {/* Row 3: Obat yang sedang dikonsumsi */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  OBAT YANG SEDANG DIKONSUMSI
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Pengobatan aktif saat ini yang sedang dikonsumsi dalam 48 jam terakhir:
                </div>
              </div>
              <div className="text-right sm:text-right w-fit shrink-0">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Pill className="h-3.5 w-3.5 text-teal-600" />
                  <span>Paracetamol 500mg</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Bila nyeri tidak tertahankan • Maks. 1x / hari
                </div>
              </div>
            </div>

            {/* Row 4: Tujuan Konsultasi Telehealth */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                TUJUAN KONSULTASI TELEHEALTH
              </div>
              <div className="text-xs text-slate-500">
                Ekspektasi pasien terhadap sesi temu virtual dokter:
              </div>
              <p className="font-medium text-xs text-slate-900 pt-1">
                &ldquo;Membahas keluhan baru & meminta rekomendasi penanganan klinis serta resep dari dokter spesialis&rdquo;
              </p>
            </div>
          </div>

          {/* Banner Box: Pernyataan Keterbatasan Hasil & Langkah Selanjutnya */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                Pernyataan Keterbatasan Hasil & Langkah Selanjutnya
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hasil self-assessment bukan diagnosis medis definitif dan tidak menggantikan pemeriksaan langsung oleh tenaga kesehatan.
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 leading-relaxed">
              <strong>Instruksi Medis:</strong> Informasi yang Anda sampaikan telah diteruskan ke{' '}
              <strong className="text-slate-900">dr. Tirta Wijaya, Sp.PD</strong>. Dokter akan mempelajari riwayat keluhan ini sebelum sesi telekonsultasi dimulai. Jika diperlukan klarifikasi medis tambahan, Anda akan menerima notifikasi di dashboard pasien.
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-slate-200/80 pt-2 text-[11px]">
              <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                Gejala darurat atau perburukan gejala mendadak? Segera hubungi ambulans atau IGD terdekat.
              </span>
              <a
                href="tel:119"
                className="inline-flex items-center gap-1 text-rose-700 font-bold hover:underline shrink-0"
              >
                <Phone className="h-3 w-3" />
                <span>Kontak Triase Medis (119)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBackToHistory}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400" />
          <span>Kembali ke Riwayat</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              if (onOpenTindakLanjut) onOpenTindakLanjut(displayId);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <FileText className="h-4 w-4 text-[#0D9488]" />
            <span>Lihat Tindak Lanjut</span>
          </button>

          <button
            type="button"
            onClick={() => onTrackStatus(displayId)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0D9488] transition-colors cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            <span>Pantau Status Antrean</span>
          </button>
        </div>
      </div>
    </div>
  );
};
