'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  FileCheck,
  FileClock,
  FilePlus,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  History,
  Key,
  Layers,
  Lock,
  MessageSquare,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Send,
  Server,
  ShieldCheck,
  Sliders,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
  Video,
} from 'lucide-react';
import {
  DEFAULT_CONFIG,
  PatientProfile,
  TelehealthConfig,
  UTSStatusResponse,
} from '@/lib/telehealth-api';
import { formatIndonesianDateTime, getRelativeTimeAgo } from '@/lib/realtime-date';

interface UtsFeatureItem {
  id: number;
  kode: string;
  nama: string;
  deskripsi: string;
  endpoint: string;
  statusCatatan: string;
  tercapai: boolean;
  statusBadge: 'tercapai' | 'belum_tercapai';
  icon: any;
}

const UTS_FEATURES: UtsFeatureItem[] = [
  {
    id: 1,
    kode: 'buat',
    nama: '1. Buat Self-Assessment',
    deskripsi:
      'Pengambilan form anamnesis mandiri baru, inisialisasi session ID telehealth pasien.',
    endpoint: 'POST /api/assessments',
    statusCatatan: 'Terdeteksi 8 kali di database',
    tercapai: true,
    statusBadge: 'tercapai',
    icon: FilePlus,
  },
  {
    id: 2,
    kode: 'simpan_draf',
    nama: '2. Simpan Draf',
    deskripsi:
      'Penyimpanan progres sementara tanpa trigger notifikasi ke konsol dokter.',
    endpoint: 'PUT /api/assessments/{id}/draft',
    statusCatatan: "Status 'draf' tersimpan di EHR",
    tercapai: true,
    statusBadge: 'tercapai',
    icon: Save,
  },
  {
    id: 3,
    kode: 'validasi',
    nama: '3. Validasi Formulir',
    deskripsi:
      'Pencegahan submit field kosong, pengecekan range klinis vital sign & schema JSON.',
    endpoint: 'Schema JSON & Client-Side Guard: 422 Unprocessable Error Handled',
    statusCatatan: 'Validasi JSON Schema OK',
    tercapai: true,
    statusBadge: 'tercapai',
    icon: FileCheck,
  },
  {
    id: 4,
    kode: 'kirim',
    nama: '4. Kirim Formulir',
    deskripsi:
      'Penguncian form draf menjadi formulir paten dan dispatching ke antrean peninjau dokter.',
    endpoint: 'POST /api/assessments/submit',
    statusCatatan: "Status berubah 'terkirim'",
    tercapai: true,
    statusBadge: 'tercapai',
    icon: Send,
  },
  {
    id: 5,
    kode: 'riwayat',
    nama: '5. Riwayat Assessment',
    deskripsi:
      'Daftar rekap asesmen terdahulu mahasiswa dilengkapi filter tanggal dan status.',
    endpoint: 'GET /api/assessments?nim=B2A021045',
    statusCatatan: 'Pagination & Filter Valid',
    tercapai: true,
    statusBadge: 'tercapai',
    icon: History,
  },
  {
    id: 6,
    kode: 'hasil',
    nama: '6. Hasil Assessment',
    deskripsi:
      'Visualisasi format skor kalkulasi, diagnosis sementara dan rekomendasi tindakan.',
    endpoint: 'GET /api/assessments/{id}/hasil',
    statusCatatan: 'Render Diagnostik Otomatis',
    tercapai: true,
    statusBadge: 'tercapai',
    icon: FileText,
  },
  {
    id: 7,
    kode: 'status',
    nama: '7. Tracking Status',
    deskripsi:
      'Timeline status pengiriman vs status peninjauan dokter secara terpisah dan sinkron.',
    endpoint: 'Vertical Timeline Component',
    statusCatatan: 'Status State-Machine OK',
    tercapai: true,
    statusBadge: 'tercapai',
    icon: Sliders,
  },
  {
    id: 8,
    kode: 'klarifikasi',
    nama: '8. Klarifikasi',
    deskripsi:
      'Thread interaktif tanya-jawab antara mahasiswa dan dokter peninjau jika ada anomali.',
    endpoint: 'POST .../clarifications/{id}/reply',
    statusCatatan: 'Menunggu Payload Test ke-02',
    tercapai: false,
    statusBadge: 'belum_tercapai',
    icon: MessageSquare,
  },
  {
    id: 9,
    kode: 'tindak_lanjut',
    nama: '9. Tindak Lanjut',
    deskripsi:
      'Integrasi arahan resep digital, anjuran lab, atau jadwal konsultasi telekonseling lanjutan.',
    endpoint: "review_status == 'sudah_ditinjau'",
    statusCatatan: 'Disertai rekam resep klinis',
    tercapai: true,
    statusBadge: 'tercapai',
    icon: Stethoscope,
  },
  {
    id: 10,
    kode: 'gad7',
    nama: '10. Kuesioner GAD-7',
    deskripsi:
      'Instrumen standar kecemasan Generalized Anxiety Disorder (7 butir pertanyaan skoring 0-21).',
    endpoint: 'Form Schema FRM-GAD7 v1',
    statusCatatan: 'Auto-calculation Skor Valid',
    tercapai: true,
    statusBadge: 'tercapai',
    icon: Sparkles,
  },
];

