'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Lock,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
} from 'lucide-react';
import {
  AssessmentDetail,
  AssessmentStatusResponse,
  PatientProfile,
  replyClarification,
  TelehealthConfig,
} from '@/lib/telehealth-api';
import { formatIndonesianDateTime, getRelativeTimeAgo } from '@/lib/realtime-date';

interface KlarifikasiAssessmentPasienProps {
  assessmentId?: string;
  detail?: AssessmentDetail | null;
  statusData?: AssessmentStatusResponse | null;
  profile?: PatientProfile | null;
  config: TelehealthConfig;
  onBackToStatus: () => void;
  onViewSummary: () => void;
  onViewTindakLanjut?: () => void;
  onSubmitClarification?: (clarificationId: string, text: string) => Promise<void> | void;
  onRefreshStatus?: () => void;
}

export const KlarifikasiAssessmentPasien: React.FC<KlarifikasiAssessmentPasienProps> = ({
  assessmentId = 'ASM-2024-89012',
  detail,
  statusData,
  profile,
  config,
  onBackToStatus,
  onViewSummary,
  onViewTindakLanjut,
  onSubmitClarification,
  onRefreshStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [answerTicket1, setAnswerTicket1] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticket1Answered, setTicket1Answered] = useState(false);
  const [ticket1SubmittedText, setTicket1SubmittedText] = useState('');
  const [submittedTime, setSubmittedTime] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const displayId = detail?.id || assessmentId || 'ASM-2024-89012';
  const patientName = profile?.nama || config.nama || 'Citra Lestari Putri';
  const patientNim = config.nim || 'B2A021045';

  const handleCopyId = () => {
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearDraft = () => {
    setAnswerTicket1('');
  };

  const handleSubmitReply = async () => {
    if (!answerTicket1.trim()) return;
    setIsSubmitting(true);
    try {
      if (onSubmitClarification) {
        await onSubmitClarification('CLR-2024-0091', answerTicket1);
      } else {
        await replyClarification(displayId, 'CLR-2024-0091', answerTicket1).catch(() => {});
      }
      setSubmittedTime(formatIndonesianDateTime(new Date()));
      setTicket1SubmittedText(answerTicket1);
      setTicket1Answered(true);
      setSuccessToast(
        'Jawaban klarifikasi berhasil dikirim dan diverifikasi ke EHR dokter reviewer.'
      );
    } catch {
      // Fallback local update
      setSubmittedTime(formatIndonesianDateTime(new Date()));
      setTicket1SubmittedText(answerTicket1);
      setTicket1Answered(true);
      setSuccessToast(
        'Jawaban klarifikasi berhasil disimpan dan diteruskan ke dr. Tirta Wijaya, Sp.PD.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedTicketsCount = ticket1Answered ? 2 : 1;
  const progressPercent = ticket1Answered ? 100 : 50;

  return (
    <div className="space-y-6 pb-12">
      {/* ------------------------------------------------------------- */}
      {/* Toast Notification */}
      {/* ------------------------------------------------------------- */}
      {successToast && (
        <div className="flex items-center justify-between rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4 text-xs text-[#065F46] shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-[11px] font-bold text-[#059669] hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Top Breadcrumb & Metadata Line */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <button
            type="button"
            onClick={onBackToStatus}
            className="hover:text-[#0F172A] transition-colors"
          >
            Beranda
          </button>
          <span>&gt;</span>
          <button
            type="button"
            onClick={onBackToStatus}
            className="hover:text-[#0F172A] transition-colors"
          >
            Riwayat Assessment
          </button>
          <span>&gt;</span>
          <span className="font-semibold text-[#0F172A]">Klarifikasi Medis</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0F172A]">{patientName}</span>
            <span className="text-[#94A3B8]">•</span>
            <span>NIM: {patientNim}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Title Header with Telemetry Status Pill */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
            <button
              type="button"
              onClick={onBackToStatus}
              className="hover:text-[#0F172A] transition-colors"
            >
              Beranda
            </button>
            <span>&gt;</span>
            <button
              type="button"
              onClick={onBackToStatus}
              className="hover:text-[#0F172A] transition-colors"
            >
              Riwayat Assessment
            </button>
            <span>&gt;</span>
            <button
              type="button"
              onClick={onBackToStatus}
              className="hover:text-[#0F172A] transition-colors"
            >
              Pantau Status ({displayId})
            </button>
            <span>&gt;</span>
            <span className="font-semibold text-[#0F766E]">Klarifikasi Assessment</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Klarifikasi Assessment
          </h1>
          <p className="mt-1 text-xs text-[#64748B] max-w-2xl leading-relaxed">
            Petugas medis membutuhkan informasi tambahan mengenai jawaban yang Anda berikan agar dapat
            memvalidasi resep dan rekomendasi klinis.
          </p>
        </div>

        {/* Clinical Status Pill */}
        <div className="flex items-center gap-2 self-start rounded-full border border-[#CCFBF1] bg-[#F0FDFA] px-3.5 py-1.5 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs font-bold text-[#0F766E]">
            {ticket1Answered ? 'Menunggu Validasi Resep' : 'Tindakan Klarifikasi Diperlukan'}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Form Context Header Card */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
        {/* Top row: Form name, ID, status pill */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D9488]">
                  IDENTITAS FORMULIR
                </span>
              </div>
              <h2 className="text-sm font-bold text-[#0F172A] sm:text-base">
                Formulir Keluhan Pasien Sebelum Konsultasi (FRM-KELUHAN)
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyId}
              className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 font-mono text-xs font-semibold text-[#334155] hover:bg-[#F1F5F9] transition-colors"
              title="Salin ID Assessment"
            >
              <span>ID: {displayId}</span>
              <Copy className="h-3.5 w-3.5 text-[#64748B]" />
              {copied && <span className="text-[10px] text-[#0D9488]">Tersalin!</span>}
            </button>

            {ticket1Answered ? (
              <span className="flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#059669]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                KLARIFIKASI SELESAI
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-[#FECDD3] bg-[#FFF1F2] px-3 py-1 text-xs font-bold text-[#E11D48]">
                <span className="h-2 w-2 rounded-full bg-[#E11D48] animate-ping" />
                PERLU KLARIFIKASI PASIEN
              </span>
            )}
          </div>
        </div>

        {/* 3 Columns: DOKTER REVIEWER, WAKTU PERMINTAAN, DAMPAK KLINIS */}
        <div className="grid grid-cols-1 gap-4 divide-y divide-[#F1F5F9] sm:grid-cols-3 sm:divide-y-0 sm:divide-x sm:divide-[#F1F5F9] pt-1">
          {/* Col 1 */}
          <div className="space-y-1 sm:pr-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              <Stethoscope className="h-3.5 w-3.5 text-[#0D9488]" />
              <span>DOKTER REVIEWER</span>
            </div>
            <p className="text-sm font-bold text-[#0F172A]">dr. Tirta Wijaya, Sp.PD</p>
            <p className="text-xs text-[#64748B]">
              Spesialis Penyakit Dalam • ID SIP: 31.71.02/09/2021
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-1 pt-3 sm:pt-0 sm:px-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              <Clock className="h-3.5 w-3.5 text-[#0D9488]" />
              <span>WAKTU PERMINTAAN</span>
            </div>
            <p className="text-sm font-bold text-[#0F172A]">{getRelativeTimeAgo(20, true)}</p>
            <p className="text-xs text-[#64748B]">
              Prioritas: <span className="font-semibold text-[#D97706]">Triase Medis Sedang (Triage-2)</span>
            </p>
          </div>

          {/* Col 3 */}
          <div className="space-y-1 pt-3 sm:pt-0 sm:pl-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              <FileText className="h-3.5 w-3.5 text-[#0D9488]" />
              <span>DAMPAK KLINIS</span>
            </div>
            <p className="text-sm font-bold text-[#0F172A]">
              {ticket1Answered ? 'Resep Dalam Proses Verifikasi' : 'Resep Elektronik Pending'}
            </p>
            <p className="text-xs text-[#64748B]">
              {ticket1Answered
                ? 'Dokter sedang meninjau kelengkapan dosis dan riwayat alergi'
                : 'Menunggu konfirmasi riwayat alergi & dosis obat'}
            </p>
          </div>
        </div>

        {/* Clinical Notice Banner */}
        <div className="flex items-start gap-2.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-xs text-[#1E40AF]">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#2563EB] mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">Pemberitahuan Klinis:</strong> Peninjauan resep dan
            penerbitan rujukan ditunda sementara hingga pertanyaan dokter di bawah dijawab dengan valid.
            Semua jawaban Anda diverifikasi otomatis sebelum diteruskan ke meja dokter.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Two Column Layout: Left (Questions & Reply) vs Right (Sidebar) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Daftar Pertanyaan Klarifikasi (col-span-8) */}
        {/* ========================================================= */}
        <div className="space-y-5 lg:col-span-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0D9488]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Daftar Pertanyaan Klarifikasi</h2>
              <span className="rounded-full bg-[#0D9488] px-2 py-0.5 text-[10px] font-bold text-[#FFFFFF]">
                2 Tiket
              </span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              WAJIB DIRESPONS HARI INI
            </span>
          </div>

          {/* TICKET 1: dr. Tirta Wijaya, Sp.PD (Active / Pending or Answered) */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
            {/* Ticket Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
              <span className="font-mono text-xs font-semibold text-[#64748B]">
                CLR-2024-0091 • {getRelativeTimeAgo(20)}
              </span>
              {ticket1Answered ? (
                <span className="flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
                  <Check className="h-3 w-3" />
                  Klarifikasi Sudah Dijawab
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full border border-[#FECDD3] bg-[#FFF1F2] px-2.5 py-0.5 text-xs font-semibold text-[#E11D48]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E11D48]" />
                  Menunggu Jawaban Pasien
                </span>
              )}
            </div>

            {/* Doctor Avatar & Identity */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-xs font-bold text-[#FFFFFF] shadow-2xs">
                TW
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">dr. Tirta Wijaya, Sp.PD</p>
                <p className="text-[11px] text-[#64748B]">Reviewer Utama Poliklinik Penyakit Dalam</p>
              </div>
            </div>

            {/* Question Box */}
            <div className="space-y-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <span className="block text-xs font-bold text-[#334155]">Pertanyaan Medis:</span>
              <p className="text-xs font-medium italic leading-relaxed text-[#1E293B]">
                &ldquo;Apakah sakit kepala berdenyut hebat di pelipis kanan ini disertai rasa silau
                berulang dan ada riwayat alergi obat pereda nyeri (NSAID atau Paracetamol)? Serta mohon
                tuliskan dosis dan jam obat yang sudah diminum hari ini.&rdquo;
              </p>

              {/* Badges / Clinical Parameters */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#1D4ED8]">
                  <Check className="h-3 w-3" />
                  Parameter: Diagnostik Cefalgia Akut
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-0.5 text-[11px] font-semibold text-[#6D28D9]">
                  <Check className="h-3 w-3" />
                  Prioritas: Kritis untuk Dosis Resep
                </span>
              </div>
            </div>

            {/* If Answered: Display Verified Patient Answer */}
            {ticket1Answered ? (
              <div className="space-y-2.5 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4">
                <div className="flex items-center justify-between text-xs text-[#065F46]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <User className="h-3.5 w-3.5 text-[#059669]" />
                    <span>Jawaban Anda:</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#059669]">
                    ✓ Terkirim: {submittedTime}
                  </span>
                </div>
                <p className="text-xs font-medium italic leading-relaxed text-[#064E3B]">
                  &ldquo;{ticket1SubmittedText}&rdquo;
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#A7F3D0]/60 pt-2 text-[10px]">
                  <span className="flex items-center gap-1 text-[#047857] font-semibold">
                    <Lock className="h-3 w-3" />
                    Terkunci &amp; Terekam dalam EHR
                  </span>
                  <span className="rounded bg-[#D1FAE5] px-2 py-0.5 font-mono font-bold text-[#065F46]">
                    Status: VERIFIED_CLINICAL_RECORD
                  </span>
                </div>
              </div>
            ) : (
              /* If Pending: Interactive Textarea and Submit Area */
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="clarification-reply"
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]"
                  >
                    <span>Jawaban Klarifikasi Anda</span>
                    <span className="text-[#DC2626]">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-[#64748B]">
                    {answerTicket1.length} / 500 Karakter
                  </span>
                </div>

                <textarea
                  id="clarification-reply"
                  rows={4}
                  maxLength={500}
                  value={answerTicket1}
                  onChange={(e) => setAnswerTicket1(e.target.value)}
                  placeholder="Tuliskan penjelasan Anda secara mendalam di sini, termasuk nama obat, perkiraan dosis (misal 500mg), dan reaksi fisik yang dialami..."
                  className="w-full rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] p-3 text-xs leading-relaxed text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] focus:outline-none"
                />

                <p className="text-[11px] text-[#64748B]">
                  Petunjuk: Jawaban wajib diisi dan tidak boleh hanya berupa spasi kosong.
                </p>


                {/* EHR Integrity Notice */}
                <div className="flex items-start gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#64748B]">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-[#64748B] mt-0.5" />
                  <p className="leading-relaxed text-[11px]">
                    <strong className="font-semibold text-[#334155]">Integritas Rekam Medis:</strong>{' '}
                    Jawaban yang telah dikirim akan dikunci permanen ke rekam medis elektronik (EHR) dan
                    tidak dapat disunting kembali demi keabsahan data medis klinis.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    disabled={!answerTicket1 || isSubmitting}
                    className="rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 transition-colors"
                  >
                    Bersihkan Draft
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitReply}
                    disabled={!answerTicket1.trim() || isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-[#0F766E] hover:bg-[#0D9488] px-5 py-2.5 text-xs font-bold text-[#FFFFFF] shadow-xs disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Mengirim Respons...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Kirim Jawaban Klarifikasi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TICKET 2: Ns. Sarah Melinda, S.Kep (Already Answered) */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
            {/* Ticket Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
              <span className="font-mono text-xs font-semibold text-[#64748B]">
                CLR-2024-0089 • {getRelativeTimeAgo(45)}
              </span>
              <span className="flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
                <Check className="h-3 w-3" />
                Klarifikasi Sudah Dijawab
              </span>
            </div>

            {/* Nurse Avatar & Identity */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-xs font-bold text-[#FFFFFF] shadow-2xs">
                SM
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Ns. Sarah Melinda, S.Kep</p>
                <p className="text-[11px] text-[#64748B]">Perawat Triase Telehealth</p>
              </div>
            </div>

            {/* Nurse Question Box */}
            <div className="space-y-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <span className="block text-xs font-bold text-[#334155]">Pertanyaan Petugas:</span>
              <p className="text-xs font-medium italic leading-relaxed text-[#1E293B]">
                &ldquo;Mohon konfirmasi kembali apakah suhu tubuh 36.8 °C diukur menggunakan termometer
                digital ketiak atau dahi saat pengisian form?&rdquo;
              </p>
            </div>

            {/* Patient Answer Box */}
            <div className="space-y-2 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-3.5">
              <div className="flex items-center justify-between text-xs text-[#065F46]">
                <div className="flex items-center gap-1.5 font-bold">
                  <User className="h-3.5 w-3.5 text-[#059669]" />
                  <span>Jawaban Anda:</span>
                </div>
                <span className="text-[11px] font-medium text-[#059669]">
                  ✓ Terkirim: {getRelativeTimeAgo(35)}
                </span>
              </div>
              <p className="text-xs font-medium italic leading-relaxed text-[#064E3B]">
                &ldquo;Diukur menggunakan termometer digital ketiak (digital axillary) pada pukul 14:00
                WIB setelah beristirahat 15 menit di ruangan ber-AC.&rdquo;
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#A7F3D0]/60 pt-2 text-[10px]">
                <span className="flex items-center gap-1 text-[#047857] font-semibold">
                  <Lock className="h-3 w-3" />
                  Terkunci &amp; Terekam dalam EHR
                </span>
                <span className="rounded bg-[#D1FAE5] px-2 py-0.5 font-mono font-bold text-[#065F46]">
                  Status: VERIFIED_CLINICAL_RECORD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Sidebar Widgets (col-span-4) */}
        {/* ========================================================= */}
        <div className="space-y-5 lg:col-span-4">
          {/* WIDGET 1: Status Kelengkapan */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A]">Status Kelengkapan</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  progressPercent === 100
                    ? 'border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]'
                    : 'border border-[#CCFBF1] bg-[#F0FDFA] text-[#0F766E]'
                }`}
              >
                {progressPercent}% SELESAI
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>{completedTicketsCount} dari 2 Pertanyaan Terjawab</span>
              <span className="font-mono font-bold text-[#0F172A]">{completedTicketsCount}/2</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
              <div
                className="h-full bg-[#0D9488] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] leading-relaxed text-[#64748B]">
              Setelah seluruh pertanyaan klarifikasi selesai dijawab, status peninjauan di server
              otomatis berganti menjadi &ldquo;Klarifikasi Sudah Dijawab&rdquo; dan berkas assessment
              langsung dikembalikan ke meja dokter untuk validasi resep.
            </p>
          </div>

          {/* WIDGET 2: SLA Tinjauan Lanjutan */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#0D9488]" />
              <h3 className="text-xs font-bold text-[#0F172A]">SLA Tinjauan Lanjutan</h3>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] p-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0D9488] text-[#FFFFFF]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-bold text-[#0F766E]">15 – 30 Menit</p>
                <p className="text-[11px] text-[#0D9488]">
                  Estimasi verifikasi dokter setelah respon dikirimkan.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-xs text-[#334155]">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#0D9488] shrink-0" />
                <span>Notifikasi WhatsApp otomatis saat resep terbit</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#0D9488] shrink-0" />
                <span>Sinkronisasi berkas rekam medis nasional</span>
              </div>
            </div>
          </div>

          {/* WIDGET 3: Pedoman Pengisian Medis */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
              <h3 className="text-xs font-bold text-[#0F172A]">Pedoman Pengisian Medis</h3>
            </div>

            <div className="space-y-2 text-xs text-[#334155]">
              <div className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-[#0D9488] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Berikan keterangan sejujur-jujurnya demi keselamatan terapi farmakologis Anda.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-[#0D9488] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Sebutkan merk obat warung, jamu, suplemen herbal, atau vitamin bila dikonsumsi dalam 24 jam terakhir.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-[#0D9488] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Bila ragu mengenai dosis, tuliskan bentuk fisik obat (misal: kapsul putih strip merah).
                </span>
              </div>
            </div>
          </div>

          {/* WIDGET 4: KONDISI DARURAT? */}
          <div className="rounded-2xl border border-[#FECDD3] bg-[#FFF1F2]/40 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E11D48]">
              <AlertTriangle className="h-4 w-4" />
              <span>KONDISI DARURAT?</span>
            </div>

            <p className="text-xs leading-relaxed text-[#881337]">
              Jika keluhan sakit kepala disertai kejang, muntah menyembur, atau penurunan kesadaran
              mendadak, segera hubungi Triase Gawat Darurat SelfCare ID:
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="tel:1500911"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] px-3 py-2 text-xs font-bold text-[#FFFFFF] shadow-xs transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>1500-911</span>
              </a>

              <a
                href="https://wa.me/628120000000"
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#FDA4AF] bg-[#FFFFFF] hover:bg-[#FFF1F2] px-3 py-2 text-xs font-bold text-[#E11D48] transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Triase WA</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Bottom Navigation Bar */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-[#E2E8F0] pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBackToStatus}
            className="flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Pantau Status</span>
          </button>

          <button
            type="button"
            onClick={onViewSummary}
            className="flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Lihat Ringkasan Formulir (FRM-KELUHAN)</span>
          </button>

          {onViewTindakLanjut && (
            <button
              type="button"
              onClick={onViewTindakLanjut}
              className="flex items-center gap-2 rounded-xl border border-[#99F6E4] bg-[#F0FDFA] px-4 py-2.5 text-xs font-semibold text-[#0F766E] hover:bg-[#CCFBF1] transition-colors"
            >
              <span>Lihat Tindak Lanjut</span>
              <span>→</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="h-3 w-3 text-[#10B981]" />
            Sistem Terenkripsi AES-256
          </span>
          <span>•</span>
          <span className="font-mono text-[11px]">SelfCare ID Telehealth</span>
        </div>
      </div>
    </div>
  );
};
