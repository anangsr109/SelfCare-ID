'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  RefreshCw,
  Copy,
  CheckCheck,
  CheckCircle2,
  FileText,
  User,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Send,
  Phone,
  Download,
  Lock,
  Code2,
  Eye,
  Check,
  Building2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import {
  AssessmentDetail,
  AssessmentStatusResponse,
  PatientProfile,
  TelehealthConfig,
} from '@/lib/telehealth-api';
import {
  formatIndonesianDateTime,
  getRelativeTimeAgo,
  getRealtimeISOString,
} from '@/lib/realtime-date';

interface PantauStatusAssessmentProps {
  assessmentId?: string;
  statusData?: AssessmentStatusResponse | null;
  detail?: AssessmentDetail | null;
  profile?: PatientProfile | null;
  config: TelehealthConfig;
  onBackToHistory: () => void;
  onViewSummary: () => void;
  onRefreshStatus?: () => void;
  onSubmitClarification?: (text: string) => Promise<void> | void;
  onOpenClarification?: () => void;
}

export const PantauStatusAssessment: React.FC<PantauStatusAssessmentProps> = ({
  assessmentId = 'ASM-2024-89012',
  statusData,
  detail,
  profile,
  config,
  onBackToHistory,
  onViewSummary,
  onRefreshStatus,
  onSubmitClarification,
  onOpenClarification,
}) => {
  const [copied, setCopied] = useState(false);
  const [replyText, setReplyText] = useState(
    'Sakit kepala tidak disertai silau yang parah, saya sudah minum Paracetamol 500mg 1 tablet jam 12 siang. Tidak ada riwayat alergi obat sebelumnya.'
  );
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [isJsonOpen, setIsJsonOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Simulation state for backend review stages (dev tool)
  const [simulatedState, setSimulatedState] = useState<'perlu_klarifikasi' | 'sedang_ditinjau' | 'sudah_ditinjau'>('perlu_klarifikasi');

  const displayId = detail?.id || assessmentId || 'ASM-2024-89012';
  const patientName = profile?.nama || config.nama || 'Citra Lestari Putri';
  const patientNim = config.nim || 'B2A021045';
  const patientRm = profile?.no_rm || 'RM-2024-004821';

  const handleCopyId = () => {
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    showToast(`Nomor assessment ${displayId} berhasil disalin ke papan klip!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      if (onSubmitClarification) {
        await onSubmitClarification(replyText);
      }
      setReplySuccess(true);
      showToast('Tanggapan klarifikasi berhasil dikirimkan ke meja dokter peninjau.');
    } catch {
      showToast('Gagal mengirim jawaban klarifikasi. Silakan coba kembali.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const jsonPayloadString = JSON.stringify(
    {
      status: 'success',
      code: 200,
      data: {
        assessment_id: displayId,
        transaction_status: 'terkirim',
        review_status: simulatedState,
        lifecycle_index: simulatedState === 'perlu_klarifikasi' ? 4 : simulatedState === 'sedang_ditinjau' ? 3 : 6,
        patient: {
          nim: patientNim,
          medical_record_no: patientRm,
          full_name: patientName,
        },
        reviewer: {
          doctor_id: 'DOC-7721',
          name: 'dr. Tirta Wijaya, Sp.PD',
          department: 'Penyakit Dalam',
        },
        clarification_request:
          simulatedState === 'perlu_klarifikasi'
            ? {
                timestamp: getRealtimeISOString(20),
                prompt:
                  'Apakah sakit kepala disertai rasa silau berulang dan ada alergi paracetamol atau NSAID sebelumnya? Mohon tuliskan dosis obat yang sudah diminum hari ini.',
                action_required: true,
              }
            : null,
        estimated_sla_minutes: 25,
        last_sync: getRealtimeISOString(0),
      },
    },
    null,
    2
  );

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-xs font-semibold text-[#065F46] shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Breadcrumbs */}
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
          Pantau Status ({displayId})
        </span>
      </nav>

      {/* 2. Main Title Row & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Pantau Status Assessment
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Tersinkronisasi Real-Time
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Ketahui perkembangan proses peninjauan laporan dan instruksi klinis dari dokter pemeriksa Anda.
          </p>
        </div>

        {/* Right Info & Action Buttons */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <div className="text-[11px] text-slate-400">
            Status live-sync otomatis diperbarui baru saja
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefreshStatus}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              <span>Refresh Status</span>
            </button>

            <button
              type="button"
              onClick={onBackToHistory}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Riwayat</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Top Banner Card: Assessment Overview */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Info */}
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-700">
              <FileText className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  {displayId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  {copied ? (
                    <CheckCheck className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span>Salin</span>
                </button>
                <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                  RAWAT JALAN SPESIALIS
                </span>
              </div>
              <h2 className="font-bold text-base text-slate-900">
                Formulir Keluhan Pasien Sebelum Konsultasi (FRM-KELUHAN)
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Diajukan: {getRelativeTimeAgo(50, true)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Protokol FHIR R4 • AES-256
                </span>
              </div>
            </div>
          </div>

          {/* Right Info: Pasien & Dokter Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
            {/* Pasien */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-xs text-teal-800">
                CL
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  PASIEN TERDAFTAR
                </div>
                <div className="font-bold text-xs text-slate-900">{patientName}</div>
                <div className="font-mono text-[10px] text-slate-500">
                  NIM: {patientNim} • RM: 004821
                </div>
              </div>
            </div>

            {/* Dokter */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-white">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  DOKTER PENINJAU
                </div>
                <div className="font-bold text-xs text-slate-900">dr. Tirta Wijaya, Sp.PD</div>
                <div className="text-[10px] text-slate-500">Spesialis Penyakit Dalam</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dual Status Cards (Pengiriman vs Peninjauan) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Card 1: Status Pengiriman */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                INTEGRITAS JARINGAN & PAYLOAD
              </div>
              <h3 className="font-bold text-sm text-slate-900">Status Pengiriman</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              TERKIRIM (200)
            </span>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">Terkirim ke Server EHR</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                Payload validasi klinis telah diterima utuh oleh Server Telehealth pada {getRelativeTimeAgo(50)}.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Enkripsi Terverifikasi
            </span>
            <span className="font-mono text-[11px] text-slate-400">Latency: 142ms</span>
          </div>
        </div>

        {/* Card 2: Status Peninjauan */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                TAHAP VERIFIKASI DOKTER
              </div>
              <h3 className="font-bold text-sm text-slate-900">Status Peninjauan</h3>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold ${
              simulatedState === 'perlu_klarifikasi'
                ? 'border border-rose-200 bg-rose-50 text-rose-700'
                : simulatedState === 'sedang_ditinjau'
                ? 'border border-cyan-200 bg-cyan-50 text-cyan-700'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                simulatedState === 'perlu_klarifikasi' ? 'bg-rose-600' : 'bg-teal-600'
              }`} />
              {simulatedState === 'perlu_klarifikasi'
                ? 'PERLU KLARIFIKASI'
                : simulatedState === 'sedang_ditinjau'
                ? 'SEDANG DITINJAU'
                : 'SUDAH DITINJAU'}
            </span>
          </div>

          <div className="space-y-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">SIKLUS HIDUP STATUS LAPORAN</span>
              <span className="font-semibold text-slate-500">
                {simulatedState === 'perlu_klarifikasi' ? 'Langkah 4 dari 6' : simulatedState === 'sedang_ditinjau' ? 'Langkah 3 dari 6' : 'Langkah 6 dari 6'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {simulatedState === 'perlu_klarifikasi'
                ? 'Dokter telah memeriksa berkas dan memerlukan data tambahan sebelum menerbitkan saran tindakan klinis atau resep pendukung.'
                : simulatedState === 'sedang_ditinjau'
                ? 'Berkas sedang dalam tahap analisis mendalam oleh tim dokter triase.'
                : 'Pemeriksaan laporan telah selesai. Arahan dan rekomendasi klinis telah diterbitkan.'}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="flex items-center gap-1 font-semibold text-rose-600">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              Tindakan pasien diperlukan segera
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              State: {simulatedState}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Special Alert: Pemberitahuan Tim Medis Rawat Jalan */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-2xs">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-sm text-rose-950">
                  Pemberitahuan Tim Medis Rawat Jalan
                </h4>
                <span className="text-xs text-rose-700">
                  {getRelativeTimeAgo(20)} • dr. Tirta Wijaya, Sp.PD
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-700 leading-relaxed italic">
                &ldquo;Petugas meminta informasi tambahan mengenai durasi riwayat nyeri kepala berulang dan obat pereda nyeri yang pernah diminum 3 hari terakhir. Silakan jawab pertanyaan klarifikasi agar peninjauan resep dan rujukan dapat dilanjutkan.&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onOpenClarification) {
                  onOpenClarification();
                } else {
                  const el = document.getElementById('step-4-clarification');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0D9488] transition-colors cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Jawab Klarifikasi Sekarang</span>
            </button>
            <button
              type="button"
              onClick={onViewSummary}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Lihat Salinan"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Timeline Peninjauan Klinis vs Sidebar Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Timeline Peninjauan Klinis (8 cols) */}
        {/* ========================================================= */}
        <div className="space-y-4 lg:col-span-8">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  JEJAK REKAM AUDIT
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  Timeline Peninjauan Klinis
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="text-emerald-700">✓ 3 Selesai</span>
                <span className="text-slate-300">•</span>
                <span className="text-rose-600 font-semibold">⏳ 1 Perlu Aksi</span>
              </div>
            </div>

            {/* Steps Flow */}
            <div className="relative pl-6 space-y-6 border-l-2 border-slate-200">
              {/* STEP 1: Assessment Dibuat */}
              <div className="relative space-y-1">
                <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4 className="font-bold text-sm text-slate-900">1. Assessment Dibuat</h4>
                  <span className="text-xs text-slate-400">{getRelativeTimeAgo(75)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Draf formulir keluhan awal diprakarsai dan diisi oleh pasien Citra Lestari Putri melalui portal web telehealth.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                    Klien Web SelfCare ID
                  </span>
                  <span className="text-slate-400">IP: 182.253.xx.xx</span>
                </div>
              </div>

              {/* STEP 2: Assessment Terkirim & Tervalidasi */}
              <div className="relative space-y-1">
                <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    2. Assessment Terkirim & Tervalidasi
                  </h4>
                  <span className="text-xs text-slate-400">{getRelativeTimeAgo(50)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Formulir berhasil ditandatangani digital dan dikirim. Payload tervalidasi skema FHIR QuestionnaireResponse v4.0.1 tanpa error sintaksis.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Validasi Lolos
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-slate-500">Status: terkirim</span>
                </div>
              </div>

              {/* STEP 3: Mulai Ditinjau oleh Tim Medis */}
              <div className="relative space-y-1">
                <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    3. Mulai Ditinjau oleh Tim Medis
                  </h4>
                  <span className="text-xs text-slate-400">{getRelativeTimeAgo(35)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Berkas diterima di antrean klinis Poli Penyakit Dalam dan dibuka untuk asesmen telaah awal oleh dr. Tirta Wijaya, Sp.PD.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-teal-800">
                  <span className="rounded bg-teal-50 px-2 py-0.5 font-semibold border border-teal-200">
                    TM dr. Tirta Wijaya, Sp.PD (Reviewer Utama)
                  </span>
                </div>
              </div>

              {/* STEP 4: Permintaan Klarifikasi Medis (AKTIF / INPUT INTERAKTIF) */}
              <div id="step-4-clarification" className="relative space-y-3">
                <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-2xs">
                  <AlertCircle className="h-4 w-4" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-rose-950">
                      4. Permintaan Klarifikasi Medis
                    </h4>
                    <span className="rounded-full border border-rose-200 bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                      Menunggu Respon Pasien
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{getRelativeTimeAgo(20)}</span>
                </div>

                {/* Dokter Prompt Box */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-800 space-y-1">
                  <span className="font-bold text-slate-700">Pertanyaan Dokter:</span>
                  <p className="italic text-slate-900 leading-relaxed">
                    &ldquo;Apakah sakit kepala disertai rasa silau berulang dan ada alergi paracetamol atau NSAID sebelumnya? Mohon tuliskan dosis obat yang sudah diminum hari ini.&rdquo;
                  </p>
                </div>

                {/* Reply Form */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                  <label
                    htmlFor="clarification-reply-input"
                    className="block text-xs font-bold text-slate-700"
                  >
                    Tulis Balasan / Klarifikasi Anda:
                  </label>
                  <textarea
                    id="clarification-reply-input"
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Contoh: Sakit kepala tidak disertai silau, saya sudah minum Paracetamol 500mg 1 tablet jam 12 siang, tidak ada riwayat alergi obat..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0F766E] focus:bg-white focus:outline-none transition-all leading-relaxed"
                  />

                  {replySuccess && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Jawaban klarifikasi berhasil dikirimkan ke dokter pemeriksa!</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                    <p className="text-[11px] text-slate-400">
                      Klarifikasi akan langsung diteruskan ke catatan peninjauan dr. Tirta.
                    </p>

                    <button
                      type="button"
                      disabled={isSubmittingReply || !replyText.trim()}
                      onClick={handleSendReply}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0D9488] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isSubmittingReply ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Mengirim...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Kirim Tanggapan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 5: Klarifikasi Dijawab Pasien */}
              <div className="relative space-y-1 opacity-60">
                <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4 className="font-bold text-sm text-slate-700">
                    5. Klarifikasi Dijawab Pasien & Validasi Lanjutan
                  </h4>
                  <span className="text-xs text-slate-400">Belum Tercapai</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sistem mengunci jawaban klarifikasi dan melanjutkan kembali instruksi skrining dokter untuk pembuatan resume final.
                </p>
              </div>

              {/* STEP 6: Sudah Ditinjau & Arahan Telekonsultasi */}
              <div className="relative space-y-1 opacity-60">
                <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4 className="font-bold text-sm text-slate-700">
                    6. Sudah Ditinjau & Arahan Telekonsultasi Terbit
                  </h4>
                  <span className="text-xs text-slate-400">Tahap Akhir</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Dokter menyetujui resume asesmen, merilis rekomendasi penanganan, dan membuka link temu video konsultasi tatap muka online.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Sidebar Widgets (4 cols) */}
        {/* ========================================================= */}
        <div className="space-y-4 lg:col-span-4">
          {/* Widget 1: Estimasi Waktu Respon SLA */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>ESTIMASI WAKTU RESPON (SLA)</span>
            </div>
            <div className="flex items-baseline gap-1 text-[#0F172A]">
              <span className="text-3xl font-extrabold tracking-tight">15 – 30</span>
              <span className="text-sm font-semibold text-slate-500">menit</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dihitung setelah dokter menyelesaikan respon klarifikasi. Dokter akan diprioritaskan memeriksa indikasi tanda vital laporan.
            </p>
          </div>

          {/* Widget 2: Aksi Cepat & Navigasi */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-2">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Aksi Cepat & Navigasi
            </h4>
            <div className="space-y-1.5 pt-1 text-xs">
              <button
                type="button"
                onClick={onViewSummary}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 hover:bg-slate-50 transition-colors font-medium text-slate-700 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>Lihat Salinan Jawaban Form</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 hover:bg-slate-50 transition-colors font-medium text-slate-700 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-slate-400" />
                  <span>Unduh Bukti Tanda Terima (PDF)</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => showToast('Audit Log Keamanan Data: Terverifikasi oleh SHA-256 pada node EHR SelfCare ID.')}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 hover:bg-slate-50 transition-colors font-medium text-slate-700 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span>Audit Log Keamanan Data</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Widget 3: Simulasi State API (Dev Tool) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SIMULASI STATE API
              </span>
              <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                Dev Tool
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Pratinjau tampilan antarmuka saat status peninjauan berganti di backend:
            </p>
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSimulatedState('perlu_klarifikasi')}
                className={`rounded-lg py-1.5 px-2 text-[11px] transition-all cursor-pointer ${
                  simulatedState === 'perlu_klarifikasi'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Perlu Klarifikasi
              </button>
              <button
                type="button"
                onClick={() => setSimulatedState('sedang_ditinjau')}
                className={`rounded-lg py-1.5 px-2 text-[11px] transition-all cursor-pointer ${
                  simulatedState === 'sedang_ditinjau'
                    ? 'bg-cyan-600 text-white shadow-2xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Sedang Ditinjau
              </button>
              <button
                type="button"
                onClick={() => setSimulatedState('sudah_ditinjau')}
                className={`rounded-lg py-1.5 px-2 text-[11px] transition-all cursor-pointer ${
                  simulatedState === 'sudah_ditinjau'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Sudah Ditinjau
              </button>
            </div>
          </div>

          {/* Widget 4: Bantuan Triase Medis (Teal Dark Box) */}
          <div className="rounded-2xl bg-[#0F766E] p-5 text-white shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Bantuan Triase Medis</h4>
                <div className="text-[11px] text-teal-100">Siaga 24 Jam Pasien Telehealth</div>
              </div>
            </div>

            <p className="text-xs text-teal-50/90 leading-relaxed">
              Mengalami perburukan gejala mendadak seperti sesak napas berat atau nyeri dada? Segera hubungi perawat triase atau unit gawat darurat.
            </p>

            <div className="flex items-center justify-between rounded-xl bg-teal-900/40 p-2.5 border border-teal-500/30">
              <span className="font-mono text-xs font-bold tracking-wider">
                0812-CARE-FLOW
              </span>
              <a
                href="tel:0812-CARE-FLOW"
                className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-[#0F766E] hover:bg-slate-100 transition-colors shadow-2xs"
              >
                Panggil
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Accordion: Data Respons Status API (Live JSON Payload) */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsJsonOpen(!isJsonOpen)}
          className="w-full flex items-center justify-between p-4 bg-slate-50/80 hover:bg-slate-100/80 transition-colors cursor-pointer border-b border-slate-100 text-left"
        >
          <div className="flex items-center gap-2.5">
            <Code2 className="h-4 w-4 text-slate-500" />
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900">
                Data Respons Status API (Live JSON Payload)
              </div>
              <div className="text-[11px] text-slate-400">
                Struktur data telemetri klinis yang dikembalikan oleh endpoint API SelfCare ID
              </div>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isJsonOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isJsonOpen && (
          <div className="p-4 bg-[#0F172A]">
            <pre className="font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              {jsonPayloadString}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
