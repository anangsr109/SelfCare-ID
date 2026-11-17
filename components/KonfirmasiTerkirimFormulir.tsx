'use client';

import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Lock,
  FileText,
  Copy,
  Stethoscope,
  Clock,
  Hourglass,
  ClipboardCheck,
  MessageSquare,
  Info,
  Code2,
  ArrowRight,
  Home,
  Eye,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { FormDetail, PatientProfile, TelehealthConfig } from '@/lib/telehealth-api';
import { formatIndonesianDateTime } from '@/lib/realtime-date';

interface KonfirmasiTerkirimFormulirProps {
  assessmentId?: string;
  formDetail?: FormDetail | null;
  profile?: PatientProfile | null;
  config: TelehealthConfig;
  submitResponse?: any;
  onBackToHome: () => void;
  onViewArchive: () => void;
  onTrackStatus: () => void;
}

export const KonfirmasiTerkirimFormulir: React.FC<KonfirmasiTerkirimFormulirProps> = ({
  assessmentId = 'ASM-2024-89012',
  formDetail,
  profile,
  config,
  submitResponse,
  onBackToHome,
  onViewArchive,
  onTrackStatus,
}) => {
  const [copied, setCopied] = useState(false);

  const displayAssessmentId = assessmentId || 'ASM-2024-89012';
  const apiIdNumber = displayAssessmentId.replace(/\D/g, '') || '89012';

  const handleCopyId = () => {
    navigator.clipboard.writeText(displayAssessmentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Identitas Pasien
  const patientName = profile?.nama || config.nama || 'Citra Lestari Putri';
  const patientRm = profile?.no_rm || 'RM-2024-004821';
  const patientInitials =
    patientName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || 'CL';

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Breadcrumb & Endpoint Telemetry Row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Home className="h-3.5 w-3.5 text-slate-400" />
            <span>Beranda</span>
          </button>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <button
            type="button"
            onClick={onBackToHome}
            className="text-slate-500 hover:text-slate-800 transition-colors"
          >
            Self-Assessment
          </button>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="font-semibold text-slate-800">
            Konfirmasi Pengiriman (FRM-KELUHAN)
          </span>
        </nav>

        {/* Endpoint Pill */}
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-[11px] text-slate-600 shadow-2xs">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">POST</span>
          <span>/api/assessments/{displayAssessmentId}/submit</span>
          <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
            HTTP 201 Created
          </span>
          <span className="text-slate-400">· 38ms</span>
        </div>
      </div>

      {/* 2. Hero Celebration Card (Status Verifikasi Sistem EHR) */}
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xs">
        {/* Large Circular Badge with double ring & verified shield */}
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#99F6E4]/50 bg-[#CCFBF1] text-[#0F766E] shadow-xs">
          <Check className="h-8 w-8 stroke-[3]" />
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#0F766E] text-white shadow-2xs">
            <ShieldCheck className="h-3 w-3" />
          </div>
        </div>

        {/* Status Verifikasi Tag */}
        <div className="mt-4 mb-1">
          <span className="text-[11px] font-bold tracking-wider text-[#0D9488] uppercase">
            STATUS VERIFIKASI SISTEM EHR
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
          Assessment Berhasil Dikirim!
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-slate-500 leading-relaxed">
          Formulir self-assessment Anda telah diterima dengan aman dan kini tercatat dalam antrean prioritas peninjauan tim medis SelfCare ID.
        </p>

        {/* Badges */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            <span>Terkirim & Terkunci Permanen</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
            <span>Menunggu Peninjauan Klinis</span>
          </div>
        </div>
      </div>

      {/* 3. Card: Data Respons Registrasi Formulir */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-700">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">
                Data Respons Registrasi Formulir
              </h2>
              <p className="text-xs text-slate-400">
                Payload transaksi resmi database klinis SelfCare ID Telehealth
              </p>
            </div>
          </div>

          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-mono font-medium text-indigo-700 w-fit">
            API ID: #{apiIdNumber}
          </span>
        </div>

        {/* 2-Column Content */}
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Kolom Kiri */}
          <div className="space-y-4">
            {/* Nomor Assessment */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  NOMOR ASSESSMENT
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                  {displayAssessmentId}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
              >
                {copied ? (
                  <>
                    <CheckCheck className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-slate-400" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Nama Formulir */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                NAMA FORMULIR
              </div>
              <div className="mt-1">
                <div className="font-semibold text-sm text-slate-900">
                  Formulir Keluhan Pasien Sebelum Konsultasi
                </div>
                <div className="text-xs text-slate-400">
                  Katalog Sistem: FRM-KELUHAN (Telemedicine Protocol)
                </div>
              </div>
            </div>

            {/* Pasien Terdaftar */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PASIEN TERDAFTAR
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-xs text-teal-800">
                  {patientInitials}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{patientName}</div>
                  <div className="font-mono text-xs text-slate-400">
                    No. Rekam Medis: {patientRm}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-4">
            {/* Dokter Penerima Berkas */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DOKTER PENERIMA BERKAS
              </div>
              <div className="mt-1 flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-white">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">dr. Tirta Wijaya, Sp.PD</div>
                  <div className="text-xs text-slate-500">
                    Spesialis Penyakit Dalam (Internal Medicine)
                  </div>
                </div>
              </div>
            </div>

            {/* Status Pengiriman & Status Peninjauan */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  STATUS PENGIRIMAN
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    Terkirim
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  STATUS PENINJAUAN
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
                    Menunggu Peninjauan
                  </span>
                </div>
              </div>
            </div>

            {/* Waktu Submit & Verifikasi Kriptografi */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                WAKTU SUBMIT & VERIFIKASI KRIPTOGRAFI
              </div>
              <div className="mt-1 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatIndonesianDateTime(new Date(), { withDay: true, withSeconds: true })}</span>
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  Hash Bukti: sha256:e8b4c2a07f985dd3b482...f981c2
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Card: Tahapan Peninjauan Medis & Konsultasi (Alur Layanan Pasien) */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ALUR LAYANAN PASIEN
            </div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Tahapan Peninjauan Medis & Konsultasi
            </h2>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 w-fit">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Estimasi 10-30 Menit</span>
          </div>
        </div>

        {/* 4 Steps Grid */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
          {/* Langkah 1 - Selesai */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>
            <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              LANGKAH 1 • SELESAI
            </div>
            <h3 className="mt-1 font-bold text-sm text-slate-900">
              Formulir Terkirim
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Data keluhan terenkripsi end-to-end dan tersimpan aman pada basis data EHR SelfCare ID.
            </p>
          </div>

          {/* Langkah 2 - Aktif Saat Ini */}
          <div className="rounded-xl border-2 border-teal-500 bg-teal-50/40 p-4 shadow-xs">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-xs">
              <Hourglass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-teal-600">
              LANGKAH 2 • AKTIF SAAT INI
            </div>
            <h3 className="mt-1 font-bold text-sm text-teal-950">
              Menunggu Peninjauan Petugas
            </h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Berkas berada pada dashboard dokter pemeriksa untuk dipelajari sebelum telekonsultasi dimulai.
            </p>
          </div>

          {/* Langkah 3 - Berikutnya */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 font-bold text-xs">
              <ClipboardCheck className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="mt-3 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              LANGKAH 3 • BERIKUTNYA
            </div>
            <h3 className="mt-1 font-bold text-sm text-slate-700">
              Petugas Melakukan Peninjauan
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Dokter atau tim triase mengevaluasi keluhan spesifik, obat harian, dan indikasi klinis.
            </p>
          </div>

          {/* Langkah 4 - Selesai Nanti */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 font-bold text-xs">
              <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="mt-3 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              LANGKAH 4 • SELESAI
            </div>
            <h3 className="mt-1 font-bold text-sm text-slate-700">
              Hasil & Tautan Konsultasi
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Ringkasan medis preliminer, resep rujukan, dan ruang temu virtual siap diakses.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Banner: Pemberitahuan Prosedur & Klarifikasi Medis */}
      <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4 flex items-start gap-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0F766E] text-white">
          <Info className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-[#0F766E]">
            Pemberitahuan Prosedur & Klarifikasi Medis
          </h3>
          <p className="mt-1 text-xs text-slate-700 leading-relaxed">
            Setelah formulir dikirim, jawaban tidak dapat diubah secara langsung demi menjaga integritas data rekam medis elektronik. Apabila petugas membutuhkan informasi tambahan atau klarifikasi gejala spesifik, Anda akan menerima notifikasi interaktif dan dapat memberikan jawaban instan melalui fitur <strong>Permintaan Klarifikasi</strong> di Dashboard Pasien.
          </p>
        </div>
      </div>

      {/* 6. Card: Protokol Penanganan Respons API & Edge Cases */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-slate-500" />
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">
                Protokol Penanganan Respons API & Edge Cases
              </h2>
              <p className="text-xs text-slate-400">
                Arsitektur SelfCare ID menjamin determinasi status pengiriman formulir dengan spesifikasi penanganan berikut:
              </p>
            </div>
          </div>
          <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-mono text-slate-600 font-medium w-fit">
            Specification RFC 7807
          </span>
        </div>

        {/* 3 Status Protocol Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Card 1: 201 Created */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-3.5">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>HTTP 201 Created</span>
            </div>
            <div className="mt-1 font-bold text-xs text-slate-900">
              State Aktif Sekarang
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              Formulir divalidasi penuh, id transaksi diterbitkan, dan antrean triase terpicu seketika.
            </p>
            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <Check className="h-3 w-3 stroke-[2.5]" />
              <span>Assessment Locked</span>
            </div>
          </div>

          {/* Card 2: 422 Unprocessable */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>HTTP 422 Unprocessable</span>
            </div>
            <div className="mt-1 font-bold text-xs text-slate-900">
              Gagal Validasi Input
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              Jika ada butir vital kosong, sistem menyorot form field bermasalah tanpa menghapus data yang terisi.
            </p>
            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
              <ArrowRight className="h-3 w-3" />
              <span>Inline Validation Focus</span>
            </div>
          </div>

          {/* Card 3: 409 Conflict */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>HTTP 409 Conflict</span>
            </div>
            <div className="mt-1 font-bold text-xs text-slate-900">
              Duplikasi Pengiriman
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              Formulir yang telah berstatus terkirim tidak dapat disubmit ulang guna mencegah inkonsistensi rekaman medis.
            </p>
            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              <ArrowRight className="h-3 w-3" />
              <span>Redirect to Existing ASM</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Bottom Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBackToHome}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Home className="h-4 w-4 text-slate-400" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onViewArchive}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4 text-slate-400" />
            <span>Lihat Arsip / Salinan</span>
          </button>

          <button
            type="button"
            onClick={onTrackStatus}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0D9488] transition-colors cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            <span>Pantau Status Peninjauan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
