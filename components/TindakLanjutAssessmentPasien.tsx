'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building,
  Building2,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  Home,
  Hourglass,
  Info,
  Lock,
  MessageSquare,
  Phone,
  Printer,
  RefreshCw,
  Share2,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  User,
  Video,
} from 'lucide-react';
import {
  AssessmentDetail,
  AssessmentStatusResponse,
  PatientProfile,
  TelehealthConfig,
} from '@/lib/telehealth-api';
import {
  formatIndonesianFullDate,
  getRelativeTimeAgo,
} from '@/lib/realtime-date';

export type TindakLanjutApiFormatType =
  | 'jadwalkan_konsultasi'
  | 'pemantauan_mandiri'
  | 'rujuk_faskes'
  | 'kunjungan_fisik'
  | 'selesai_edukasi'
  | 'belum_ada';

interface TindakLanjutAssessmentPasienProps {
  assessmentId?: string;
  detail?: AssessmentDetail | null;
  statusData?: AssessmentStatusResponse | null;
  profile?: PatientProfile | null;
  config: TelehealthConfig;
  onBackToHasil: () => void;
  onTrackStatus: () => void;
  onNavigateHome: () => void;
  onEnterVirtualRoom?: (roomCode: string) => void;
  onDownloadPdf?: () => void;
}

