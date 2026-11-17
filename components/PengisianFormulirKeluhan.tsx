'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  HelpCircle,
  Home,
  Hourglass,
  Info,
  Lock,
  MessageSquare,
  Minus,
  Pill,
  Plus,
  RotateCw,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';
import { FormDetail, PatientProfile, TelehealthConfig } from '@/lib/telehealth-api';
import { formatIndonesianTime } from '@/lib/realtime-date';

interface PengisianFormulirKeluhanProps {
  config: TelehealthConfig;
  profile: PatientProfile | null;
  formDetail?: FormDetail | null;
  activeDraftId?: string | null;
  initialAnswers?: Record<string, any>;
  onSaveDraft: (answers: Record<string, any>) => Promise<void>;
  onSubmitToValidate: (answers: Record<string, any>) => void;
  onBackToInstructions: () => void;
  loading?: boolean;
}

export function PengisianFormulirKeluhan({
  config,
  profile,
  formDetail,
  activeDraftId,
  initialAnswers = {},
  onSaveDraft,
  onSubmitToValidate,
  onBackToInstructions,
  loading = false,
}: PengisianFormulirKeluhanProps) {
  const patientName = profile?.nama || 'Citra Lestari Putri';
  const patientRm = profile?.no_rm || 'RM-2024-004821';
  const assessmentId = activeDraftId || 'ASM-2024-89012';

  // Active step (1 to 4). Default is 3 (Bagian C: Rincian & Karakteristik Keluhan) matching Stitch screen!
  const [currentStep, setCurrentStep] = useState<number>(3);

  // Helper date functions
  const computeAge = (dobString: string) => {
    if (!dobString) return 24;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return 24;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const formatIndonesianDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  // Step 1: Bagian A states
  const [sumberPengisi, setSumberPengisi] = useState<string>(
    initialAnswers.sumber_pengisi ?? 'pasien'
  );
  const [namaPendamping, setNamaPendamping] = useState<string>(
    initialAnswers.nama_pendamping ?? ''
  );
  const [hubunganPendamping, setHubunganPendamping] = useState<string>(
    initialAnswers.hubungan_pendamping ?? 'keluarga'
  );
  const [tanggalLahirPasien, setTanggalLahirPasien] = useState<string>(
    initialAnswers.tanggal_lahir ?? profile?.tanggal_lahir ?? config.tanggalLahir ?? '2000-04-12'
  );
  const [jenisKelaminPasien, setJenisKelaminPasien] = useState<string>(
    initialAnswers.jenis_kelamin ?? profile?.jenis_kelamin ?? config.jenisKelamin ?? 'Perempuan'
  );

  // Step 2: Bagian B states
  const [adaKeluhan, setAdaKeluhan] = useState<string>(
    initialAnswers.ada_keluhan ?? 'ya'
  );
  const [keluhanUtama, setKeluhanUtama] = useState<string>(
    initialAnswers.keluhan_utama ?? 'Sakit kepala berdenyut hebat di pelipis kanan disertai mual ringan'
  );
  const [waktuMulai, setWaktuMulai] = useState<string>(
    initialAnswers.waktu_mulai ?? '2_7_hari'
  );

  // Form question states for Bagian C
  const [keluhanFrekuensi, setKeluhanFrekuensi] = useState<number>(
    initialAnswers.keluhan_frekuensi ?? 4
  );
  const [keluhanHari, setKeluhanHari] = useState<number>(
    initialAnswers.keluhan_hari ?? 4
  );
  const [keparahan, setKeparahan] = useState<string>(
    initialAnswers.keparahan ?? 'sedang'
  );
  const [menggangguAktivitas, setMenggangguAktivitas] = useState<boolean>(
    initialAnswers.mengganggu_aktivitas ?? true
  );
  const [aktivitasTerganggu, setAktivitasTerganggu] = useState<string[]>(
    initialAnswers.aktivitas_terganggu ?? ['kerja_belajar', 'tidur_istirahat']
  );
  const [keteranganTambahan, setKeteranganTambahan] = useState<string>(
    initialAnswers.keterangan_tambahan ??
      'Rasa sakit kepala bertambah hebat jika melihat layar monitor kantor dalam durasi lama atau terpapar cahaya terang, dan membaik sedikit saat memejamkan mata di ruangan redup.'
  );

  // Step 4: Bagian D states
  const [suhuTubuh, setSuhuTubuh] = useState<number>(
    initialAnswers.suhu_tubuh ?? 36.8
  );
  const [beratBadan, setBeratBadan] = useState<number>(
    initialAnswers.berat_badan ?? 52
  );
  const [tanggalPengukuran, setTanggalPengukuran] = useState<string>(
    initialAnswers.tanggal_pengukuran ?? new Date().toISOString().slice(0, 10)
  );
  const [riwayatPenyakit, setRiwayatPenyakit] = useState<string[]>(
    initialAnswers.riwayat_penyakit ?? ['hipertensi']
  );
  const [alergi, setAlergi] = useState<string>(
    initialAnswers.alergi ?? 'tidak'
  );
  const [obatDikonsumsi, setObatDikonsumsi] = useState<string>(
    initialAnswers.obat_dikonsumsi ?? 'Paracetamol 500mg saat nyeri kepala'
  );
  const [tujuanKonsultasi, setTujuanKonsultasi] = useState<string>(
    initialAnswers.tujuan_konsultasi ?? 'keluhan_baru'
  );

  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Helper to compile current answers object
  const getCurrentAnswers = () => ({
    ...initialAnswers,
    sumber_pengisi: sumberPengisi,
    nama_pendamping: sumberPengisi === 'pendamping' ? namaPendamping : undefined,
    hubungan_pendamping: sumberPengisi === 'pendamping' ? hubunganPendamping : undefined,
    tanggal_lahir: tanggalLahirPasien,
    jenis_kelamin: jenisKelaminPasien,
    ada_keluhan: adaKeluhan,
    keluhan_utama: keluhanUtama,
    waktu_mulai: waktuMulai,
    keluhan_frekuensi: keluhanFrekuensi,
    keluhan_hari: keluhanHari,
    keparahan: keparahan,
    mengganggu_aktivitas: menggangguAktivitas,
    aktivitas_terganggu: aktivitasTerganggu,
    keterangan_tambahan: keteranganTambahan,
    suhu_tubuh: suhuTubuh,
    berat_badan: beratBadan,
    tanggal_pengukuran: tanggalPengukuran,
    riwayat_penyakit: riwayatPenyakit,
    alergi: alergi,
    obat_dikonsumsi: obatDikonsumsi,
    tujuan_konsultasi: tujuanKonsultasi,
  });

  const handleToggleAktivitas = (itemKey: string) => {
    setAktivitasTerganggu((prev) =>
      prev.includes(itemKey)
        ? prev.filter((k) => k !== itemKey)
        : [...prev, itemKey]
    );
  };

  const handleManualSaveDraft = async () => {
    setSavingDraft(true);
    try {
      await onSaveDraft(getCurrentAnswers());
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 2500);
    } catch {
      // Handled in parent
    } finally {
      setSavingDraft(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (adaKeluhan === 'ya') {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else {
      onSubmitToValidate(getCurrentAnswers());
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 4) {
      if (adaKeluhan === 'ya') {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onBackToInstructions();
    }
  };

  // Compile JSON preview payload
  const payloadPreview = {
    asm_id: assessmentId,
    step_aktif: currentStep,
    sumber_pengisi: sumberPengisi,
    tanggal_lahir: tanggalLahirPasien,
    usia: computeAge(tanggalLahirPasien),
    ada_keluhan: adaKeluhan,
    keluhan_frekuensi: keluhanFrekuensi,
    keluhan_hari: keluhanHari,
    keparahan: keparahan,
    mengganggu_aktivitas: menggangguAktivitas,
    tanggal_pengukuran: tanggalPengukuran,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ------------------------------------------------------------- */}
      {/* 1. Breadcrumb & Top Status Bar */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[#64748B]">
          <button
            type="button"
            onClick={onBackToInstructions}
            className="flex items-center gap-1 hover:text-[#0D9488] transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Beranda</span>
          </button>
          <span className="text-[#CBD5E1]" aria-hidden="true">&gt;</span>
          <span className="hover:text-[#0D9488] cursor-pointer" onClick={onBackToInstructions}>
            Self-Assessment
          </span>
          <span className="text-[#CBD5E1]" aria-hidden="true">&gt;</span>
          <span className="font-semibold text-[#0F172A]">Pengisian Formulir (FRM-KELUHAN)</span>
        </nav>

        {/* Right Info Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-[#E2E8F0] bg-[#FFFFFF] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#334155] shadow-2xs">
            ID: {assessmentId}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-semibold text-[#065F46]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            <span>Draf Tersimpan Otomatis</span>
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Page Header: Pengisian Self-Assessment */}
      {/* ------------------------------------------------------------- */}
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-[#0F172A]">
            Pengisian Self-Assessment
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#99F6E4] bg-[#CCFBF1] px-2.5 py-0.5 text-xs font-bold text-[#0F766E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
            <span>FRM-KELUHAN</span>
          </span>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
          Lengkapi informasi klinis berikut untuk membantu proses triase dan konsultasi mendalam oleh dokter spesialis.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Progress & 4-Step Stepper Cards */}
      {/* ------------------------------------------------------------- */}
      <section aria-label="Alur langkah pengisian formulir" className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-[#0F172A]">
            <span className="h-2 w-2 rounded-full bg-[#0D9488]" />
            <span>
              Langkah {currentStep} dari 4 ({currentStep * 25}% Selesai)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#64748B] uppercase tracking-wider">Status Validasi:</span>
            <span className="inline-flex items-center gap-1 rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-2 py-0.5 font-bold text-[11px] text-[#059669]">
              <Check className="h-3 w-3" />
              <span>Lengkap & Valid</span>
            </span>
          </div>
        </div>

        {/* Stepper Cards Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Step 1: Identitas Pengisi */}
          <div
            onClick={() => setCurrentStep(1)}
            className={`cursor-pointer rounded-xl border p-3 transition-all ${
              currentStep === 1
                ? 'border-[#0D9488] bg-[#CCFBF1] shadow-xs ring-2 ring-[#0D9488]/40'
                : currentStep > 1
                  ? 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                  : 'border-[#E2E8F0] bg-[#F8FAFC]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  currentStep === 1
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-[#10B981] text-white'
                }`}
              >
                {currentStep > 1 ? '✓' : '1'}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  currentStep === 1 ? 'text-[#0F766E]' : 'text-[#64748B]'
                }`}
              >
                {currentStep === 1 ? 'BAGIAN A - AKTIF' : 'BAGIAN A'}
              </span>
            </div>
            <h2
              className={`mt-1 font-display text-xs font-bold ${
                currentStep === 1 ? 'text-[#0F766E]' : 'text-[#0F172A]'
              }`}
            >
              Identitas Pengisi
            </h2>
            <p className="text-[10px] text-[#059669]">
              {currentStep > 1
                ? `✓ ${sumberPengisi === 'pasien' ? 'Pasien Sendiri' : 'Pendamping'}`
                : 'Data Pasien & Lahir'}
            </p>
          </div>

          {/* Step 2: Keluhan Utama */}
          <div
            onClick={() => setCurrentStep(2)}
            className={`cursor-pointer rounded-xl border p-3 transition-all ${
              currentStep === 2
                ? 'border-[#0D9488] bg-[#CCFBF1] shadow-xs ring-2 ring-[#0D9488]/40'
                : currentStep > 2
                  ? 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                  : 'border-[#E2E8F0] bg-[#F8FAFC]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  currentStep === 2
                    ? 'bg-[#0D9488] text-white'
                    : currentStep > 2
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#E2E8F0] text-[#64748B]'
                }`}
              >
                {currentStep > 2 ? '✓' : '2'}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  currentStep === 2 ? 'text-[#0F766E]' : 'text-[#64748B]'
                }`}
              >
                {currentStep === 2 ? 'BAGIAN B - AKTIF' : 'BAGIAN B'}
              </span>
            </div>
            <h2
              className={`mt-1 font-display text-xs font-bold ${
                currentStep === 2
                  ? 'text-[#0F766E]'
                  : currentStep > 2
                    ? 'text-[#0F172A]'
                    : 'text-[#64748B]'
              }`}
            >
              Keluhan Utama
            </h2>
            <p className="text-[10px] text-[#059669]">
              {currentStep > 2
                ? `✓ ${adaKeluhan === 'ya' ? 'Ada Keluhan (Ya)' : 'Pemeriksaan Rutin'}`
                : 'Skrining Onset & Gejala'}
            </p>
          </div>

          {/* Step 3: Rincian Keluhan (Active in Stitch Screenshot!) */}
          <div
            onClick={() => setCurrentStep(3)}
            className={`cursor-pointer rounded-xl border p-3 transition-all ${
              currentStep === 3
                ? 'border-[#0D9488] bg-[#CCFBF1] shadow-xs ring-2 ring-[#0D9488]/40'
                : currentStep > 3
                  ? 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                  : 'border-[#E2E8F0] bg-[#F8FAFC]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  currentStep === 3
                    ? 'bg-[#0D9488] text-white'
                    : currentStep > 3
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#E2E8F0] text-[#64748B]'
                }`}
              >
                {currentStep > 3 ? '✓' : '3'}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  currentStep === 3 ? 'text-[#0F766E]' : 'text-[#64748B]'
                }`}
              >
                {currentStep === 3 ? 'BAGIAN C - AKTIF' : 'BAGIAN C'}
              </span>
            </div>
            <h2
              className={`mt-1 font-display text-xs font-bold ${
                currentStep === 3
                  ? 'text-[#0F766E]'
                  : currentStep > 3
                    ? 'text-[#0F172A]'
                    : 'text-[#64748B]'
              }`}
            >
              Rincian Keluhan
            </h2>
            <p
              className={`text-[10px] ${
                currentStep === 3
                  ? 'text-[#0D9488] font-mono'
                  : currentStep > 3
                    ? 'text-[#059669]'
                    : 'text-[#94A3B8]'
              }`}
            >
              {currentStep > 3 ? '✓ Rincian Lengkap' : '⤹ Logic: ada_keluhan == \'ya\''}
            </p>
          </div>

          {/* Step 4: Info Pendukung */}
          <div
            onClick={() => setCurrentStep(4)}
            className={`cursor-pointer rounded-xl border p-3 transition-all ${
              currentStep === 4
                ? 'border-[#0D9488] bg-[#CCFBF1] shadow-xs ring-2 ring-[#0D9488]/40'
                : 'border-[#E2E8F0] bg-[#F8FAFC]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  currentStep === 4 ? 'bg-[#0D9488] text-white' : 'bg-[#E2E8F0] text-[#64748B]'
                }`}
              >
                4
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  currentStep === 4 ? 'text-[#0F766E]' : 'text-[#94A3B8]'
                }`}
              >
                {currentStep === 4 ? 'BAGIAN D - AKTIF' : 'BAGIAN D'}
              </span>
            </div>
            <h2
              className={`mt-1 font-display text-xs font-bold ${
                currentStep === 4 ? 'text-[#0F766E]' : 'text-[#64748B]'
              }`}
            >
              Info Pendukung
            </h2>
            <p className="text-[10px] text-[#94A3B8]">Tanda Vital & Riwayat</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. Two-Column Questionnaire Split */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column (8 cols): Questionnaire Inputs */}
        <div className="space-y-6 lg:col-span-8">
          {/* ========================================================= */}
          {/* STEP 1: BAGIAN A - IDENTITAS PENGISI & PASIEN */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Section Header Card */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2 py-0.5 text-[11px] font-bold text-[#0F766E]">
                      Bagian A • Data Demografis
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#C7D2FE] bg-[#EEF2FF] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#4338CA]">
                      <span>Param: sumber_pengisi, tanggal_lahir</span>
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#64748B]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0D9488]" />
                    <span>Verifikasi Pasien Terdaftar</span>
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-lg font-bold text-[#0F172A]">
                    Bagian A: Identitas Pengisi & Data Pasien
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Tentukan siapa yang mengisi formulir ini dan verifikasi tanggal lahir pasien untuk perhitungan dosis obat dan kecocokan identitas rekam medis SatuSehat.
                  </p>
                </div>
              </div>

              {/* Question 1: Sumber Pengisi */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <label className="font-display text-sm font-bold text-[#0F172A] leading-snug">
                  Siapakah yang mengisi formulir assessment ini? *
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div
                    onClick={() => setSumberPengisi('pasien')}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      sumberPengisi === 'pasien'
                        ? 'border-[#0D9488] bg-[#CCFBF1] shadow-xs ring-2 ring-[#0D9488]/40'
                        : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          sumberPengisi === 'pasien'
                            ? 'bg-[#0D9488] text-white'
                            : 'bg-[#F1F5F9] text-[#64748B]'
                        }`}
                      >
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-display text-xs font-bold text-[#0F172A]">
                          Pasien Sendiri (Mandiri)
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          Saya mengisi formulir ini atas nama diri sendiri
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setSumberPengisi('pendamping')}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      sumberPengisi === 'pendamping'
                        ? 'border-[#0D9488] bg-[#CCFBF1] shadow-xs ring-2 ring-[#0D9488]/40'
                        : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          sumberPengisi === 'pendamping'
                            ? 'bg-[#0D9488] text-white'
                            : 'bg-[#F1F5F9] text-[#64748B]'
                        }`}
                      >
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-display text-xs font-bold text-[#0F172A]">
                          Didampingi Keluarga / Wali
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          Diisikan oleh orang tua, pasangan, anak, atau perawat
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {sumberPengisi === 'pendamping' && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-3 border-t border-[#E2E8F0]">
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Nama Lengkap Pendamping / Wali *
                      </label>
                      <input
                        type="text"
                        value={namaPendamping}
                        onChange={(e) => setNamaPendamping(e.target.value)}
                        placeholder="Contoh: Ibu Rahmawati"
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs text-[#0F172A] focus:border-[#0D9488] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Hubungan dengan Pasien *
                      </label>
                      <select
                        value={hubunganPendamping}
                        onChange={(e) => setHubunganPendamping(e.target.value)}
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs text-[#0F172A] focus:border-[#0D9488] focus:outline-none cursor-pointer"
                      >
                        <option value="orang_tua">Orang Tua (Ayah / Ibu)</option>
                        <option value="pasangan">Pasangan (Suami / Istri)</option>
                        <option value="anak">Anak Kandung</option>
                        <option value="saudara">Saudara Kandung / Kerabat</option>
                        <option value="wali">Wali Resmi / Pendamping Medis</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Question 2: Tanggal Lahir Pasien & Usia Otomatis */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label className="font-display text-sm font-bold text-[#0F172A] leading-snug">
                      Tanggal Lahir Pasien *
                    </label>
                    <p className="text-xs text-[#64748B]">
                      Kesesuaian tanggal lahir penting untuk validasi SatuSehat dan penyesuaian dosis obat klinis.
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-[#94A3B8]">
                    Param: tanggal_lahir
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-7">
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={tanggalLahirPasien}
                      onChange={(e) => setTanggalLahirPasien(e.target.value)}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-xs text-[#0F172A] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div className="sm:col-span-5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTanggalLahirPasien('2000-04-12')}
                      className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-[11px] font-semibold text-[#0F766E] hover:bg-[#CCFBF1] transition-colors"
                    >
                      Default: 12 April 2000
                    </button>
                  </div>
                </div>

                {/* Date Preview & Calculated Age Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-3 text-xs">
                  <div className="flex items-center gap-2 text-[#065F46] font-medium">
                    <Calendar className="h-4 w-4 text-[#059669]" />
                    <span>Tanggal Lahir:</span>
                    <strong className="font-bold">{formatIndonesianDate(tanggalLahirPasien)}</strong>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#059669] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs">
                    <span>Usia Terhitung:</span>
                    <span>{computeAge(tanggalLahirPasien)} Tahun</span>
                  </span>
                </div>
              </div>

              {/* Question 3: Jenis Kelamin */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <label className="font-display text-sm font-bold text-[#0F172A] leading-snug">
                  Jenis Kelamin Pasien *
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setJenisKelaminPasien('Perempuan')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-bold transition-all ${
                      jenisKelaminPasien === 'Perempuan'
                        ? 'border-[#0D9488] bg-[#CCFBF1] text-[#0F766E] shadow-xs ring-2 ring-[#0D9488]/40'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:bg-white'
                    }`}
                  >
                    <span>♀ Perempuan</span>
                    {jenisKelaminPasien === 'Perempuan' && <Check className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setJenisKelaminPasien('Laki-laki')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-bold transition-all ${
                      jenisKelaminPasien === 'Laki-laki'
                        ? 'border-[#0D9488] bg-[#CCFBF1] text-[#0F766E] shadow-xs ring-2 ring-[#0D9488]/40'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:bg-white'
                    }`}
                  >
                    <span>♂ Laki-laki</span>
                    {jenisKelaminPasien === 'Laki-laki' && <Check className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: BAGIAN B - KELUHAN UTAMA & ONSET */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Section Header Card */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2 py-0.5 text-[11px] font-bold text-[#0F766E]">
                      Bagian B • Skrining Keluhan Awal
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#C7D2FE] bg-[#EEF2FF] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#4338CA]">
                      <span>Param: ada_keluhan, keluhan_utama, waktu_mulai</span>
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#64748B]">
                    <Activity className="h-3.5 w-3.5 text-[#0D9488]" />
                    <span>Triase Keluhan</span>
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-lg font-bold text-[#0F172A]">
                    Bagian B: Keluhan Utama & Waktu Mulai (Onset)
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Tentukan keluhan kesehatan utama yang Anda rasakan hari ini dan sejak kapan gejala pertama kali muncul.
                  </p>
                </div>
              </div>

              {/* Question 1: Ada Keluhan (Binary with Branching Explanation) */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label className="font-display text-sm font-bold text-[#0F172A] leading-snug">
                      Apakah saat ini Anda merasakan keluhan atau gangguan kesehatan? *
                    </label>
                    <p className="text-xs text-[#64748B]">
                      Pilih &quot;Ya&quot; jika ada gejala spesifik. Pilih &quot;Tidak&quot; untuk konsultasi pemeriksaan rutin berkala.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdaKeluhan('ya')}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      adaKeluhan === 'ya'
                        ? 'border-[#0D9488] bg-[#CCFBF1] shadow-xs ring-2 ring-[#0D9488]/40'
                        : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div>
                      <p className="font-display text-xs font-bold text-[#0F172A]">Ya, Ada Keluhan Tertentu</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Sistem akan membuka pertanyaan rincian di Bagian C</p>
                    </div>
                    {adaKeluhan === 'ya' && <Check className="h-4 w-4 text-[#0D9488] shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdaKeluhan('tidak')}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      adaKeluhan === 'tidak'
                        ? 'border-[#0D9488] bg-[#CCFBF1] shadow-xs ring-2 ring-[#0D9488]/40'
                        : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div>
                      <p className="font-display text-xs font-bold text-[#0F172A]">Tidak Ada Keluhan (Pemeriksaan Rutin)</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Langsung ke info pendukung di Bagian D</p>
                    </div>
                    {adaKeluhan === 'tidak' && <Check className="h-4 w-4 text-[#0D9488] shrink-0" />}
                  </button>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-800 flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Logika Percabangan Klinis:</strong> Formulir ini menggunakan kondisi <code>show_if: ada_keluhan == &apos;ya&apos;</code>. Bila Anda memilih &quot;Tidak Ada Keluhan&quot;, Bagian C akan otomatis terlewati untuk efisiensi konsultasi.
                  </p>
                </div>
              </div>

              {/* Question 2: Keluhan Utama */}
              {adaKeluhan === 'ya' && (
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-3">
                  <label className="font-display text-sm font-bold text-[#0F172A] leading-snug">
                    Deskripsikan Keluhan Utama Anda *
                  </label>
                  <p className="text-xs text-[#64748B]">
                    Tuliskan secara ringkas keluhan fisik utama yang paling mengganggu (misal: sakit kepala sebelah, batuk berdahak, demam tinggi).
                  </p>

                  <textarea
                    rows={3}
                    value={keluhanUtama}
                    onChange={(e) => setKeluhanUtama(e.target.value)}
                    placeholder="Tuliskan keluhan utama Anda di sini..."
                    className="w-full rounded-xl border border-[#CBD5E1] bg-white p-3.5 text-xs text-[#0F172A] leading-relaxed focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 focus:outline-none"
                  />

                  {/* Quick Suggestion Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-[#64748B]">Contoh Cepat:</span>
                    {[
                      'Sakit kepala berdenyut di pelipis kanan',
                      'Demam menggigil sejak kemarin sore',
                      'Batuk kering disertai tenggorokan gatal',
                      'Nyeri ulu hati setelah makan',
                    ].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setKeluhanUtama(sample)}
                        className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] text-[#334155] hover:bg-[#CCFBF1] hover:text-[#0F766E] transition-colors"
                      >
                        + {sample}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 3: Waktu Mulai (Onset) */}
              {adaKeluhan === 'ya' && (
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                  <label className="font-display text-sm font-bold text-[#0F172A] leading-snug">
                    Kapan keluhan tersebut pertama kali mulai dirasakan? (Onset) *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { val: 'hari_ini', label: 'Hari Ini (< 24 Jam)', sub: 'Gejala baru muncul mendadak' },
                      { val: '2_7_hari', label: '1 - 7 Hari Terakhir', sub: 'Gejala akut dalam rentang sepekan' },
                      { val: '1_4_minggu', label: '1 - 4 Minggu', sub: 'Gejala subakut berulang' },
                      { val: 'lebih_1_bulan', label: 'Lebih dari 1 Bulan', sub: 'Kondisi kronis / menahun' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setWaktuMulai(opt.val)}
                        className={`rounded-xl border p-3.5 text-left transition-all ${
                          waktuMulai === opt.val
                            ? 'border-[#0D9488] bg-[#CCFBF1] shadow-xs ring-2 ring-[#0D9488]/40'
                            : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                        }`}
                      >
                        <p className="font-display text-xs font-bold text-[#0F172A]">{opt.label}</p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: BAGIAN C - RINCIAN & KARAKTERISTIK KELUHAN */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Section Header Card */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2 py-0.5 text-[11px] font-bold text-[#0F766E]">
                      Bagian C • Fokus Klinis
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#C7D2FE] bg-[#EEF2FF] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#4338CA]">
                      <Filter className="h-3 w-3" />
                      <span>show_if: ada_keluhan == &apos;ya&apos;</span>
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#64748B]">
                    <Activity className="h-3.5 w-3.5 text-[#0D9488]" />
                    <span>Skala Penilaian Klinis</span>
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-lg font-bold text-[#0F172A]">
                    Bagian C: Rincian & Karakteristik Keluhan
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Pertanyaan ini membantu dokter mengukur intensitas, frekuensi kemunculan, dan dampak gejala terhadap produktivitas harian Anda.
                  </p>
                </div>
              </div>

              {/* Question 1: Likert Scale 1-5 (keluhan_frekuensi) */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <label className="font-display text-sm font-bold text-[#0F172A] leading-snug">
                    Dalam 7 hari terakhir, seberapa sering keluhan tersebut Anda rasakan? *
                  </label>
                  <span className="shrink-0 font-mono text-[10px] text-[#94A3B8]">
                    Param: keluhan_frekuensi
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {[
                    { val: 1, label: 'Sangat Jarang', sub: '1x sepekan / sesekali' },
                    { val: 2, label: 'Jarang', sub: '2-3 kali sepekan' },
                    { val: 3, label: 'Kadang-kadang', sub: 'Hampir selang sehari' },
                    { val: 4, label: 'Sering', sub: 'Setiap hari kambuh' },
                    { val: 5, label: 'Sangat Sering', sub: 'Konstan sepanjang hari' },
                  ].map((opt) => {
                    const isSelected = keluhanFrekuensi === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setKeluhanFrekuensi(opt.val)}
                        className={`flex flex-col items-center justify-between rounded-xl border p-3.5 text-center transition-all ${
                          isSelected
                            ? 'border-[#0D9488] bg-[#CCFBF1] text-[#0F766E] shadow-xs ring-2 ring-[#0D9488]/40'
                            : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:border-[#CBD5E1] hover:bg-[#FFFFFF]'
                        }`}
                      >
                        <span className="font-mono text-lg font-bold">{opt.val}</span>
                        <span className="mt-1 text-xs font-bold leading-tight">{opt.label}</span>
                        <span className="mt-1 text-[10px] text-[#64748B] leading-tight opacity-80">
                          {opt.sub}
                        </span>
                        {isSelected && (
                          <span className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#0D9488]">
                            <Check className="h-3 w-3 stroke-[3]" />
                            <span>Terpilih</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2: Counter / Stepper Days (keluhan_hari) */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1 max-w-md">
                    <label className="font-display text-sm font-bold text-[#0F172A] leading-snug">
                      Dalam 7 hari terakhir, berapa hari keluhan tersebut muncul? *
                    </label>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Batas rentang input validasi: minimal 0 hari (tidak pernah lagi) hingga maksimal 7 hari penuh.
                    </p>
                  </div>

                  {/* Counter Pill Widget */}
                  <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setKeluhanHari((prev) => Math.max(0, prev - 1))}
                      disabled={keluhanHari <= 0}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] hover:bg-[#F1F5F9] disabled:opacity-30"
                      aria-label="Kurangi hari"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <div className="min-w-[80px] text-center">
                      <span className="block font-display text-xl font-extrabold text-[#0F172A]">
                        {keluhanHari} Hari
                      </span>
                      <span className="block text-[10px] text-[#64748B]">dari 7 hari</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setKeluhanHari((prev) => Math.min(7, prev + 1))}
                      disabled={keluhanHari >= 7}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D9488] text-[#FFFFFF] hover:bg-[#0F766E] disabled:opacity-30"
                      aria-label="Tambah hari"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Question 3: Severity Level (keparahan) */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <label className="font-display text-sm font-bold text-[#0F172A] leading-snug">
                  Menurut Anda, seberapa berat tingkat keluhan tersebut saat ini? *
                </label>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                  {/* Card 1: Ringan */}
                  <div
                    onClick={() => setKeparahan('ringan')}
                    className={`cursor-pointer rounded-xl border p-4 space-y-2 transition-all ${
                      keparahan === 'ringan'
                        ? 'border-[#0D9488] bg-[#CCFBF1] shadow-xs ring-2 ring-[#0D9488]/40'
                        : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E2E8F0] text-xs font-bold text-[#334155]">
                        1
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                    </div>
                    <h3 className="font-display text-xs font-bold text-[#0F172A]">Tingkat Ringan</h3>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">
                      Gejala terasa ringan, masih sangat nyaman untuk beraktivitas harian.
                    </p>
                    <span className="inline-block font-mono text-[10px] text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded">
                      VAS Estimasi: 1 - 3
                    </span>
                  </div>

                  {/* Card 2: Sedang (Selected!) */}
                  <div
                    onClick={() => setKeparahan('sedang')}
                    className={`cursor-pointer rounded-xl border p-4 space-y-2 transition-all ${
                      keparahan === 'sedang'
                        ? 'border-[#0D9488] bg-[#CCFBF1] shadow-xs ring-2 ring-[#0D9488]/40'
                        : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0D9488] text-xs font-bold text-[#FFFFFF]">
                        2
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                    </div>
                    <h3 className="font-display text-xs font-bold text-[#0F766E]">Tingkat Sedang</h3>
                    <p className="text-[11px] text-[#334155] leading-relaxed">
                      Mengganggu kenyamanan & fokus, namun masih dapat diatasi bertahap.
                    </p>
                    <span className="inline-block font-mono text-[10px] font-bold text-[#0F766E] bg-[#99F6E4]/50 px-2 py-0.5 rounded">
                      VAS Estimasi: 4 - 6 • Terpilih
                    </span>
                  </div>

                  {/* Card 3: Berat */}
                  <div
                    onClick={() => setKeparahan('berat')}
                    className={`cursor-pointer rounded-xl border p-4 space-y-2 transition-all ${
                      keparahan === 'berat'
                        ? 'border-[#EF4444] bg-[#FEF2F2] shadow-xs ring-2 ring-[#EF4444]/40'
                        : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E2E8F0] text-xs font-bold text-[#334155]">
                        3
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
                    </div>
                    <h3 className="font-display text-xs font-bold text-[#0F172A]">Tingkat Berat</h3>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">
                      Sangat menyiksa atau melumpuhkan aktivitas normal, butuh intervensi.
                    </p>
                    <span className="inline-block font-mono text-[10px] text-[#EF4444] bg-[#FEE2E2] px-2 py-0.5 rounded">
                      VAS Estimasi: 7 - 10
                    </span>
                  </div>
                </div>
              </div>

              {/* Question 4: Binary Toggle & Conditional Checkboxes */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <label className="font-display text-sm font-bold text-[#0F172A] leading-snug">
                      Apakah keluhan ini mengganggu aktivitas sehari-hari Anda? *
                    </label>
                    <p className="text-xs text-[#64748B]">
                      Evaluasi morbiditas fungsional pasien sebelum penanganan.
                    </p>
                  </div>

                  {/* Binary Toggle Buttons */}
                  <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setMenggangguAktivitas(true)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                        menggangguAktivitas
                          ? 'bg-[#0F766E] text-[#FFFFFF] shadow-xs'
                          : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      Ya, Mengganggu
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenggangguAktivitas(false)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                        !menggangguAktivitas
                          ? 'bg-[#0F766E] text-[#FFFFFF] shadow-xs'
                          : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      Tidak Terganggu
                    </button>
                  </div>
                </div>

                {/* Conditional Sub-Question: Affected Activities */}
                {menggangguAktivitas && (
                  <div className="space-y-2.5 border-t border-[#E2E8F0] pt-4">
                    <label className="block text-xs font-bold text-[#334155]">
                      Pilih aktivitas yang terganggu (bisa pilih lebih dari satu): *
                    </label>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {[
                        { key: 'kerja_belajar', label: 'Bekerja / Belajar' },
                        { key: 'tidur_istirahat', label: 'Tidur / Istirahat' },
                        { key: 'makan_minum', label: 'Makan / Minum' },
                        { key: 'pekerjaan_rumah', label: 'Pekerjaan Rumah Tangga' },
                        { key: 'olahraga_fisik', label: 'Olahraga & Fisik' },
                        { key: 'interaksi_sosial', label: 'Interaksi Sosial' },
                      ].map((act) => {
                        const isChecked = aktivitasTerganggu.includes(act.key);
                        return (
                          <label
                            key={act.key}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs transition-colors ${
                              isChecked
                                ? 'border-[#99F6E4] bg-[#CCFBF1] text-[#0F766E] font-bold shadow-2xs'
                                : 'border-[#E2E8F0] bg-[#FFFFFF] text-[#334155] hover:bg-[#F8FAFC]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleAktivitas(act.key)}
                              className="h-4 w-4 rounded border-[#CBD5E1] accent-[#0D9488]"
                            />
                            <span className="truncate">{act.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Question 5: Detailed Clinical Notes */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="keterangan-tambahan"
                    className="font-display text-sm font-bold text-[#0F172A]"
                  >
                    Keterangan tambahan tentang keluhan Anda
                  </label>
                  <span className="font-mono text-[11px] text-[#94A3B8]">
                    (Opsional) {keteranganTambahan.length} / 500 Karakter
                  </span>
                </div>

                <textarea
                  id="keterangan-tambahan"
                  rows={4}
                  maxLength={500}
                  value={keteranganTambahan}
                  onChange={(e) => setKeteranganTambahan(e.target.value)}
                  placeholder="Ceritakan detail tambahan yang perlu diketahui dokter mengenai keluhan ini..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 text-xs text-[#0F172A] leading-relaxed placeholder:text-[#94A3B8] focus:border-[#0D9488] focus:outline-none focus:ring-3 focus:ring-[#0D9488]/15"
                />

                <p className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <Lock className="h-3.5 w-3.5 text-[#0D9488] shrink-0" />
                  <span>Catatan ini ditransmisikan secara aman ke EHR klinis sebelum sesi tatap muka video dimulai.</span>
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: BAGIAN D - INFORMASI PENDUKUNG & TANDA VITAL */}
          {/* ========================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Section Header Card */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2 py-0.5 text-[11px] font-bold text-[#0F766E]">
                      Bagian D • Informasi Pendukung & Tanda Vital
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#C7D2FE] bg-[#EEF2FF] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#4338CA]">
                      <span>Param: suhu_tubuh, tanggal_pengukuran, alergi</span>
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#64748B]">
                    <Pill className="h-3.5 w-3.5 text-[#0D9488]" />
                    <span>Keamanan Terapi</span>
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-lg font-bold text-[#0F172A]">
                    Bagian D: Informasi Pendukung, Tanda Vital & Tanggal Pengukuran
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Lengkapi data tanda vital fisik dan riwayat medis pendukung untuk membantu dokter meresepkan terapi yang aman.
                  </p>
                </div>
              </div>

              {/* Question 1: Tanda Vital (Suhu & Berat Badan) */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <label className="font-display text-sm font-bold text-[#0F172A] leading-snug">
                  Tanda Vital Fisik Terkini *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Suhu Tubuh */}
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172A]">Suhu Tubuh (°C)</span>
                      <span className="text-[11px] text-[#0D9488] font-bold">
                        {suhuTubuh >= 37.5 ? 'Demam Subfebris' : 'Suhu Normal'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.1"
                        min="34"
                        max="43"
                        value={suhuTubuh}
                        onChange={(e) => setSuhuTubuh(Number(e.target.value))}
                        className="w-28 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-bold text-[#0F172A] focus:border-[#0D9488] focus:outline-none"
                      />
                      <span className="text-xs text-[#64748B]">°Celcius</span>
                    </div>
                  </div>

                  {/* Berat Badan */}
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172A]">Berat Badan (kg)</span>
                      <span className="text-[11px] text-[#64748B]">Dosis Obat</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.5"
                        min="20"
                        max="250"
                        value={beratBadan}
                        onChange={(e) => setBeratBadan(Number(e.target.value))}
                        className="w-28 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-bold text-[#0F172A] focus:border-[#0D9488] focus:outline-none"
                      />
                      <span className="text-xs text-[#64748B]">Kilogram (kg)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 2: Tanggal Pengukuran Tanda Vital (Fitur tanggal/bulan klinis) */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label className="font-display text-sm font-bold text-[#0F172A] leading-snug">
                      Tanggal Pengukuran Tanda Vital *
                    </label>
                    <p className="text-xs text-[#64748B]">
                      Pilih tanggal kapan suhu tubuh dan berat badan terakhir kali diukur. Maksimal hari ini.
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-[#94A3B8]">
                    Param: tanggal_pengukuran
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-7">
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={tanggalPengukuran}
                      onChange={(e) => setTanggalPengukuran(e.target.value)}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-xs text-[#0F172A] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div className="sm:col-span-5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTanggalPengukuran(new Date().toISOString().split('T')[0])}
                      className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#0F766E] hover:bg-[#CCFBF1] transition-colors"
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() - 1);
                        setTanggalPengukuran(d.toISOString().split('T')[0]);
                      }}
                      className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#334155] hover:bg-[#F1F5F9] transition-colors"
                    >
                      Kemarin
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-3 text-xs text-[#065F46] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#059669]" />
                  <span>Tanggal Pengukuran Terpilih:</span>
                  <strong className="font-bold">{formatIndonesianDate(tanggalPengukuran)}</strong>
                </div>
              </div>

              {/* Question 3: Riwayat Alergi Obat & Makanan */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-display text-sm font-bold text-[#0F172A]">
                    Riwayat Alergi Obat atau Makanan *
                  </label>
                  <span className="text-[11px] font-bold text-rose-600">Keamanan Resep</span>
                </div>
                <p className="text-xs text-[#64748B]">
                  Tuliskan &quot;Tidak ada&quot; jika tidak memiliki riwayat alergi obat antibiotik atau pereda nyeri.
                </p>

                <input
                  type="text"
                  value={alergi}
                  onChange={(e) => setAlergi(e.target.value)}
                  placeholder="Contoh: Tidak ada / Alergi Amoxicillin / Alergi Udang"
                  className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-xs text-[#0F172A] focus:border-[#0D9488] focus:outline-none"
                />
              </div>

              {/* Question 4: Obat yang Sedang Dikonsumsi */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-3">
                <label className="font-display text-sm font-bold text-[#0F172A]">
                  Obat yang Sedang atau Rutin Dikonsumsi Saat Ini
                </label>
                <input
                  type="text"
                  value={obatDikonsumsi}
                  onChange={(e) => setObatDikonsumsi(e.target.value)}
                  placeholder="Contoh: Paracetamol 500mg, Vitamin C"
                  className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-xs text-[#0F172A] focus:border-[#0D9488] focus:outline-none"
                />
              </div>

              {/* Question 5: Tujuan Konsultasi */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
                <label className="font-display text-sm font-bold text-[#0F172A]">
                  Tujuan Utama Telekonsultasi Ini *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'keluhan_baru', label: 'Pemeriksaan Gejala Baru & Triase' },
                    { key: 'resep', label: 'Resep Obat & Saran Pengobatan' },
                    { key: 'rujukan', label: 'Rujukan Rumah Sakit / Spesialis' },
                    { key: 'konseling', label: 'Konseling & Edukasi Kesehatan' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTujuanKonsultasi(item.key)}
                      className={`rounded-xl border p-3.5 text-left transition-all ${
                        tujuanKonsultasi === item.key
                          ? 'border-[#0D9488] bg-[#CCFBF1] text-[#0F766E] font-bold shadow-xs ring-2 ring-[#0D9488]/40'
                          : 'border-[#E2E8F0] bg-white text-[#334155] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <p className="text-xs">{item.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation Deck */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
              <Lock className="h-3.5 w-3.5 text-[#0D9488]" />
              <span>Semua isian bertanda (*) tersimpan otomatis secara lokal.</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrevStep}
                className="min-h-[40px] rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                ← Sebelumnya
              </button>

              <button
                type="button"
                onClick={handleManualSaveDraft}
                disabled={savingDraft}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#99F6E4] bg-[#CCFBF1] px-4 py-2 text-xs font-bold text-[#0F766E] hover:bg-[#99F6E4]/70 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{savingDraft ? 'Menyimpan...' : draftSavedToast ? 'Tersimpan!' : 'Simpan Draf'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#0F766E] px-5 py-2 text-xs font-bold text-[#FFFFFF] shadow-xs hover:bg-[#0D9488] transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#0F766E]/30 cursor-pointer"
              >
                <span>
                  {currentStep === 1
                    ? 'Lanjut ke Bagian B (Keluhan Utama)'
                    : currentStep === 2
                      ? adaKeluhan === 'ya'
                        ? 'Lanjut ke Bagian C (Rincian Keluhan)'
                        : 'Lanjut ke Bagian D (Info Pendukung)'
                      : currentStep === 3
                        ? 'Lanjut ke Bagian D (Info Pendukung)'
                        : 'Periksa Jawaban & Validasi'}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Profile, Guide, Payload Preview, Urgent Warning */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card 1: Identitas Pasien & Jadwal Telekonsultasi */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                IDENTITAS PASIEN
              </span>
              <span className="rounded-md border border-[#99F6E4] bg-[#CCFBF1] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
                Tervalidasi BPJS / SatuSehat
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#99F6E4] bg-[#CCFBF1] font-display text-sm font-bold text-[#0F766E]">
                CL
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-display text-sm font-bold text-[#0F172A]">
                  {patientName}
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  RM: {patientRm} • 24 Thn
                </p>
                <p className="text-[10px] text-[#64748B]">
                  Perempuan • Gol. Darah O+
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E2E8F0] border-t border-[#E2E8F0] text-xs pt-1">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#64748B]">Sesi Konsultasi:</span>
                <span className="font-semibold text-[#0F172A] text-right">Poli Umum / Penyakit Dalam</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#64748B]">Dokter Spesialis:</span>
                <span className="font-semibold text-[#0F172A]">dr. Tirta Wijaya, Sp.PD</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#64748B]">Jadwal Telekons:</span>
                <span className="font-bold text-[#0D9488]">
                  Hari ini, {formatIndonesianTime(new Date(Date.now() + 60 * 60 * 1000))}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Panduan Pengisian Klinis */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-3">
            <h3 className="flex items-center gap-2 font-display text-xs font-bold text-[#0F172A]">
              <FileCheck2 className="h-4 w-4 text-[#0D9488]" />
              <span>Panduan Pengisian Klinis</span>
            </h3>

            <ul className="space-y-2.5 text-xs text-[#334155]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#059669] shrink-0 mt-0.5" />
                <span>Berikan perkiraan seakurat mungkin mengenai frekuensi keluhan dalam 7 hari terakhir.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#059669] shrink-0 mt-0.5" />
                <span>Jika keluhan dirasakan kurang dari 1 hari penuh, gunakan pilihan rentang hari terkecil pada stepper.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#059669] shrink-0 mt-0.5" />
                <span>Data dapat diperbarui kembali kapan saja sebelum dokter memulai ruang telekonsultasi.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Payload Preview (PATCH JSON) */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Payload Preview (PATCH)
              </span>
              <span className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#475569]">
                JSON
              </span>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 font-mono text-[11px] text-[#334155] leading-relaxed overflow-x-auto">
              <pre>{JSON.stringify(payloadPreview, null, 2)}</pre>
            </div>
          </div>

          {/* Card 4: Butuh Bantuan Perawat Triase? */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3 text-xs font-bold text-[#334155] shadow-xs hover:border-[#0D9488] hover:bg-[#F0FDFA] hover:text-[#0F766E] transition-colors"
          >
            <MessageSquare className="h-4 w-4 text-[#0D9488]" />
            <span>Butuh Bantuan Perawat Triase?</span>
          </button>

          {/* Card 5: Peringatan Kegawatdaruratan (Red Banner) */}
          <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-xs text-[#991B1B] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#DC2626]">
              <span className="text-sm font-extrabold">*</span>
              <span>Peringatan Kegawatdaruratan</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#991B1B]">
              Jika Anda mengalami nyeri dada menjalar, sesak napas berat, kelemahan separuh tubuh mendadak, atau pendarahan hebat, segera hubungi <strong>119</strong> atau kunjungi <strong>IGD RS terdekat</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
