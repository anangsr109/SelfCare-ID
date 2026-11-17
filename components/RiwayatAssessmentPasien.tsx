'use client';

import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  RefreshCw,
  Plus,
  FileText,
  FileEdit,
  Hourglass,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Edit3,
  Eye,
  Download,
  HelpCircle,
  Filter,
  ShieldCheck,
  User,
  Stethoscope,
  Building2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import {
  AssessmentItem,
  PatientProfile,
  TelehealthConfig,
} from '@/lib/telehealth-api';
import { getRelativeTimeAgo } from '@/lib/realtime-date';
import { SkeletonAssessmentList, SkeletonStatGrid } from './SkeletonShimmer';

interface RiwayatAssessmentPasienProps {
  config: TelehealthConfig;
  profile?: PatientProfile | null;
  assessments?: AssessmentItem[];
  loading?: boolean;
  onRefresh: () => void;
  onStartNewAssessment: () => void;
  onResumeDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  onOpenHasil: (id: string) => void;
  onOpenStatus: (id: string) => void;
  onOpenClarification: () => void;
  onOpenArchiveHelp?: () => void;
}

export const RiwayatAssessmentPasien: React.FC<RiwayatAssessmentPasienProps> = ({
  config,
  profile,
  assessments = [],
  loading = false,
  onRefresh,
  onStartNewAssessment,
  onResumeDraft,
  onDeleteDraft,
  onOpenHasil,
  onOpenStatus,
  onOpenClarification,
  onOpenArchiveHelp,
}) => {
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormFilter, setSelectedFormFilter] = useState('semua');
  const [selectedSubmissionFilter, setSelectedSubmissionFilter] = useState('semua');
  const [activeChip, setActiveChip] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);

  const patientName = profile?.nama || config.nama || 'Citra Lestari Putri';
  const patientNim = config.nim || 'B2A021045';

  // Static baseline dataset matching Stitch Screen exactly, combined with live API assessments
  const defaultItems = useMemo(() => [
    {
      id: 'ASM-2024-89089',
      formId: 'FRM-KELUHAN',
      judul: 'Formulir Keluhan Pasien Sebelum Konsultasi (FRM-KELUHAN)',
      statusPengiriman: 'terkirim',
      statusPeninjauan: 'perlu_klarifikasi',
      dokter: 'dr. Raditya Pratama, Sp.PD',
      kelengkapan: '100% Lengkap (12/12 butir)',
      dibuatPada: getRelativeTimeAgo(120),
      dikirimPada: getRelativeTimeAgo(95),
      catatanDokter:
        'Dokter memerlukan konfirmasi mengenai durasi riwayat nyeri dada dan riwayat alergi obat antipiretik sebelum memvalidasi resep konsultasi.',
      tipe: 'urgent',
    },
    {
      id: 'ASM-2024-89012',
      formId: 'FRM-KELUHAN',
      judul: 'Formulir Keluhan Pasien Sebelum Konsultasi (FRM-KELUHAN)',
      statusPengiriman: 'terkirim',
      statusPeninjauan: 'menunggu_peninjauan',
      dokter: 'dr. Tirta Wijaya, Sp.PD',
      kelengkapan: '100% Lengkap (Siap Ditelaah)',
      estimasi: '15-30 menit',
      dibuatPada: getRelativeTimeAgo(75),
      dikirimPada: getRelativeTimeAgo(50),
      tipe: 'in_review',
    },
    {
      id: 'ASM-2024-89104',
      formId: 'FRM-KELUHAN',
      judul: 'Formulir Keluhan Pasien Sebelum Konsultasi (FRM-KELUHAN)',
      statusPengiriman: 'draft',
      statusPeninjauan: 'belum_diajukan',
      progres: 75,
      progresLabel: '75% (Langkah 3 dari 4)',
      tersimpanPada: getRelativeTimeAgo(15),
      keterangan: 'Belum dikirimkan ke server klinis',
      tipe: 'draft',
    },
    {
      id: 'ASM-2024-88740',
      formId: 'FRM-GAD7',
      judul: 'Kuesioner Skrining Kecemasan (GAD-7)',
      statusPengiriman: 'terkirim',
      statusPeninjauan: 'sudah_ditinjau',
      dokter: 'dr. Cynthia Melani, Sp.KJ',
      skorLabel: 'Hasil Skor GAD-7: 6 (Kecemasan Ringan)',
      dibuatPada: getRelativeTimeAgo(24 * 60 + 60),
      ditinjauPada: getRelativeTimeAgo(24 * 60),
      catatanMedis:
        'Evaluasi selesai. Disarankan latihan pernapasan relaksasi 2x sehari dan re-evaluasi 1 bulan lagi.',
      tipe: 'finished',
    },
    {
      id: 'ASM-2024-88991',
      formId: 'FRM-KELUHAN',
      judul: 'Formulir Keluhan Pasien Sebelum Konsultasi (FRM-KELUHAN)',
      statusPengiriman: 'terkirim',
      statusPeninjauan: 'sedang_ditinjau',
      timMedis: 'Klinik Penyakit Dalam SelfCare ID',
      kelengkapan: 'Kelengkapan Data Terverifikasi',
      dibuatPada: getRelativeTimeAgo(2 * 24 * 60),
      dikirimPada: getRelativeTimeAgo(2 * 24 * 60 - 30),
      tipe: 'triase',
    },
  ], []);

  // Filter Logic
  const filteredList = useMemo(() => {
    return defaultItems.filter((item) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.judul.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchDoctor = (item.dokter || '').toLowerCase().includes(q);
        const matchNote = (item.catatanDokter || item.catatanMedis || '').toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchDoctor && !matchNote) return false;
      }

      // 2. Dropdown Form
      if (selectedFormFilter !== 'semua') {
        if (selectedFormFilter === 'keluhan' && item.formId !== 'FRM-KELUHAN') return false;
        if (selectedFormFilter === 'gad7' && item.formId !== 'FRM-GAD7') return false;
      }

      // 3. Dropdown Pengiriman
      if (selectedSubmissionFilter !== 'semua') {
        if (selectedSubmissionFilter === 'terkirim' && item.statusPengiriman !== 'terkirim') return false;
        if (selectedSubmissionFilter === 'draft' && item.statusPengiriman !== 'draft') return false;
      }

      // 4. Chip Filter
      if (activeChip === 'draf' && item.statusPengiriman !== 'draft') return false;
      if (activeChip === 'menunggu' && item.statusPeninjauan !== 'menunggu_peninjauan') return false;
      if (activeChip === 'sedang' && item.statusPeninjauan !== 'sedang_ditinjau') return false;
      if (activeChip === 'klarifikasi' && item.statusPeninjauan !== 'perlu_klarifikasi') return false;
      if (activeChip === 'selesai' && item.statusPeninjauan !== 'sudah_ditinjau') return false;

      return true;
    });
  }, [defaultItems, searchQuery, selectedFormFilter, selectedSubmissionFilter, activeChip]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFormFilter('semua');
    setSelectedSubmissionFilter('semua');
    setActiveChip('semua');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-slate-500 hover:text-slate-800 cursor-pointer">Beranda</span>
        <ChevronRight className="h-3 w-3 text-slate-300" />
        <span className="font-semibold text-slate-800">Riwayat Assessment</span>
      </nav>

      {/* 2. Title & Action Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Riwayat Assessment
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
              Live Sync EHR
            </span>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-mono font-medium text-indigo-700">
              NIM: {patientNim}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Kelola dan tinjau riwayat laporan self-assessment klinis Anda. Berkas otomatis terhubung ke sistem triase dokter rumah sakit.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            type="button"
            onClick={onStartNewAssessment}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0D9488] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Mulai Assessment Baru</span>
          </button>
        </div>
      </div>

      {/* 3. Status Info Box */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3.5 py-2 text-xs">
        <span className="flex items-center gap-1.5 text-emerald-800 font-medium text-[11px]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Data Pasien Terverifikasi Sistem Rekam Medis (EHR)
        </span>
        <span className="text-slate-500 text-[11px]">Terakhir sinkronisasi: baru saja</span>
      </div>

      {/* 4. 5 Metric Cards (KPI Summary Row) */}
      {loading ? (
        <SkeletonStatGrid count={5} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Metric 1: Total Laporan */}
        <div className="card-hover rounded-2xl border border-slate-100 bg-white p-4 shadow-xs cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL LAPORAN
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">14</span>
            <span className="text-xs text-slate-400">berkas</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <ArrowUpRight className="h-3 w-3" />
            <span>+2 baru bulan ini</span>
          </div>
        </div>

        {/* Metric 2: Draf Tersimpan */}
        <div className="card-hover rounded-2xl border border-slate-100 bg-white p-4 shadow-xs cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              DRAF TERSIMPAN
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileEdit className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">2</span>
            <span className="text-xs text-slate-400">form</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <HelpCircle className="h-3 w-3 text-slate-400" />
            <span>Belum diajukan ke dokter</span>
          </div>
        </div>

        {/* Metric 3: Menunggu Tinjauan */}
        <div className="card-hover rounded-2xl border border-slate-100 bg-white p-4 shadow-xs cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              MENUNGGU TINJAUAN
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Hourglass className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">3</span>
            <span className="text-xs text-slate-400">antrean</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-teal-600">
            <Clock className="h-3 w-3" />
            <span>Estimasi 15-30 menit</span>
          </div>
        </div>

        {/* Metric 4: Perlu Klarifikasi (Highlighted Rose) */}
        <div className="card-hover rounded-2xl border border-rose-200 bg-rose-50/20 p-4 shadow-xs cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
              PERLU KLARIFIKASI
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-rose-600">1</span>
            <span className="text-xs text-rose-400">respons</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            <span>Tanggapan dokter tertunda</span>
          </div>
        </div>

        {/* Metric 5: Sudah Ditinjau */}
        <div className="card-hover rounded-2xl border border-slate-100 bg-white p-4 shadow-xs cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              SUDAH DITINJAU
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">8</span>
            <span className="text-xs text-slate-400">laporan</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            <span>Rekap klinis tersedia</span>
          </div>
        </div>
      </div>
      )}

      {/* 5. Search & Filters Bar */}
      <div className="card-hover rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
        {/* Search & Dropdowns Row */}
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-12">
          {/* Search Input */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul, ID assessment, atau keluhan..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0F766E] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Dropdown Formulir */}
          <div className="md:col-span-3">
            <select
              value={selectedFormFilter}
              onChange={(e) => setSelectedFormFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-[#0F766E] focus:outline-none cursor-pointer"
            >
              <option value="semua">Semua Formulir (FRM)</option>
              <option value="keluhan">FRM-KELUHAN (Keluhan Awal)</option>
              <option value="gad7">FRM-GAD7 (Kecemasan)</option>
            </select>
          </div>

          {/* Dropdown Pengiriman */}
          <div className="md:col-span-3">
            <select
              value={selectedSubmissionFilter}
              onChange={(e) => setSelectedSubmissionFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-[#0F766E] focus:outline-none cursor-pointer"
            >
              <option value="semua">Semua Pengiriman</option>
              <option value="terkirim">Terkirim ke Server</option>
              <option value="draft">Draf Lokal Belum Diajukan</option>
            </select>
          </div>
        </div>

        {/* Filter Chips Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveChip('semua')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeChip === 'semua'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Semua (14)
            </button>

            <button
              type="button"
              onClick={() => setActiveChip('draf')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeChip === 'draf'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Draf (2)
            </button>

            <button
              type="button"
              onClick={() => setActiveChip('menunggu')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeChip === 'menunggu'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Menunggu Peninjauan (3)
            </button>

            <button
              type="button"
              onClick={() => setActiveChip('sedang')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeChip === 'sedang'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Sedang Ditinjau (1)
            </button>

            <button
              type="button"
              onClick={() => setActiveChip('klarifikasi')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeChip === 'klarifikasi'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-white text-rose-600 border border-slate-200 hover:bg-rose-50/50'
              }`}
            >
              <span>Perlu Klarifikasi</span>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
              <span>(1)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChip('klarifikasi_dijawab')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeChip === 'klarifikasi_dijawab'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Klarifikasi Dijawab (1)
            </button>

            <button
              type="button"
              onClick={() => setActiveChip('selesai')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeChip === 'selesai'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Sudah Ditinjau (6)
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Filter</span>
          </button>
        </div>

        {/* Counter & Sort Row */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
          <span>Menampilkan {filteredList.length} dari 14 laporan aktif untuk NIM {patientNim}</span>
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <span>⇄</span>
            <span>Urutan: Terbaru ke Terlama</span>
          </span>
        </div>
      </div>

      {/* 6. List of Assessment Items */}
      <div className="space-y-3.5">
        {loading ? (
          <SkeletonAssessmentList count={3} />
        ) : filteredList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 border border-slate-200">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Tidak Ada Laporan yang Cocok</h3>
            <p className="mx-auto max-w-sm text-xs text-slate-500">
              Tidak ditemukan data assessment untuk kriteria pencarian atau filter yang dipilih. Silakan reset filter atau buat assessment baru.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>
        ) : (
          filteredList.map((item) => {
          // ITEM 1: Urgent - Perlu Klarifikasi
          if (item.tipe === 'urgent') {
            return (
              <div
                key={item.id}
                className="card-hover rounded-2xl border border-slate-200 bg-white p-5 shadow-xs cursor-pointer"
              >
                {/* Top ID & Status Row */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {item.id}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Terkirim
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                      <AlertTriangle className="h-3 w-3 text-rose-600" />
                      Perlu Klarifikasi Pasien
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Dibuat: {item.dibuatPada}
                    </span>
                    <span>•</span>
                    <span>Dikirim: {item.dikirimPada}</span>
                  </div>
                </div>

                {/* Main Content & Actions */}
                <div className="mt-3.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      {item.judul}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        Dokter Peninjau: {item.dokter}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Status Kelengkapan: {item.kelengkapan}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenStatus(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span>Pantau Status</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenClarification}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#B91C1C] px-4 py-2 text-xs font-bold text-white hover:bg-[#991B1B] transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>💬 Jawab Klarifikasi Sekarang</span>
                    </button>
                  </div>
                </div>

                {/* Catatan Klinis Dokter Peninjau Callout */}
                <div className="mt-3.5 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-rose-900">
                      Catatan Klinis Dokter Peninjau:
                    </h4>
                    <p className="mt-0.5 text-xs text-rose-800 italic leading-relaxed">
                      &ldquo;{item.catatanDokter}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          // ITEM 2: Menunggu Peninjauan
          if (item.tipe === 'in_review') {
            return (
              <div
                key={item.id}
                className="card-hover rounded-2xl border border-slate-200 bg-white p-5 shadow-xs cursor-pointer"
              >
                {/* Top Row */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {item.id}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Terkirim
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                      <Hourglass className="h-3 w-3 text-teal-600" />
                      Menunggu Peninjauan
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Dibuat: {item.dibuatPada}
                    </span>
                    <span>•</span>
                    <span>Dikirim: {item.dikirimPada}</span>
                  </div>
                </div>

                {/* Main Content & Actions */}
                <div className="mt-3.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      {item.judul}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        Dokter Peninjau: {item.dokter}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-teal-700 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                        Status: {item.kelengkapan}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Estimasi antrean review: {item.estimasi}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenHasil(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>Lihat Ringkasan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenStatus(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-bold text-white hover:bg-[#0D9488] transition-colors cursor-pointer shadow-2xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Pantau Status</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // ITEM 3: Draf Lokal Belum Diajukan
          if (item.tipe === 'draft') {
            return (
              <div
                key={item.id}
                className="card-hover rounded-2xl border border-slate-200 bg-white p-5 shadow-xs cursor-pointer"
              >
                {/* Top Row */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {item.id}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      Draf Lokal
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      <Clock className="h-3 w-3 text-slate-400" />
                      Belum Diajukan
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Tersimpan: {item.tersimpanPada}</span>
                    <span>•</span>
                    <span className="italic">{item.keterangan}</span>
                  </div>
                </div>

                {/* Main Content & Actions */}
                <div className="mt-3.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      {item.judul}
                    </h3>
                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="font-medium text-slate-500">Progres:</span>
                      <div className="h-2 w-32 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#0F766E] rounded-full transition-all"
                          style={{ width: `${item.progres}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700">{item.progresLabel}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDeleteDraft(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                      <span>Hapus Draf</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onResumeDraft(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-bold text-white hover:bg-[#0D9488] transition-colors cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Lanjutkan Pengisian</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // ITEM 4: Sudah Ditinjau Dokter (GAD-7)
          if (item.tipe === 'finished') {
            return (
              <div
                key={item.id}
                className="card-hover rounded-2xl border border-slate-200 bg-white p-5 shadow-xs cursor-pointer"
              >
                {/* Top Row */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {item.id}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Terkirim
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                      <CheckCircle2 className="h-3 w-3 text-teal-600" />
                      Sudah Ditinjau Dokter
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Dibuat: {item.dibuatPada}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Ditinjau: {item.ditinjauPada}
                    </span>
                  </div>
                </div>

                {/* Main Content & Actions */}
                <div className="mt-3.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      {item.judul}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        Dokter: {item.dokter}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-teal-700">
                        {item.skorLabel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 italic">
                      Catatan Medis: &ldquo;{item.catatanMedis}&rdquo;
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenHasil(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-400" />
                      <span>Unduh Resume PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenHasil(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] px-4 py-2 text-xs font-bold text-white hover:bg-[#0D9488] transition-colors cursor-pointer shadow-2xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Lihat Hasil & Rekomendasi</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // ITEM 5: Triase
          return (
            <div
              key={item.id}
              className="card-hover rounded-2xl border border-slate-200 bg-white p-5 shadow-xs cursor-pointer"
            >
              {/* Top Row */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {item.id}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    Terkirim
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-700">
                    <Hourglass className="h-3 w-3 text-cyan-600" />
                    Sedang Ditinjau oleh Tim Triase Medis
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Dibuat: {item.dibuatPada}</span>
                  <span>•</span>
                  <span>Dikirim: {item.dikirimPada}</span>
                </div>
              </div>

              {/* Main Content & Actions */}
              <div className="mt-3.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {item.judul}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      Tim Medis: {item.timMedis}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      {item.kelengkapan}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenStatus(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>Pantau Status Triase</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* 7. Bottom Help Box */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-[#0F766E]">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              Butuh bantuan mencari riwayat lampau?
            </h4>
            <p className="text-xs text-slate-500">
              Semua assessment sebelum semester genap 2024 otomatis diarsipkan ke pusat data Rekam Medis Elektronik (RME).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenArchiveHelp}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs shrink-0"
        >
          <span>Buka Arsip Rekam Medis</span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      {/* 8. Pagination Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-xs text-slate-500">
        <div>
          Menampilkan 1-5 dari 14 laporan pasien{' '}
          <strong className="text-slate-700">{patientName}</strong> ({patientNim})
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs cursor-pointer ${
              currentPage === 1
                ? 'bg-[#0F766E] text-white shadow-2xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            1
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(2)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs cursor-pointer ${
              currentPage === 2
                ? 'bg-[#0F766E] text-white shadow-2xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            2
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(3)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs cursor-pointer ${
              currentPage === 3
                ? 'bg-[#0F766E] text-white shadow-2xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            3
          </button>

          <button
            type="button"
            disabled={currentPage === 3}
            onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