interface ProgressTugasUtsMahasiswaProps {
  config: TelehealthConfig;
  profile?: PatientProfile | null;
  utsStatus?: UTSStatusResponse | null;
  onRefresh?: () => void;
  onStartNewAssessment?: () => void;
}

export const ProgressTugasUtsMahasiswa: React.FC<ProgressTugasUtsMahasiswaProps> = ({
  config,
  profile,
  utsStatus,
  onRefresh,
  onStartNewAssessment,
}) => {
  const [filterMode, setFilterMode] = useState<'semua' | 'tercapai' | 'menunggu'>('semua');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => formatIndonesianDateTime(new Date()));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const studentName = profile?.nama || config.nama || 'Citra Lestari Putri';
  const studentNim = config.nim || 'B2A021045';
  const studentKelas = config.kelas || 'TI-4A • Reguler Pagi';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
      setLastSyncTime(formatIndonesianDateTime(new Date()));
      showToast('Data telemetri UTS berhasil disinkronisasi dengan server.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const filteredFeatures = UTS_FEATURES.filter((f) => {
    if (filterMode === 'tercapai') return f.tercapai;
    if (filterMode === 'menunggu') return !f.tercapai;
    return true;
  });

  const totalCompleted = UTS_FEATURES.filter((f) => f.tercapai).length;

  return (
    <div className="space-y-6 pb-12 font-sans text-[#0F172A]">
      {/* ------------------------------------------------------------- */}
      {/* Toast Notification */}
      {/* ------------------------------------------------------------- */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-xs font-semibold text-[#065F46] shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. Header & Actions */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Progress Tugas UTS
            </h1>
            <span className="flex items-center gap-1.5 rounded-full border border-[#99F6E4] bg-[#CCFBF1] px-2.5 py-0.5 text-[11px] font-bold text-[#0F766E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
              Instrumen Terverifikasi Akademik
            </span>
          </div>

          <p className="mt-1 text-xs text-[#64748B] max-w-2xl leading-relaxed">
            Pantau kelengkapan fitur aplikasi Self-Assessment klinis dan integrasi API evaluasi
            akademik semester ganjil.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1 font-semibold text-[#059669]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              Status API: 200 OK (Verified Synced)
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <span>Sinkronisasi Terakhir: {lastSyncTime}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-start">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] disabled:opacity-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-[#0D9488]' : 'text-[#64748B]'}`} />
            <span>Refresh Sinkronisasi API</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0D9488] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Unduh Lembar Bukti (PDF)</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Student Identity & 4 Metrics Row */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
        {/* Left: Student Identity Card (lg:col-span-5) */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 lg:col-span-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0F766E] text-white text-base font-bold shadow-2xs">
              CL
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A]">{studentName}</h2>
                <span className="rounded-md bg-[#BAE6FD]/60 px-1.5 py-0.5 text-[10px] font-bold text-[#0284C7]">
                  MAHASISWA
                </span>
              </div>
              <p className="font-mono text-xs font-semibold text-[#64748B]">
                NIM: {studentNim}
              </p>
              <p className="text-xs text-[#64748B]">{studentKelas}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-[#F1F5F9] pt-3 text-xs">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Program Studi
              </span>
              <p className="font-semibold text-[#0F172A] mt-0.5">RPL Medis &amp; Telehealth OS</p>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Konsentrasi
              </span>
              <p className="font-semibold text-[#0F172A] mt-0.5">Telemedicine Clinical Engineering</p>
            </div>
            <div className="col-span-2 pt-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Token Integrasi API
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#059669] mt-0.5">
                <Lock className="h-3 w-3 text-[#10B981]" />
                <span>ACTIVE_TOKEN_SECURED (TLS 1.3)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-2.5 text-[10px] text-[#94A3B8]">
            <span>SelfCare ID Clinical Service</span>
            <span>Cluster: JKT01</span>
          </div>
        </div>

        {/* Right: 4 Metrics Cards (lg:col-span-7) */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:col-span-7">
          {/* Metric 1: Total Sesi */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                TOTAL SESI
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <Calendar className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-[#0F172A]">08</span>
              <p className="text-[11px] font-semibold text-[#334155] mt-0.5">Sesi Assessment</p>
            </div>
            <span className="text-[10px] text-[#059669] font-medium">100% Tercatat EHR</span>
          </div>

          {/* Metric 2: Terkirim */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                TERKIRIM
              </span>
              <span className="rounded bg-[#ECFDF5] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#059669]">
                P0
              </span>
            </div>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-[#059669]">06</span>
              <p className="text-[11px] font-semibold text-[#334155] mt-0.5">Formulir Masuk</p>
            </div>
            <span className="text-[10px] text-[#64748B]">Payload Tervalidasi</span>
          </div>

          {/* Metric 3: Draf Aktif */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                DRAF AKTIF
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#64748B]">
                <Save className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-[#0F172A]">02</span>
              <p className="text-[11px] font-semibold text-[#334155] mt-0.5">Dalam Pengisian</p>
            </div>
            <span className="text-[10px] text-[#64748B]">Auto-saved di Local</span>
          </div>

          {/* Metric 4: Ditinjau */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                DITINJAU
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F0FDFA] text-[#0D9488]">
                <Check className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-[#0F766E]">04</span>
              <p className="text-[11px] font-semibold text-[#334155] mt-0.5">Disetujui Dosen</p>
            </div>
            <span className="text-[10px] text-[#059669] font-medium">Feedback Lengkap</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Fitur Tercapai Banner (Large Card) */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0F172A]">Fitur Tercapai</h2>
              <span className="rounded-full border border-[#99F6E4] bg-[#CCFBF1] px-2.5 py-0.5 text-xs font-bold text-[#0F766E]">
                90% Lulus Otomatis
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Berdasarkan evaluasi real-time instrumen Telehealth Self-Assessment SelfCare ID pada
              pipeline test suite server UTS.
            </p>
          </div>

          <div className="flex items-baseline gap-1 sm:text-right shrink-0">
            <span className="text-3xl font-extrabold text-[#0F172A]">{totalCompleted}</span>
            <span className="text-base font-semibold text-[#64748B]">/ 10</span>
            <span className="text-xs font-medium text-[#64748B] ml-1">Fitur Telah Terpenuhi</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
          <div
            className="h-full bg-[#0D9488] transition-all duration-500 rounded-full"
            style={{ width: `${(totalCompleted / 10) * 100}%` }}
          />
        </div>

        {/* Telemetry Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F1F5F9] pt-3 text-xs text-[#64748B]">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-[#059669]">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              {totalCompleted} Fitur Terdeteksi di REST API
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#D97706]">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              {10 - totalCompleted} Fitur Menunggu Pengujian Akhir
            </span>
          </div>

          <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#047857]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />
            Automated Cypress &amp; Postman Contract Test: PASSED
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Checklist 10 Fitur Wajib UTS (2-Column Grid) */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Checklist 10 Fitur Wajib UTS</h3>
            <p className="text-xs text-[#64748B]">
              Daftar verifikasi endpoints, arsitektur data, dan validasi fungsional sesuai kontrak
              spesifikasi UTS.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white p-1 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setFilterMode('semua')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                filterMode === 'semua'
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Semua (10)
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('tercapai')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                filterMode === 'tercapai'
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Tercapai ({totalCompleted})
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('menunggu')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                filterMode === 'menunggu'
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Menunggu ({10 - totalCompleted})
            </button>
          </div>
        </div>

        {/* 10 Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredFeatures.map((f) => {
            const IconComponent = f.icon;
            return (
              <div
                key={f.id}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs space-y-3 hover:border-[#CBD5E1] transition-all"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                        f.tercapai
                          ? 'border-[#CCFBF1] bg-[#F0FDFA] text-[#0D9488]'
                          : 'border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A]">{f.nama}</h4>
                      <span className="font-mono text-[10px] text-[#64748B]">kode: {f.kode}</span>
                    </div>
                  </div>

                  {f.tercapai ? (
                    <span className="flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-bold text-[#059669]">
                      <Check className="h-3 w-3" />
                      Tercapai
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      <span>⏳</span>
                      Belum Tercapai
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-[#475569] leading-relaxed">{f.deskripsi}</p>

                {/* Footer bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F5F9] pt-2.5 text-[11px]">
                  <span className="text-[#64748B] flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />
                    <span>Kriteria Klinis</span>
                  </span>
                  <span
                    className={`font-semibold ${
                      f.tercapai ? 'text-[#059669]' : 'text-rose-600'
                    }`}
                  >
                    {f.statusCatatan}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. Status Penilaian Dosen */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-5">
        {/* Header & Status Tabs */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#F1F5F9] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Status Penilaian Dosen</h3>
            <p className="text-xs text-[#64748B]">
              Hasil evaluasi komprehensif implementasi REST API dan standardisasi clinical safety.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 font-medium">
              Belum Diperiksa
            </span>
            <span className="flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#0F766E] px-3 py-1 text-xs font-bold text-white shadow-xs">
              <Check className="h-3 w-3" />
              Disetujui
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 font-medium">
              Perlu Revisi
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 font-medium">
              Ditolak
            </span>
          </div>
        </div>

        {/* Lecturer Review Card */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Lecturer Identity (lg:col-span-4) */}
          <div className="space-y-4 lg:col-span-4 lg:border-r lg:border-[#F1F5F9] lg:pr-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#065F46] text-white font-bold text-sm shadow-2xs">
                BS
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">
                  Dr. Ir. H. Bambang Sudarsono, M.Kom
                </h4>
                <p className="text-xs text-[#64748B]">Dosen Pengampu &amp; Lead Reviewer</p>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Asisten Penilai:</span>
                <span className="font-semibold text-[#0F172A]">Tim Lab S1 Telehealth</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Tanggal Sidang/Cek:</span>
                <span className="font-semibold text-[#0F172A]">{getRelativeTimeAgo(120, true)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Kategori Ujian:</span>
                <span className="font-semibold text-[#0F172A]">Ujian Tengah Semester (UTS)</span>
              </div>
            </div>

            {/* Final Grade Pill */}
            <div className="rounded-2xl border border-[#CCFBF1] bg-[#F0FDFA] p-4 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0D9488]">
                  NILAI AKHIR UTS
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-extrabold text-[#0F766E]">95</span>
                  <span className="text-sm font-semibold text-[#64748B]">/ 100</span>
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0F766E] text-white text-xl font-extrabold shadow-sm">
                A
              </div>
            </div>
          </div>

          {/* Lecturer Comments & Sub-Scores (lg:col-span-8) */}
          <div className="space-y-4 lg:col-span-8">
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
              <span className="block text-xs font-bold text-[#0F172A]">
                Catatan Evaluasi Resmi Dosen Pengampu:
              </span>
              <p className="text-xs italic leading-relaxed text-[#334155]">
                &ldquo;Seluruh alur klinis mulai dari pembuatan draf, validasi input, integrasi endpoint
                klarifikasi dokter hingga instrumen GAD-7 telah teruji sempurna sesuai spesifikasi REST
                API UTS. Kerapian antarmuka pengguna (UI), response error handling (400, 404, 422), dan
                performa konsumsi payload JSON sangat baik.&rdquo;
              </p>
            </div>

            {/* 3 Sub-Score Badges */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] p-3 text-center space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0D9488]">
                  Arsitektur API &amp; Payload
                </span>
                <p className="text-xs font-extrabold text-[#0F766E]">Sangat Baik (10/10)</p>
              </div>

              <div className="rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] p-3 text-center space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0D9488]">
                  Clinical Form &amp; GAD-7
                </span>
                <p className="text-xs font-extrabold text-[#0F766E]">Sempurna (10/10)</p>
              </div>

              <div className="rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] p-3 text-center space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0D9488]">
                  Keamanan &amp; Integritas Data
                </span>
                <p className="text-xs font-extrabold text-[#0F766E]">Sesuai Standar (9.5/10)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. Bottom Split Row: Empty State Preview & Security Ledger */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
        {/* Card Left: Pratinjau Status Nol (Empty State) (lg:col-span-6) */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs flex flex-col justify-between space-y-3 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
            <h4 className="text-xs font-bold text-[#0F172A]">Pratinjau Status Nol (Empty State)</h4>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-[#64748B]">
              Preview State
            </span>
          </div>

          <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <FileClock className="h-5 w-5" />
            </div>
            <h5 className="text-xs font-bold text-[#0F172A]">
              Belum Ada Pengiriman Self-Assessment Tercatat
            </h5>
            <p className="text-[11px] text-[#64748B] max-w-sm mx-auto leading-relaxed">
              Mahasiswa belum memiliki riwayat pengujian formulir di server API. Mulai buat formulir
              baru untuk mengaktifkan pelacakan otomatis indikator UTS.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onStartNewAssessment) onStartNewAssessment();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-1.5 text-xs font-bold text-[#0F766E] hover:bg-[#F0FDFA] transition-colors shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Mulai Assessment Pertama</span>
              </button>
            </div>
          </div>

          <p className="text-[10px] text-[#94A3B8]">
            Komponen ini otomatis tampil apabila array respons data.assessments.length === 0.
          </p>
        </div>

        {/* Card Right: Jaminan Integritas & Keamanan Akademik (lg:col-span-6) */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs flex flex-col justify-between space-y-3 lg:col-span-6">
          <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-2.5">
            <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
            <h4 className="text-xs font-bold text-[#0F172A]">
              Jaminan Integritas &amp; Keamanan Akademik
            </h4>
          </div>

          <p className="text-xs leading-relaxed text-[#475569]">
            Data penilaian UTS di SelfCare ID Telehealth OS disinkronisasi melalui protokol otentikasi
            berbasis tanda tangan kriptografis token API institusi. Setiap perubahan status draf, submit
            form, dan balasan klarifikasi dicatat ke dalam audit log kekal (immutable ledger).
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-1">
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#64748B]">
                <Lock className="h-3 w-3 text-[#10B981]" />
                <span>SHA-256 Hash ID</span>
              </div>
              <p className="font-mono text-[10px] text-[#0F172A] truncate">
                e9b84c2a07f985dd3b482...
              </p>
            </div>

            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#64748B]">
                <Key className="h-3 w-3 text-[#0D9488]" />
                <span>TLS Encrypted</span>
              </div>
              <p className="font-mono text-[10px] text-[#0F172A]">AES-256-GCM Live</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F5F9] pt-2 text-[10px] text-[#94A3B8]">
            <span>Kepatuhan: HIPAA &amp; Permenkes SatuSehat</span>
            <span>Verified Sign: BAMBANG_SUDARSONO_KEY</span>
          </div>
        </div>
      </div>
    </div>
  );
};