export const TindakLanjutAssessmentPasien: React.FC<TindakLanjutAssessmentPasienProps> = ({
  assessmentId = 'ASM-2024-89012',
  detail,
  statusData,
  profile,
  config,
  onBackToHasil,
  onTrackStatus,
  onNavigateHome,
  onEnterVirtualRoom,
  onDownloadPdf,
}) => {
  const [selectedFormat, setSelectedFormat] =
    useState<TindakLanjutApiFormatType>('jadwalkan_konsultasi');
  const [copiedRoomCode, setCopiedRoomCode] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const displayId = detail?.id || assessmentId || 'ASM-2024-89012';
  const patientName = profile?.nama || config.nama || 'Citra Lestari Putri';
  const patientNim = config.nim || 'B2A021045';
  const patientRm = profile?.no_rm || 'RM-2024-004821';
  const roomCode = 'CF-ROOM-89012';
  const appointmentDateStr = formatIndonesianFullDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedRoomCode(true);
    showToast('Kode ruang temu virtual berhasil disalin!');
    setTimeout(() => setCopiedRoomCode(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(displayId);
    setCopiedId(true);
    showToast('ID Berkas Rekam Medis berhasil disalin!');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownload = () => {
    if (onDownloadPdf) {
      onDownloadPdf();
    } else {
      window.print();
    }
  };

  const handleAddToCalendar = () => {
    showToast(`Jadwal konsultasi ${appointmentDateStr} ditambahkan ke kalender.`);
  };

  const handleSendWaReminder = () => {
    const text = encodeURIComponent(
      `Pengingat Konsultasi SelfCare ID: Jadwal Telekonsultasi dr. Tirta Wijaya, Sp.PD pada ${appointmentDateStr} pukul 09:30 WIB. Kode Ruang: ${roomCode}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
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
      {/* Top Breadcrumb & Metadata Line */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <button
            type="button"
            onClick={onNavigateHome}
            className="hover:text-[#0F172A] transition-colors"
          >
            Beranda
          </button>
          <span>&gt;</span>
          <button
            type="button"
            onClick={onBackToHasil}
            className="hover:text-[#0F172A] transition-colors"
          >
            Riwayat Assessment
          </button>
          <span>&gt;</span>
          <span className="font-semibold text-[#0F172A]">Klinis Pasien</span>
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
              onClick={onNavigateHome}
              className="hover:text-[#0F172A] transition-colors"
            >
              Beranda
            </button>
            <span>&gt;</span>
            <button
              type="button"
              onClick={onBackToHasil}
              className="hover:text-[#0F172A] transition-colors"
            >
              Riwayat Assessment
            </button>
            <span>&gt;</span>
            <button
              type="button"
              onClick={onTrackStatus}
              className="hover:text-[#0F172A] transition-colors"
            >
              Pantau Status ({displayId})
            </button>
            <span>&gt;</span>
            <span className="font-semibold text-[#0F766E]">Tindak Lanjut</span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Tindak Lanjut
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#99F6E4] bg-[#CCFBF1] px-2.5 py-0.5 text-xs font-bold text-[#0F766E]">
              <span className="h-2 w-2 rounded-full bg-[#0D9488]" />
              Resmi &amp; Terverifikasi
            </span>
          </div>
          <p className="mt-1 text-xs text-[#64748B] max-w-2xl leading-relaxed">
            Informasi arahan dan rekomendasi setelah proses peninjauan assessment oleh tim medis
            poliklinik.
          </p>
        </div>

        {/* Clinical Status Pill */}
        <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-[#10B981]" />
          <span className="text-xs font-bold text-emerald-800">
            Peninjauan Selesai • Arahan Terbit
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Top Doctor Reviewer & Patient Summary Card */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-xs">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:items-center">
          {/* Part 1: Doctor Reviewer (md:col-span-6) */}
          <div className="flex items-center gap-3.5 md:col-span-6 md:border-r md:border-[#F1F5F9] md:pr-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] text-[#0D9488]">
              <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A]">dr. Tirta Wijaya, Sp.PD</h2>
                <span className="rounded-md bg-[#CCFBF1]/70 px-2 py-0.5 text-[11px] font-semibold text-[#0F766E]">
                  Dokter Spesialis Penyakit Dalam
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Poliklinik Rawat Jalan SelfCare ID • SIP: 31.71.02/09/2021
              </p>
              <div className="flex items-center gap-1 text-[11px] text-[#64748B] pt-0.5">
                <Clock className="h-3 w-3 text-[#0D9488]" />
                <span>Ditinjau pada: {getRelativeTimeAgo(10, true)}</span>
              </div>
            </div>
          </div>

          {/* Part 2: Identitas Pasien (md:col-span-3) */}
          <div className="space-y-1 md:col-span-3 md:border-r md:border-[#F1F5F9] md:px-6">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              IDENTITAS PASIEN
            </span>
            <p className="text-sm font-bold text-[#0F172A]">{patientName}</p>
            <p className="text-xs text-[#64748B]">
              NIM: {patientNim} • {patientRm}
            </p>
          </div>

          {/* Part 3: Berkas Rekam Medis (md:col-span-3) */}
          <div className="space-y-1 md:col-span-3 md:pl-6">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              BERKAS REKAM MEDIS
            </span>
            <div className="flex items-center gap-1.5">
              <p className="font-mono text-sm font-bold text-[#0F172A]">{displayId}</p>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-[#64748B] hover:text-[#0D9488] transition-colors"
                title="Salin ID Berkas"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-[#64748B] truncate">FRM-KELUHAN (Pre-C...</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* API Response Format Simulation Bar */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-xs space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#0F766E]">⚙️</span>
            <h3 className="text-xs font-bold text-[#0F172A]">
              Pratinjau Respon Format API Tindak Lanjut
            </h3>
          </div>
          <p className="text-[11px] text-[#64748B]">
            Pilih tipe respons untuk melihat adaptasi tata letak instruksi klinis:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {/* Format 1: Jadwalkan Konsultasi */}
          <button
            type="button"
            onClick={() => setSelectedFormat('jadwalkan_konsultasi')}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              selectedFormat === 'jadwalkan_konsultasi'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'border border-[#CBD5E1] bg-[#FFFFFF] text-[#334155] hover:bg-[#F8FAFC]'
            }`}
          >
            <Video className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Jadwalkan Konsultasi</span>
          </button>

          {/* Format 2: Pemantauan Mandiri */}
          <button
            type="button"
            onClick={() => setSelectedFormat('pemantauan_mandiri')}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              selectedFormat === 'pemantauan_mandiri'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'border border-[#CBD5E1] bg-[#FFFFFF] text-[#334155] hover:bg-[#F8FAFC]'
            }`}
          >
            <Activity className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Pemantauan Mandiri</span>
          </button>

          {/* Format 3: Rujuk Faskes */}
          <button
            type="button"
            onClick={() => setSelectedFormat('rujuk_faskes')}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              selectedFormat === 'rujuk_faskes'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'border border-[#CBD5E1] bg-[#FFFFFF] text-[#334155] hover:bg-[#F8FAFC]'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Rujuk Faskes</span>
          </button>

          {/* Format 4: Kunjungan Fisik */}
          <button
            type="button"
            onClick={() => setSelectedFormat('kunjungan_fisik')}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              selectedFormat === 'kunjungan_fisik'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'border border-[#CBD5E1] bg-[#FFFFFF] text-[#334155] hover:bg-[#F8FAFC]'
            }`}
          >
            <Building className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Kunjungan Fisik</span>
          </button>

          {/* Format 5: Selesai Edukasi */}
          <button
            type="button"
            onClick={() => setSelectedFormat('selesai_edukasi')}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              selectedFormat === 'selesai_edukasi'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'border border-[#CBD5E1] bg-[#FFFFFF] text-[#334155] hover:bg-[#F8FAFC]'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Selesai Edukasi</span>
          </button>

          {/* Format 6: Belum Ada (Null) */}
          <button
            type="button"
            onClick={() => setSelectedFormat('belum_ada')}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              selectedFormat === 'belum_ada'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'border border-[#CBD5E1] bg-[#FFFFFF] text-[#334155] hover:bg-[#F8FAFC]'
            }`}
          >
            <Hourglass className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Belum Ada (Null)</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Two Column Layout: Left (Main Advice) vs Right (Schedule / Action) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN (~65% width / col-span-8) */}
        {/* ========================================================= */}
        <div className="space-y-6 lg:col-span-8">
          {/* Main Content Card */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs space-y-5">
            {/* Category Tag & Title */}
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
                  KATEGORI KEPUTUSAN MEDIS
                </span>
                <span className="rounded-full border border-[#99F6E4] bg-[#CCFBF1] px-3 py-0.5 text-xs font-bold text-[#0F766E]">
                  {selectedFormat === 'jadwalkan_konsultasi' && 'Jadwalkan Konsultasi'}
                  {selectedFormat === 'pemantauan_mandiri' && 'Pemantauan Mandiri'}
                  {selectedFormat === 'rujuk_faskes' && 'Rujukan Faskes Lanjutan'}
                  {selectedFormat === 'kunjungan_fisik' && 'Pemeriksaan Fisik Langsung'}
                  {selectedFormat === 'selesai_edukasi' && 'Selesai Edukasi Mandiri'}
                  {selectedFormat === 'belum_ada' && 'Dalam Proses Telaah Medis'}
                </span>
              </div>

              <h2 className="text-xl font-bold text-[#0F172A] pt-1">
                {selectedFormat === 'jadwalkan_konsultasi' &&
                  'Telekonsultasi Virtual Spesialis Penyakit Dalam'}
                {selectedFormat === 'pemantauan_mandiri' &&
                  'Observasi Tanda Vital Mandiri Selama 3x24 Jam'}
                {selectedFormat === 'rujuk_faskes' &&
                  'Surat Pengantar Rujukan Rawat Jalan ke RS Mitra SelfCare ID'}
                {selectedFormat === 'kunjungan_fisik' &&
                  'Konsultasi Tatap Muka di Poliklinik Rawat Jalan'}
                {selectedFormat === 'selesai_edukasi' &&
                  'Panduan Gaya Hidup Sehat & Pencegahan Sefalgi Berulang'}
                {selectedFormat === 'belum_ada' &&
                  'Menunggu Penetapan Arahan Klinis Dokter'}
              </h2>
              <p className="mt-0.5 text-xs text-[#64748B]">
                {selectedFormat === 'jadwalkan_konsultasi' &&
                  'Tindakan lanjutan yang disarankan berdasarkan keluhan sefalgi & riwayat formulir klinis.'}
                {selectedFormat === 'pemantauan_mandiri' &&
                  'Pasien dianjurkan mencatat perkembangan nyeri dan tanda vital secara berkala.'}
                {selectedFormat === 'rujuk_faskes' &&
                  'Diperlukan pemeriksaan penunjang diagnostik spesifik di rumah sakit rekanan.'}
                {selectedFormat === 'kunjungan_fisik' &&
                  'Pemeriksaan fisik langsung diperlukan untuk evaluasi refleks motorik.'}
                {selectedFormat === 'selesai_edukasi' &&
                  'Edukasi klinis preventif dan rekomendasi hidrasi harian.'}
                {selectedFormat === 'belum_ada' &&
                  'Berkas assessment Anda sedang ditelaah oleh dokter spesialis peninjau.'}
              </p>
            </div>

            {/* Doctor Official Recommendation Box */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0D9488]" />
                <h3 className="text-xs font-bold text-[#0F172A]">Arahan Resmi Dokter Peninjau</h3>
              </div>

              <p className="text-xs font-medium italic leading-relaxed text-[#1E293B]">
                {selectedFormat === 'jadwalkan_konsultasi' &&
                  '“Berdasarkan keluhan sakit kepala berdenyut unilateral dan konfirmasi jawaban klarifikasi bahwa tidak ada riwayat alergi NSAID, kami jadwalkan konsultasi video daring untuk evaluasi resep terapi profilaksis dan tatalaksana migrain/cefalgia. Mohon hindari paparan cahaya layar berlebih dan siapkan catatan jam timbulnya nyeri sebelum sesi temu dimulai.”'}
                {selectedFormat === 'pemantauan_mandiri' &&
                  '“Kondisi keluhan stabil dan tidak menunjukkan kegawatdaruratan akut. Pasien disarankan melakukan pemantauan mandiri di rumah: catat frekuensi sakit kepala dan ukur suhu tubuh 2x sehari. Laporkan kembali melalui formulir jika rasa sakit menetap lebih dari 3 hari.”'}
                {selectedFormat === 'rujuk_faskes' &&
                  '“Berdasarkan pertimbangan klinis dan riwayat keluhan, diperlukan pemeriksaan diagnostik lanjutan berupa Neuro-imaging (CT-Scan Kepala) di fasilitas kesehatan rujukan. Surat pengantar elektronik telah diterbitkan untuk RS Mitra.”'}
                {selectedFormat === 'kunjungan_fisik' &&
                  '“Diperlukan palpasi fisik dan pemeriksaan neurologis langsung di meja periksa klinik rawat jalan. Silakan datang ke loket pendaftaran poli spesialis dengan membawa barcode antrean ini.”'}
                {selectedFormat === 'selesai_edukasi' &&
                  '“Keluhan tergolong tension headache ringan dipicu stres dan kelelahan visual. Konsumsi cairan cukup 2 liter per hari, atur pola tidur teratur, dan batasi screen time maksimal 2 jam tanpa jeda.”'}
                {selectedFormat === 'belum_ada' &&
                  '“Assessment Anda saat ini telah masuk ke antrean dokter spesialis dan sedang dalam proses analisis klinis lanjutan. Arahan tindak lanjut resmi akan terbit setelah dokter menyelesaikan telaah rekam medis.”'}
              </p>
            </div>

            {/* 2 Metadata Cards: Pencatat & Waktu Pencatatan */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    PENCATAT TINDAK LANJUT
                  </span>
                  <p className="text-xs font-bold text-[#0F172A]">dr. Tirta Wijaya, Sp.PD</p>
                  <p className="text-[11px] text-[#64748B]">Kolaborasi: Ns. Sarah Melinda, S.Kep</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    WAKTU PENCATATAN
                  </span>
                  <p className="text-xs font-bold text-[#0F172A]">{getRelativeTimeAgo(8)}</p>
                  <p className="text-[11px] text-[#64748B]">Sinkron ke Rekam Medis (EHR)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Tata Cara & Persiapan Sebelum Konsultasi */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[#0D9488] font-bold">📋</span>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Tata Cara &amp; Persiapan Sebelum Konsultasi
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F766E] text-xs font-bold text-white shadow-2xs">
                  1
                </div>
                <h4 className="text-xs font-bold text-[#0F172A]">Koneksi &amp; Perangkat</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Pastikan jaringan internet stabil, uji kamera depan dan mikrofon headset sebelum
                  masuk ruangan.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F766E] text-xs font-bold text-white shadow-2xs">
                  2
                </div>
                <h4 className="text-xs font-bold text-[#0F172A]">Lokasi Tenang</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Pilih ruangan berpenerangan cukup dan privat agar diskusi privasi keluhan medis
                  berjalan leluasa.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F766E] text-xs font-bold text-white shadow-2xs">
                  3
                </div>
                <h4 className="text-xs font-bold text-[#0F172A]">Bawa Dokumen &amp; Obat</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Siapkan KTP/KTM, botol obat rutin jika ada, serta catatan waktu timbulnya rasa nyeri
                  kepala.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (~35% width / col-span-4) */}
        {/* ========================================================= */}
        <div className="space-y-5 lg:col-span-4">
          {/* Main Action Schedule Card (Dark Green Card: bg-[#044E42]) */}
          <div className="rounded-2xl bg-[#044E42] p-5 text-white shadow-md space-y-4">
            {/* Top row badges */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded-full bg-[#065F46] px-2.5 py-0.5 text-[11px] font-bold text-[#A7F3D0]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
                JADWAL TERKONFIRMASI
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90">
                30 Menit Sesi
              </span>
            </div>

            {/* Time Title */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                WAKTU KONSULTASI DOKTER
              </span>
              <p className="text-xl font-bold tracking-tight text-white mt-1">{appointmentDateStr}</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">09:30 <span className="text-base font-normal">WIB</span></p>
              <p className="text-xs text-emerald-100/80 mt-1">Sesi berlangsung: 09:30 - 10:00 WIB</p>
            </div>

            {/* Room Code Box */}
            <div className="rounded-xl bg-[#033B32] p-3 flex items-center justify-between border border-emerald-900/50">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                  KODE RUANG TEMU VIRTUAL
                </span>
                <span className="font-mono text-sm font-bold text-white tracking-wide">
                  {roomCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] text-emerald-200 font-medium">
                  <Lock className="h-3 w-3 text-emerald-400" />
                  End-to-End Encrypted
                </span>
                <button
                  type="button"
                  onClick={handleCopyRoomCode}
                  className="rounded-lg bg-emerald-800/80 p-1.5 text-white hover:bg-emerald-700 transition-colors"
                  title="Salin Kode Ruangan"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Big Action Button */}
            <button
              type="button"
              onClick={() => {
                if (onEnterVirtualRoom) {
                  onEnterVirtualRoom(roomCode);
                } else {
                  showToast('Menghubungkan ke Ruang Temu Virtual CF-ROOM-89012...');
                }
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-[#044E42] shadow-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Video className="h-4 w-4 text-[#044E42]" />
              <span>Masuk Ruang Temu Virtual</span>
            </button>

            {/* Hint below button */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-100/90 text-center">
              <Info className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
              <span>Ruang temu aktif 10 menit sebelum jadwal (09:20 WIB)</span>
            </div>

            {/* Quick Link Actions */}
            <div className="flex items-center justify-between border-t border-emerald-800/70 pt-3 text-xs">
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="flex items-center gap-1.5 text-emerald-100 hover:text-white transition-colors"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Tambahkan ke Google Calendar</span>
              </button>

              <button
                type="button"
                onClick={handleSendWaReminder}
                className="flex items-center gap-1.5 text-emerald-100 hover:text-white transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Kirim Pengingat WA</span>
              </button>
            </div>
          </div>

          {/* Mini Info Card: Konsol Rawat Daring SelfCare ID */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-xs flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
              <span className="font-bold text-xs">Poli 04</span>
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-[#0F172A] truncate">
                Konsol Rawat Daring SelfCare ID
              </h4>
              <p className="text-[11px] text-[#64748B] line-clamp-2">
                Sesi terintegrasi dengan pemantauan tekanan darah, riwayat alergi, dan resep...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Safety & Integrity Guarantee Banner */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-xs flex items-start gap-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-[#0F172A]">
            Jaminan Keamanan &amp; Integritas Medis SelfCare ID
          </h4>
          <p className="text-xs leading-relaxed text-[#64748B]">
            Arahan tindak lanjut ini disusun langsung oleh tenaga medis terverifikasi berdasarkan data
            klinis dan jawaban klarifikasi yang Anda berikan. Bukan merupakan hasil diagnosis otomatis
            kecerdasan buatan. Apabila mengalami kegawatdaruratan sebelum jadwal temu, hubungi 119 atau
            segera kunjungi Instalasi Gawat Darurat (IGD) rumah sakit terdekat.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Bottom Navigation & Action Bar */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-[#E2E8F0] pt-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToHasil}
            className="flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Hasil Assessment</span>
          </button>

          <button
            type="button"
            onClick={onTrackStatus}
            className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors"
          >
            <span>👁</span>
            <span>Pantau Status</span>
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors"
          >
            <Home className="h-4 w-4 text-[#64748B]" />
            <span>Beranda</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] hover:bg-[#0D9488] px-5 py-2.5 text-xs font-bold text-[#FFFFFF] shadow-xs transition-colors cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>Unduh Lembar Arahan Klinis (PDF)</span>
        </button>
      </div>
    </div>
  );
};
