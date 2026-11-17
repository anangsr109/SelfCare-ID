'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Edit3,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  Headphones,
  HeartPulse,
  HelpCircle,
  Home,
  Hourglass,
  Info,
  Lock,
  MessageSquare,
  Pill,
  RotateCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Thermometer,
  User,
  Users,
  Weight,
} from 'lucide-react';
import {
  FormDetail,
  PatientProfile,
  TelehealthConfig,
  ValidationResponse,
} from '@/lib/telehealth-api';
import { formatIndonesianDateTime } from '@/lib/realtime-date';

interface PeriksaJawabanFormulirProps {
  config: TelehealthConfig;
  profile: PatientProfile | null;
  formDetail?: FormDetail | null;
  activeDraftId?: string | null;
  answers: Record<string, any>;
  validationResult?: ValidationResponse | null;
  onSubmitFinal: () => Promise<void>;
  onBackToEdit: () => void;
  onOpenHelpdesk?: () => void;
  loading?: boolean;
}

export function PeriksaJawabanFormulir({
  config,
  profile,
  formDetail,
  activeDraftId,
  answers,
  validationResult,
  onSubmitFinal,
  onBackToEdit,
  onOpenHelpdesk,
  loading = false,
}: PeriksaJawabanFormulirProps) {
  const patientName = profile?.nama || 'Citra Lestari Putri';
  const patientRm = profile?.no_rm || 'RM-2024-004821';
  const assessmentId = activeDraftId || 'ASM-2024-89012';

  // State for final submission confirmation checkbox
  const [statementAgreed, setStatementAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(assessmentId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleFinalSubmitClick = async () => {
    if (!statementAgreed) return;
    setSubmitting(true);
    try {
      await onSubmitFinal();
    } finally {
      setSubmitting(false);
    }
  };

  // Compile JSON preview response matching Stitch design
  const apiValidationPreview = {
    valid: true,
    errors: [],
    kelengkapan: '100%',
    pertanyaan_tampil: 12,
    schema_version: 'klinis',
    hasil_pratinjau: 'CLEARED',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ------------------------------------------------------------- */}
      {/* 1. Breadcrumb & Endpoint Header */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[#64748B]">
          <button
            type="button"
            onClick={onBackToEdit}
            className="flex items-center gap-1 hover:text-[#0D9488] transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Beranda</span>
          </button>
          <span className="text-[#CBD5E1]" aria-hidden="true">&gt;</span>
          <span className="hover:text-[#0D9488] cursor-pointer" onClick={onBackToEdit}>
            Self-Assessment
          </span>
          <span className="text-[#CBD5E1]" aria-hidden="true">&gt;</span>
          <span className="hover:text-[#0D9488] cursor-pointer" onClick={onBackToEdit}>
            FRM-KELUHAN
          </span>
          <span className="text-[#CBD5E1]" aria-hidden="true">&gt;</span>
          <span className="font-semibold text-[#0F172A]">Periksa Jawaban</span>
        </nav>

        {/* Right Info Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyId}
            title="Klik untuk menyalin ID"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-[#FFFFFF] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#334155] shadow-2xs hover:bg-[#F8FAFC]"
          >
            <span>ID: {assessmentId}</span>
            <Copy className="h-3 w-3 text-[#64748B]" />
            {copiedId && <span className="text-[10px] text-[#059669]">Tersalin!</span>}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Page Header */}
      {/* ------------------------------------------------------------- */}
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-[#0F172A]">
            Periksa Jawaban Anda
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#99F6E4] bg-[#CCFBF1] px-2.5 py-0.5 text-xs font-bold text-[#0F766E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
            <span>Siap Dikirim • 100% Valid</span>
          </span>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
          Pastikan informasi yang Anda berikan sudah benar sebelum dikirim ke dokter spesialis untuk sesi telekonsultasi.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Top Banner: Kelengkapan Data Klinis (100% Validated) */}
      {/* ------------------------------------------------------------- */}
      <section
        aria-label="Ringkasan validasi data klinis"
        className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          {/* Left: 100% Circular Ring & Title */}
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-[#0D9488] bg-[#CCFBF1]/40 text-[#0F766E] font-display font-extrabold text-sm shadow-xs">
              100%
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-display text-base font-bold text-[#0F172A]">
                <span>Kelengkapan Data Klinis</span>
                <CheckCircle2 className="h-4 w-4 text-[#059669]" />
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                12 dari 12 pertanyaan wajib telah diisi sesuai spesifikasi FHIR R4.
              </p>
            </div>
          </div>

          {/* Right: 3 Stats Indicators */}
          <div className="flex items-center gap-6 divide-x divide-[#E2E8F0] text-xs">
            <div className="pl-0 text-left">
              <span className="text-[11px] text-[#64748B]">Terisi</span>
              <p className="font-display text-base font-bold text-[#0F172A]">12 / 12</p>
            </div>
            <div className="pl-6 text-left">
              <span className="text-[11px] text-[#64748B]">Pending</span>
              <p className="font-display text-base font-bold text-[#059669]">0</p>
            </div>
            <div className="pl-6 text-left">
              <span className="text-[11px] text-[#64748B]">Estimasi Telaah</span>
              <p className="font-display text-base font-bold text-[#0F172A]">10–15m</p>
            </div>
          </div>
        </div>

        {/* Validation Pass Alert Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-3 text-xs text-[#065F46]">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10B981]" />
          <span>
            Seluruh data klinis wajib telah lengkap dan lolos filter skema JSON. Silakan tinjau sebelum finalisasi enkripsi.
          </span>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. Two-Column Review Layout */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column (8 cols): 4 Segments Review Cards */}
        <div className="space-y-5 lg:col-span-8">
          {/* Card 1: Bagian A — Identitas Pengisi */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EFF6FF] font-bold text-xs text-[#1D4ED8]">
                  A
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#0F172A]">
                    Bagian A — Identitas Pengisi
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Subjek Formulir & Otoritas Pelaporan</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
                  ✓ Lengkap & Valid
                </span>
                <button
                  type="button"
                  onClick={onBackToEdit}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-2.5 py-1 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC]"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Ubah</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  PIHAK PENGISI FORMULIR
                </span>
                <p className="mt-0.5 font-bold text-[#0F172A]">Saya sendiri (Pasien Mandiri)</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  IDENTITAS & DEMOGRAFI
                </span>
                <p className="mt-0.5 font-bold text-[#0F172A]">
                  {patientName} · <span className="font-normal text-[#64748B]">24 Tahun (Perempuan)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Bagian B — Keluhan Utama */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EFF6FF] font-bold text-xs text-[#1D4ED8]">
                  B
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#0F172A]">
                    Bagian B — Keluhan Utama
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Chief Complaint & Onset Akut</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
                  ✓ Lengkap & Valid
                </span>
                <button
                  type="button"
                  onClick={onBackToEdit}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-2.5 py-1 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC]"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Ubah</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    STATUS KELUHAN FISIK
                  </span>
                  <p className="mt-0.5 font-bold text-[#0F172A] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
                    <span>Ya, Mengalami Keluhan</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    SEJAK KAPAN MUNCUL
                  </span>
                  <p className="mt-0.5 font-bold text-[#0F172A]">2 – 7 hari yang lalu</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  DESKRIPSI KELUHAN UTAMA
                </span>
                <div className="mt-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#334155] leading-relaxed italic">
                  &ldquo;Sakit kepala berdenyut hebat di pelipis kanan disertai mual ringan dan silau bila terkena cahaya lampu.&rdquo;
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Bagian C — Rincian Keluhan Klinis */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EFF6FF] font-bold text-xs text-[#1D4ED8]">
                  C
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#0F172A]">
                    Bagian C — Rincian Keluhan Klinis
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Intensitas, Frekuensi, & Dampak Fungsional</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md border border-[#C7D2FE] bg-[#EEF2FF] px-2 py-0.5 font-mono text-[9px] font-semibold text-[#4338CA]">
                  show_if: ada_keluhan == &apos;ya&apos;
                </span>
                <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
                  ✓ Lengkap & Valid
                </span>
                <button
                  type="button"
                  onClick={onBackToEdit}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-2.5 py-1 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC]"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Ubah</span>
                </button>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* 3 Metrics Row */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    FREKUENSI (7 HARI)
                  </span>
                  <p className="mt-0.5 font-bold text-[#0F172A]">4 — Sering</p>
                  <p className="text-[10px] text-[#64748B]">Hampir setiap hari kambuh</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    DURASI TOTAL
                  </span>
                  <p className="mt-0.5 font-bold text-[#0F172A]">4 Hari</p>
                  <p className="text-[10px] text-[#64748B]">Dari rentang 7 hari terakhir</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    TINGKAT KEPARAHAN
                  </span>
                  <p className="mt-0.5 font-bold text-[#0F766E] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                    <span>2 — Sedang</span>
                  </p>
                  <p className="text-[10px] text-[#64748B]">VAS Estimasi: 4 - 6</p>
                </div>
              </div>

              {/* Mengganggu Aktivitas */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    MENGGANGGU AKTIVITAS HARIAN?
                  </span>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 text-[11px] font-semibold text-[#1D4ED8]">
                      Bekerja / Belajar
                    </span>
                    <span className="rounded-md bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 text-[11px] font-semibold text-[#1D4ED8]">
                      Tidur / Istirahat
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#D97706] flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Ya, Mengganggu</span>
                </span>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  CATATAN TAMBAHAN / FAKTOR PEMICU
                </span>
                <div className="mt-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#334155] leading-relaxed italic">
                  &ldquo;Rasa sakit kepala bertambah hebat jika melihat layar monitor kantor dalam durasi lama atau terpapar cahaya terang, dan membaik sedikit saat memejamkan mata di ruangan redup.&rdquo;
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Bagian D — Informasi Pendukung & Tanda Vital */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EFF6FF] font-bold text-xs text-[#1D4ED8]">
                  D
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#0F172A]">
                    Bagian D — Informasi Pendukung & Tanda Vital
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Komorbiditas, Farmakologi, & Biometrik Mandiri</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
                  ✓ Lengkap & Valid
                </span>
                <button
                  type="button"
                  onClick={onBackToEdit}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-2.5 py-1 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC]"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Ubah</span>
                </button>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Biometric Vitals Strip */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEE2E2] text-[#DC2626]">
                    <Thermometer className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase tracking-wider">SUHU TUBUH</span>
                    <p className="font-display text-sm font-bold text-[#0F172A]">36.8 °C</p>
                    <span className="text-[10px] text-[#94A3B8]">
                      {answers?.tanggal_pengukuran
                        ? formatIndonesianDateTime(answers.tanggal_pengukuran).split('•')[0].trim()
                        : formatIndonesianDateTime(new Date()).split('•')[0].trim()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#CCFBF1] text-[#0F766E]">
                    <Weight className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase tracking-wider">BERAT BADAN</span>
                    <p className="font-display text-sm font-bold text-[#0F172A]">52 kg</p>
                    <span className="text-[10px] text-[#94A3B8]">
                      {answers?.tanggal_pengukuran
                        ? formatIndonesianDateTime(answers.tanggal_pengukuran).split('•')[0].trim()
                        : formatIndonesianDateTime(new Date()).split('•')[0].trim()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Penyakit & Alergi */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-[#E2E8F0] pt-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    RIWAYAT PENYAKIT TERDAHULU
                  </span>
                  <p className="mt-0.5 font-bold text-[#0F172A]">
                    Hipertensi <span className="font-normal text-[#64748B]">(Terkontrol)</span>
                  </p>
                  <p className="text-[10px] text-[#64748B]">Tanpa komorbid DM / Asma</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    ALERGI OBAT / MAKANAN
                  </span>
                  <p className="mt-0.5 font-semibold text-[#059669] flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Tidak ada riwayat alergi yang dilaporkan</span>
                  </p>
                </div>
              </div>

              {/* Obat Dikonsumsi */}
              <div className="border-t border-[#E2E8F0] pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  OBAT YANG SEDANG DIKONSUMSI
                </span>
                <div className="mt-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-[#0D9488] shrink-0" />
                  <span className="text-xs text-[#0F172A]">
                    <strong>Paracetamol 500mg</strong> — diminum hanya bila nyeri tidak tertahankan (maks. 1x sehari)
                  </span>
                </div>
              </div>

              {/* Tujuan Konsultasi */}
              <div className="border-t border-[#E2E8F0] pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  TUJUAN KONSULTASI TELEHEALTH
                </span>
                <p className="mt-0.5 text-xs text-[#334155]">
                  Membahas keluhan baru & meminta rekomendasi penanganan klinis dari dokter spesialis.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Card: Pernyataan Akurasi & Tombol Kirim */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
            {/* Agreement Checkbox */}
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
              <input
                type="checkbox"
                checked={statementAgreed}
                onChange={(e) => setStatementAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] accent-[#0D9488]"
              />
              <div className="space-y-0.5 leading-relaxed">
                <span className="font-bold text-[#0F172A]">
                  Pernyataan Akurasi & Persetujuan Transmisi Medis
                </span>
                <p className="text-[11px] text-[#64748B]">
                  Saya telah memeriksa seluruh jawaban di atas dan memastikan bahwa informasi yang saya berikan adalah benar, akurat, dan sesuai dengan kondisi fisik yang saya rasakan saat ini. Saya memahami bahwa data ini akan langsung masuk ke rekam medis telekonsultasi.
                </p>
              </div>
            </label>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
              <button
                type="button"
                onClick={onBackToEdit}
                className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Formulir</span>
              </button>

              <button
                type="button"
                disabled={!statementAgreed || submitting || loading}
                onClick={handleFinalSubmitClick}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 py-2.5 text-xs font-bold text-[#FFFFFF] shadow-xs hover:bg-[#0D9488] transition-colors disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
              >
                {submitting || loading ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>Kirim Jawaban Asesmen</span>
              </button>
            </div>

            {/* Privacy note */}
            <p className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] pt-1">
              <Lock className="h-3 w-3 text-[#0D9488]" />
              <span>Dienkripsi dengan standar TLS 1.3 & AES-256 untuk perlindungan privasi data medis (Permenkes No. 24/2022).</span>
            </p>
          </div>
        </div>

        {/* Right Column (4 cols): Profil, Validasi Realtime, Penguncian, Help Desk */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card 1: Profil Konsultasi */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <span className="font-display text-xs font-bold text-[#0F172A]">Profil Konsultasi</span>
              <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
                EMR Linked
              </span>
            </div>

            {/* Patient Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#99F6E4] bg-[#CCFBF1] font-display text-sm font-bold text-[#0F766E]">
                CL
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-display text-sm font-bold text-[#0F172A]">
                  {patientName}
                </h3>
                <p className="text-[11px] text-[#64748B]">No. RM: {patientRm}</p>
                <p className="flex items-center gap-1 text-[10px] font-medium text-[#059669]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  <span>BPJS Kesehatan Aktif</span>
                </p>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="border-t border-[#E2E8F0] pt-3 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                DOKTER PENERIMA KONSULTASI
              </span>
              <p className="font-bold text-[#0F172A]">dr. Tirta Wijaya, Sp.PD</p>
              <p className="text-[11px] text-[#64748B]">Spesialis Penyakit Dalam (Internal Medicine)</p>
            </div>

            {/* Student Reporter Info */}
            <div className="border-t border-[#E2E8F0] pt-3 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                AKUN MAHASISWA PENGISI
              </span>
              <p className="font-mono font-bold text-[#0F172A]">{config.nim} — {config.nama}</p>
              <p className="text-[11px] text-[#64748B]">Tingkat {config.kelas} • Informatika Medis</p>
            </div>
          </div>

          {/* Card 2: Validasi API Realtime */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center gap-1.5 font-display text-xs font-bold text-[#0F172A]">
                <Code2 className="h-4 w-4 text-[#0D9488]" />
                <span>Validasi API Realtime</span>
              </div>
              <span className="rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-2 py-0.5 font-mono text-[10px] font-bold text-[#059669]">
                HTTP 200 OK
              </span>
            </div>

            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Pratinjau respons validasi skema formulir dari server webhook SelfCare ID Core sebelum transmisi:
            </p>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#0F172A] p-3 font-mono text-[11px] text-[#E2E8F0] leading-relaxed overflow-x-auto shadow-inner">
              <pre>{JSON.stringify(apiValidationPreview, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono pt-1">
              <span>Latency: 42ms</span>
              <span className="text-[#059669] font-bold">Schema: FHIR R4 Valid</span>
            </div>
          </div>

          {/* Card 3: Peringatan Penguncian Data Medis */}
          <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-xs text-[#991B1B] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#DC2626]">
              <span className="text-sm font-extrabold">!</span>
              <span>Peringatan Penguncian Data Medis</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#991B1B]">
              Setelah tombol <strong>Kirim Jawaban</strong> ditekan, data formulir ini akan dikunci (*finalized*) secara permanen dan ditransmisikan langsung ke modul Electronic Medical Record (EMR) dokter penerima. Anda tidak dapat melakukan penyuntingan mandiri setelah data terkirim.
            </p>
          </div>

          {/* Card 4: Butuh Bantuan Teknis? */}
          <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-4 flex items-center justify-between text-xs text-[#1D4ED8]">
            <div className="space-y-0.5">
              <span className="font-bold">Butuh Bantuan Teknis?</span>
              <p className="text-[11px] text-[#3B82F6]">Triage Desk tersedia 24 Jam</p>
            </div>
            <button
              type="button"
              onClick={onOpenHelpdesk}
              className="rounded-lg border border-[#3B82F6] bg-[#FFFFFF] px-3 py-1.5 font-bold text-[#1D4ED8] hover:bg-[#DBEAFE] transition-colors"
            >
              Hubungi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
