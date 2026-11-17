'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Hourglass,
  Layers,
  MessageSquare,
  Pill,
  Play,
  RefreshCw,
  RotateCw,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Users,
  Video,
  X,
} from 'lucide-react';
import {
  FormMeta,
  PatientProfile,
  TelehealthConfig,
  UTSStatusResponse,
} from '@/lib/telehealth-api';
import { formatIndonesianFullDate } from '@/lib/realtime-date';
import { SkeletonStatGrid } from './SkeletonShimmer';

interface DashboardUtamaPasienProps {
  config: TelehealthConfig;
  profile: PatientProfile | null;
  forms: FormMeta[];
  utsStatus: UTSStatusResponse | null;
  loading: boolean;
  onRefresh: () => void;
  onStartAssessment: (formId: string) => void;
  onNavigateSubView: (view: 'beranda' | 'mulai' | 'isi' | 'periksa' | 'terkirim' | 'riwayat' | 'hasil' | 'status' | 'pengaturan') => void;
  onOpenClarification: () => void;
  onOpenUtsMatrix?: () => void;
}

export function DashboardUtamaPasien({
  config,
  profile,
  forms,
  utsStatus,
  loading,
  onRefresh,
  onStartAssessment,
  onNavigateSubView,
  onOpenClarification,
  onOpenUtsMatrix,
}: DashboardUtamaPasienProps) {
  const patientName = profile?.nama || 'Citra Lestari Putri';
  const patientRm = profile?.no_rm || 'RM-2024-004821';
  const patientId = profile?.id || 'PASIEN-98214';

  const stats = profile?.statistik || {
    total: 14,
    draf: 2,
    menunggu: 3,
    perlu_klarifikasi: 1,
    sudah_ditinjau: 8,
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return 'CL';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ------------------------------------------------------------- */}
      {/* 1. Hero Card: "Pantau kesehatan Anda dengan lebih mudah." */}
      {/* ------------------------------------------------------------- */}
      <section
        aria-label="Hero ringkasan status pasien"
        className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-7 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2.5 max-w-2xl">
            {/* Top pill badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-semibold text-[#065F46]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" aria-hidden="true" />
                <span>Status Koneksi: Terhubung</span>
              </span>
              <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
              <span className="text-xs text-[#64748B]">
                {formatIndonesianFullDate(new Date())}
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-[#0F172A] leading-tight">
              Pantau kesehatan Anda dengan lebih mudah.
            </h1>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Isi penilaian kesehatan secara mandiri dan pantau proses peninjauannya melalui satu aplikasi SelfCare ID.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onStartAssessment('FRM-KELUHAN')}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#0D9488] px-4 py-2 text-xs sm:text-sm font-semibold text-[#FFFFFF] shadow-xs transition-colors hover:bg-[#0F766E] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#0D9488]/30"
            >
              <FileCheck2 className="h-4 w-4" aria-hidden="true" />
              <span>Penilaian Baru</span>
            </button>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              aria-label="Segarkan data telemetri"
              title="Segarkan data"
              className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-2 text-[#334155] transition-colors hover:border-[#0D9488] hover:bg-[#F0FDFA] hover:text-[#0F766E] disabled:opacity-50"
            >
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#0D9488]' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. Alert Banner: TINDAKAN DIPERLUKAN (Klarifikasi Petugas) */}
      {/* ------------------------------------------------------------- */}
      <section
        aria-label="Peringatan tindakan klarifikasi petugas"
        className="rounded-2xl border border-[#FEF08A] bg-[#FEFCE8] p-4 sm:p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)]"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF08A] text-[#854D0E] font-bold text-sm shadow-xs">
              !
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#854D0E]">
                  TINDAKAN DIPERLUKAN
                </span>
                <span className="text-[#FCD34D]" aria-hidden="true">·</span>
                <span className="text-xs font-semibold text-[#854D0E]">
                  Laporan #SR-2024-089 · Pemeriksaan Gejala Awal
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">
                Ada permintaan informasi tambahan dari petugas medis
              </h2>
              <p className="text-xs text-[#475569] leading-relaxed">
                dr. Raditya Sp.PD membutuhkan klarifikasi mengenai durasi rasa nyeri dada dan riwayat alergi obat penurun panas sebelum validasi konsultasi.
              </p>
            </div>
          </div>

          <div className="shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={onOpenClarification}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#D97706] px-4 py-2 text-xs font-semibold text-[#FFFFFF] shadow-xs transition-colors hover:bg-[#B45309] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#D97706]/30"
            >
              <span>Jawab Klarifikasi</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. Ringkasan Telemetri / Statistik (5 Cards) */}
      {/* ------------------------------------------------------------- */}
      <section aria-label="Ringkasan statistik telemetri assessment">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              RINGKASAN TELEMETRI
            </span>
          </div>
          <span className="text-[11px] text-[#94A3B8]">
            Pembaruan otomatis tiap 60 dtk
          </span>
        </div>

        {loading ? (
          <SkeletonStatGrid count={5} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {/* Card 1: Total Assessment */}
            <div className="card-hover rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)] cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#64748B]">Total Assessment</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                  <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold tabular-nums text-[#0F172A]">
                  {stats.total ?? 14}
                </span>
                <span className="text-xs text-[#64748B]">berkas</span>
              </div>
              <p className="mt-1 text-[11px] text-[#94A3B8]">Semua pengajuan</p>
            </div>

            {/* Card 2: Draf */}
            <div className="card-hover rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)] cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#64748B]">Draf</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#475569]">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold tabular-nums text-[#0F172A]">
                  {stats.draf ?? 2}
                </span>
                <span className="text-xs text-[#64748B]">form</span>
              </div>
              <p className="mt-1 text-[11px] text-[#94A3B8]">Belum dikirimkan</p>
            </div>

            {/* Card 3: Menunggu Review */}
            <div className="card-hover rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)] cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#64748B]">Menunggu Review</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0FDFA] text-[#0D9488]">
                  <Hourglass className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold tabular-nums text-[#0F172A]">
                  {stats.menunggu ?? 3}
                </span>
                <span className="text-xs text-[#64748B]">antrean</span>
              </div>
              <p className="mt-1 text-[11px] text-[#94A3B8]">Dalam antrean klinis</p>
            </div>

            {/* Card 4: Perlu Klarifikasi */}
            <div className="card-hover rounded-xl border border-[#FDE68A] bg-[#FFFBEB]/70 p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)] cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#854D0E]">Perlu Klarifikasi</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEF08A] text-[#B45309]">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold tabular-nums text-[#D97706]">
                  {stats.perlu_klarifikasi ?? 1}
                </span>
                <span className="text-xs font-medium text-[#D97706]">respons</span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-[#D97706]">Membutuhkan aksi Anda</p>
            </div>

            {/* Card 5: Sudah Ditinjau */}
            <div className="card-hover rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]/60 p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)] cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#065F46]">Sudah Ditinjau</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#CCFBF1] text-[#059669]">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold tabular-nums text-[#059669]">
                  {stats.sudah_ditinjau ?? 8}
                </span>
                <span className="text-xs font-medium text-[#059669]">selesai</span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-[#059669]">Laporan final siap</p>
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. Two-Column Main Content Layout */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column (8 cols): Formulir & Alur Layanan */}
        <div className="space-y-6 lg:col-span-8">
          {/* Header Mulai Penilaian */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-[#0F172A]">
                  Mulai Penilaian Kesehatan
                </h2>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                2 INSTRUMEN AKTIF
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Pilih formulir penilaian klinis mandiri yang tervalidasi sebelum jadwal konsultasi dokter.
            </p>
          </div>

          {/* Grid of 2 Assessment Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Card 1: FRM-KELUHAN */}
            <div className="card-hover flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] cursor-pointer">
              <div className="space-y-3.5">
                {/* Badges */}
                <div className="flex items-center justify-between">
                  <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2 py-0.5 text-[11px] font-bold text-[#0F766E]">
                    FRM-KELUHAN
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[#059669]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
                    <span>Tersedia</span>
                  </span>
                </div>

                {/* Stethoscope Icon Box */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0D9488] text-[#FFFFFF] shadow-xs">
                  <Stethoscope className="h-5 w-5" aria-hidden="true" />
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-display text-base font-bold text-[#0F172A] leading-snug">
                    Formulir Keluhan Pasien Sebelum Konsultasi
                  </h3>
                  <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed">
                    Sampaikan keluhan utama, riwayat penyakit penyerta, dan obat rutin Anda sebelum masuk ke sesi telemedis dokter spesialis.
                  </p>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#0D9488]" aria-hidden="true" />
                    <span>5 - 8 Menit</span>
                  </span>
                  <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-[#0D9488]" aria-hidden="true" />
                    <span>12 Pertanyaan</span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => onStartAssessment('FRM-KELUHAN')}
                  className="inline-flex w-full min-h-[40px] items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-4 py-2.5 text-xs font-bold text-[#FFFFFF] transition-colors hover:bg-[#0F766E] shadow-xs focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#0D9488]/30"
                >
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <span>Mulai Assessment</span>
                </button>
              </div>
            </div>

            {/* Card 2: GAD-7 */}
            <div className="card-hover flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] cursor-pointer">
              <div className="space-y-3.5">
                {/* Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-bold text-[#1D4ED8]">
                      FRM-GAD7
                    </span>
                    <span className="rounded-md border border-[#E9D5FF] bg-[#F3E8FF] px-2 py-0.5 text-[11px] font-bold text-[#7E22CE]">
                      Bonus Instrumen
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[#059669]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
                    <span>Tersedia</span>
                  </span>
                </div>

                {/* Mental health / Brain icon Box */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E0E7FF] text-[#4338CA] shadow-xs">
                  <Brain className="h-5 w-5" aria-hidden="true" />
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-display text-base font-bold text-[#0F172A] leading-snug">
                    Kuesioner Skrining Kecemasan (GAD-7)
                  </h3>
                  <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed">
                    Instrumen tervalidasi klinis untuk mengukur dan mendeteksi tingkat gejala kecemasan umum yang dirasakan selama 2 minggu terakhir.
                  </p>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#4338CA]" aria-hidden="true" />
                    <span>3 - 5 Menit</span>
                  </span>
                  <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#4338CA]" aria-hidden="true" />
                    <span>7 Skala Likert</span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => onStartAssessment('FRM-GAD7')}
                  className="inline-flex w-full min-h-[40px] items-center justify-center gap-2 rounded-xl border border-[#C7D2FE] bg-[#EEF2FF] px-4 py-2.5 text-xs font-bold text-[#4338CA] transition-colors hover:bg-[#E0E7FF] shadow-xs focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#4338CA]/20"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Isi Kuesioner GAD-7</span>
                </button>
              </div>
            </div>
          </div>

          {/* Workflow Card: Alur Telekonsultasi SelfCare ID */}
          <section
            aria-label="SOP alur telekonsultasi SelfCare ID"
            className="card-hover rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
              <div className="flex items-center gap-2 font-display text-sm font-bold text-[#0F172A]">
                <span>⤹ Alur Telekonsultasi SelfCare ID</span>
              </div>
              <span className="text-xs font-semibold text-[#64748B]">
                SOP Layanan Pasien
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {/* Step 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0D9488] text-[10px] font-bold text-[#FFFFFF]">
                    1
                  </span>
                  <FileText className="h-3.5 w-3.5 text-[#0D9488]" aria-hidden="true" />
                </div>
                <h4 className="font-display text-xs font-bold text-[#0F172A]">Isi Form</h4>
                <p className="text-[11px] leading-relaxed text-[#64748B]">
                  Pasien mengisi self-assessment keluhan fisik atau psikis.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#334155] text-[10px] font-bold text-[#FFFFFF]">
                    2
                  </span>
                  <Stethoscope className="h-3.5 w-3.5 text-[#334155]" aria-hidden="true" />
                </div>
                <h4 className="font-display text-xs font-bold text-[#0F172A]">Review Medis</h4>
                <p className="text-[11px] leading-relaxed text-[#64748B]">
                  Dokter/perawat meninjau data & meminta klarifikasi jika butuh.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#334155] text-[10px] font-bold text-[#FFFFFF]">
                    3
                  </span>
                  <Video className="h-3.5 w-3.5 text-[#334155]" aria-hidden="true" />
                </div>
                <h4 className="font-display text-xs font-bold text-[#0F172A]">Konsultasi</h4>
                <p className="text-[11px] leading-relaxed text-[#64748B]">
                  Tatap muka daring melalui platform video clinical console.
                </p>
              </div>

              {/* Step 4 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#059669] text-[10px] font-bold text-[#FFFFFF]">
                    4
                  </span>
                  <Pill className="h-3.5 w-3.5 text-[#059669]" aria-hidden="true" />
                </div>
                <h4 className="font-display text-xs font-bold text-[#0F172A]">Resep & Hasil</h4>
                <p className="text-[11px] leading-relaxed text-[#64748B]">
                  Laporan klinis resmi serta e-resep masuk ke rekam medis.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Profil Pasien & Informasi Layanan Klinis */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card 1: IDENTITAS TERVERIFIKASI */}
          <div className="card-hover rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" aria-hidden="true" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#334155]">
                  IDENTITAS TERVERIFIKASI
                </span>
              </div>
              <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0F172A]">
                {patientId}
              </span>
            </div>

            {/* Avatar & Patient Name */}
            <div className="mt-4 flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#99F6E4] bg-[#CCFBF1] font-display text-base font-bold text-[#0F766E] shadow-xs">
                {getInitials(patientName)}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-display text-base font-bold text-[#0F172A]">
                  {patientName}
                </h3>
                <p className="truncate text-xs text-[#64748B]">
                  RM: {patientRm}
                </p>
                <p className="text-xs text-[#64748B]">
                  Perempuan • 21 Tahun
                </p>
              </div>
            </div>

            {/* Info Table Rows */}
            <div className="mt-4 divide-y divide-[#E2E8F0] border-t border-[#E2E8F0] text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-[#64748B]">Akun Mahasiswa</span>
                <span className="font-mono font-bold text-[#0F172A]">{config.nim}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#64748B]">Program Studi</span>
                <span className="font-semibold text-[#334155]">{config.kelas} - Informatika</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#64748B]">Peran Dalam Sistem</span>
                <span className="rounded-full bg-[#CCFBF1] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
                  Pasien Simulasi Klinis
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#64748B]">Sinkronisasi terakhir</span>
                <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
                  <RotateCw className="h-3 w-3" aria-hidden="true" />
                  <span>2 menit yang lalu</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Panduan & Informasi Layanan Klinis Pasien */}
          <div className="card-hover rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0D9488]" aria-hidden="true" />
                <h3 className="font-display text-sm font-bold text-[#0F172A]">
                  Layanan Klinis Terpadu
                </h3>
              </div>
              <span className="rounded-md bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 text-[11px] font-semibold text-[#065F46]">
                Siap Melayani
              </span>
            </div>

            <div className="mt-3.5 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <Clock className="h-4 w-4 text-[#0D9488] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F172A] block">Jam Operasional Konsultasi</span>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Senin – Jumat: 08.00 – 16.00 WIB</p>
                  <p className="text-[10px] text-teal-700 font-semibold mt-0.5">Peninjauan draf mandiri aktif 24 jam</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <Stethoscope className="h-4 w-4 text-[#0D9488] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F172A] block">Waktu Tanggap Dokter</span>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Rata-rata 15–30 menit setelah asesmen dikirim</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-amber-50/70 p-3 border border-amber-200/80">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block">Kondisi Gawat Darurat?</span>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                    Hubungi Call Center Medis <strong>119</strong> atau segera kunjungi IGD Rumah Sakit terdekat.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-[#E2E8F0] pt-3 text-right">
              <button
                type="button"
                onClick={() => onNavigateSubView('riwayat')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D9488] transition-colors hover:text-[#0F766E] hover:underline"
              >
                <span>Lihat Riwayat &amp; Status Pelacakan</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
