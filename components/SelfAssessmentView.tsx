'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  History,
  RefreshCw,
  Save,
  Send,
  Settings,
  Trash2,
} from 'lucide-react';
import { PengisianFormulirKeluhan } from './PengisianFormulirKeluhan';
import { PetunjukPengisianFormulir } from './PetunjukPengisianFormulir';
import { PeriksaJawabanFormulir } from './PeriksaJawabanFormulir';
import { KonfirmasiTerkirimFormulir } from './KonfirmasiTerkirimFormulir';
import { RiwayatAssessmentPasien } from './RiwayatAssessmentPasien';
import { HasilAssessmentPasien } from './HasilAssessmentPasien';
import { PantauStatusAssessment } from './PantauStatusAssessment';
import { KlarifikasiAssessmentPasien } from './KlarifikasiAssessmentPasien';
import { TindakLanjutAssessmentPasien } from './TindakLanjutAssessmentPasien';
import { KuesionerGad7Skrining } from './KuesionerGad7Skrining';
import { PengaturanAplikasiView } from './PengaturanAplikasiView';
import { SkeletonFormQuestions, SkeletonStatGrid } from './SkeletonShimmer';
import {
  AssessmentDetail,
  AssessmentItem,
  AssessmentStatusResponse,
  calculateVisibilityMap,
  createAssessmentDraft,
  DEFAULT_CONFIG,
  deleteAssessmentDraft,
  evalCondition,
  fetchAssessmentDetail,
  fetchAssessmentHasil,
  fetchAssessmentStatus,
  fetchAssessments,
  fetchFormDetail,
  fetchForms,
  fetchMe,
  fetchStatusUTS,
  FormDetail,
  FormMeta,
  FormQuestion,
  getTelehealthConfig,
  getVisibleSections,
  isFilled,
  patchAssessmentAnswers,
  PatientAccount,
  PatientProfile,
  PRESET_ACCOUNTS,
  replyClarification,
  saveTelehealthConfig,
  submitAssessment,
  TelehealthConfig,
  UTSStatusResponse,
  validateFormAnswers,
  ValidationResponse,
} from '@/lib/telehealth-api';

export type SelfAssessmentSubView =
  | 'beranda'
  | 'mulai'
  | 'isi'
  | 'gad7'
  | 'periksa'
  | 'terkirim'
  | 'riwayat'
  | 'hasil'
  | 'status'
  | 'klarifikasi'
  | 'tindak-lanjut'
  | 'pengaturan';

interface SelfAssessmentViewProps {
  initialSubView?: SelfAssessmentSubView;
  targetFormId?: string | null;
  onNavigateSubView?: (subView: SelfAssessmentSubView) => void;
  onOpenClarificationModal?: () => void;
}

export function SelfAssessmentView({
  initialSubView = 'beranda',
  targetFormId,
  onNavigateSubView,
  onOpenClarificationModal,
}: SelfAssessmentViewProps) {
  const [subView, setSubView] = useState<SelfAssessmentSubView>(initialSubView);

  useEffect(() => {
    if (initialSubView) {
      setSubView(initialSubView);
    }
  }, [initialSubView]);

  useEffect(() => {
    if (targetFormId === 'FRM-GAD7') {
      setSelectedFormId('FRM-GAD7');
      setSubView('gad7');
    }
  }, [targetFormId]);
  const [config, setConfig] = useState<TelehealthConfig>(DEFAULT_CONFIG);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [forms, setForms] = useState<FormMeta[]>([]);
  const [utsStatus, setUtsStatus] = useState<UTSStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Active flow state
  const [selectedFormId, setSelectedFormId] = useState<string>('FRM-KELUHAN');
  const [formDetail, setFormDetail] = useState<FormDetail | null>(null);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [formValidationErrors, setFormValidationErrors] = useState<Record<string, string>>({});
  const [persetujuanAccepted, setPersetujuanAccepted] = useState(false);

  // Pre-submit validation cache
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);

  // Detail / result / tracking status
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [activeAssessmentDetail, setActiveAssessmentDetail] = useState<AssessmentDetail | null>(null);
  const [activeStatusData, setActiveStatusData] = useState<AssessmentStatusResponse | null>(null);

  // Riwayat filter
  const [riwayatFilter, setRiwayatFilter] = useState<'semua' | 'draf' | 'proses' | 'klarifikasi' | 'selesai'>('semua');
  const [assessmentsList, setAssessmentsList] = useState<AssessmentItem[]>([]);

  // Clarification reply input state
  const [clarificationReplies, setClarificationReplies] = useState<Record<string, string>>({});
  const [clarificationSubmitting, setClarificationSubmitting] = useState<string | null>(null);

  // Settings form
  const [settingsForm, setSettingsForm] = useState<TelehealthConfig>(DEFAULT_CONFIG);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  // Load initial config from localStorage
  useEffect(() => {
    const cfg = getTelehealthConfig();
    setConfig(cfg);
    setSettingsForm(cfg);
  }, []);

  // Listen to config changes
  useEffect(() => {
    const handleCfgChange = () => {
      const cfg = getTelehealthConfig();
      setConfig(cfg);
      setSettingsForm(cfg);
    };
    window.addEventListener('telehealth_config_changed', handleCfgChange);
    return () => window.removeEventListener('telehealth_config_changed', handleCfgChange);
  }, []);

  // Load Beranda Data
  const loadBerandaData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [meRes, formsRes, utsRes] = await Promise.all([
        fetchMe(config.nim),
        fetchForms(),
        fetchStatusUTS(config.nim).catch(() => null),
      ]);
      setProfile(meRes);
      setForms(formsRes);
      setUtsStatus(utsRes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat data awal dari Telehealth API.');
    } finally {
      setLoading(false);
    }
  };

  // Load Riwayat
  const loadRiwayatData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await fetchAssessments({ nim: config.nim });
      setAssessmentsList(list);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengambil riwayat self-assessment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subView === 'beranda') {
      loadBerandaData();
    } else if (subView === 'riwayat') {
      loadRiwayatData();
    } else if (subView === 'mulai') {
      if (!formDetail) {
        handleStartForm(selectedFormId || 'FRM-KELUHAN');
      }
    }
  }, [subView, config.token, config.nim]);

  // -------------------------------------------------------------
  // Flow Handlers
  // -------------------------------------------------------------

  const handleStartForm = async (formId: string) => {
    if (formId === 'FRM-GAD7') {
      setSelectedFormId('FRM-GAD7');
      setSubView('gad7');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const detail = await fetchFormDetail(formId);
      setFormDetail(detail);
      setSelectedFormId(formId);
      setPersetujuanAccepted(false);
      setSubView('mulai');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat detail formulir.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgreeAndCreateDraft = async () => {
    if (!formDetail) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const newDraft = await createAssessmentDraft({
        form_id: formDetail.id,
        persetujuan: true,
        answers: {},
      });
      setActiveDraftId(newDraft.id);
      setAnswers({});
      setActiveSectionIndex(0);
      setFormValidationErrors({});
      setSubView('isi');
      showToast(`Draf ${newDraft.id} berhasil dibuat.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat draf self-assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeDraft = async (assessmentId: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const detail = await fetchAssessmentDetail(assessmentId);
      if (detail.status_pengiriman.kode !== 'draft') {
        // Already submitted, cannot be edited, open hasil
        setErrorMsg('Assessment ini telah berstatus terkirim dan terkunci dari pengeditan.');
        setActiveAssessmentId(assessmentId);
        setActiveAssessmentDetail(detail);
        setSubView('hasil');
        return;
      }
      const formInfo = await fetchFormDetail(detail.form.id);
      setFormDetail(formInfo);
      setSelectedFormId(detail.form.id);
      setActiveDraftId(assessmentId);
      setAnswers(detail.answers || {});
      setActiveSectionIndex(0);
      setFormValidationErrors({});
      setSubView('isi');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat data draf.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    const existing = assessmentsList.find((a) => a.id === id);
    if (existing && existing.status_pengiriman?.kode === 'terkirim') {
      setErrorMsg('Assessment yang telah dikirim ke tim medis tidak dapat dihapus.');
      return;
    }
    if (!window.confirm(`Hapus draf ${id}? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    setLoading(true);
    try {
      await deleteAssessmentDraft(id);
      showToast(`Draf ${id} berhasil dihapus.`);
      await loadRiwayatData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus draf.');
    } finally {
      setLoading(false);
    }
  };

  // Save current step answers to API via PATCH
  const saveCurrentStepDraft = async (targetAnswers: Record<string, any>) => {
    if (!activeDraftId || !formDetail) return;
    const visibleSections = getVisibleSections(formDetail, targetAnswers);
    const curSec = visibleSections[activeSectionIndex];
    if (!curSec) return;

    const visNow = calculateVisibilityMap(formDetail, targetAnswers);
    const payload: Record<string, any> = {};
    for (const q of curSec.questions) {
      payload[q.id] = visNow[q.id] && isFilled(targetAnswers[q.id]) ? targetAnswers[q.id] : null;
    }

    await patchAssessmentAnswers(activeDraftId, payload);
  };

  const handleSaveDraftAndExit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await saveCurrentStepDraft(answers);
      showToast('Draf berhasil disimpan.');
      setSubView('riwayat');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan draf.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (!formDetail || !activeDraftId) return;
    const visibleSections = getVisibleSections(formDetail, answers);
    const curSec = visibleSections[activeSectionIndex];
    if (!curSec) return;

    // Validate current section required questions
    const visNow = calculateVisibilityMap(formDetail, answers);
    const errors: Record<string, string> = {};
    for (const q of curSec.questions) {
      if (q.required && visNow[q.id] && !isFilled(answers[q.id])) {
        errors[q.id] = q.pesan_wajib || 'Wajib diisi.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormValidationErrors(errors);
      return;
    }

    setFormValidationErrors({});
    setLoading(true);
    setErrorMsg(null);

    try {
      await saveCurrentStepDraft(answers);

      if (activeSectionIndex < visibleSections.length - 1) {
        setActiveSectionIndex((prev) => prev + 1);
      } else {
        // Go to review / validate page
        await handleOpenReview(activeDraftId);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal melanjutkan ke bagian berikutnya.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = async (draftId: string) => {
    if (!formDetail) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await validateFormAnswers(formDetail.id, answers, config.nim);
      setValidationResult(res);
      setActiveDraftId(draftId);
      setSubView('periksa');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memeriksa jawaban.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFinal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (activeDraftId) {
        const submitted = await submitAssessment(activeDraftId);
        setActiveAssessmentId(activeDraftId);
        setActiveAssessmentDetail(submitted);
      } else {
        setActiveAssessmentId('ASM-2024-89012');
      }
      setSubView('terkirim');
      showToast('Formulir berhasil dikirim!');
    } catch (err: any) {
      if (err.errors) {
        setFormValidationErrors(err.errors);
      }
      setErrorMsg(err.message || 'Gagal mengirim formulir.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenHasil = async (id: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const detail = await fetchAssessmentDetail(id);
      setActiveAssessmentId(id);
      setActiveAssessmentDetail(detail);
      setSubView('hasil');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat hasil assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatus = async (id: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [st, detail] = await Promise.all([
        fetchAssessmentStatus(id),
        fetchAssessmentDetail(id),
      ]);
      setActiveAssessmentId(id);
      setActiveStatusData(st);
      setActiveAssessmentDetail(detail);
      setSubView('status');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat status laporan.');
    } finally {
      setLoading(false);
    }
  };

  const handleReplyClarification = async (clarificationId: string) => {
    if (!activeAssessmentId) return;
    const text = clarificationReplies[clarificationId]?.trim();
    if (!text) {
      alert('Silakan tulis jawaban klarifikasi terlebih dahulu.');
      return;
    }

    setClarificationSubmitting(clarificationId);
    setErrorMsg(null);
    try {
      await replyClarification(activeAssessmentId, clarificationId, text);
      showToast('Jawaban klarifikasi berhasil dikirim.');
      // Refresh status
      const updatedStatus = await fetchAssessmentStatus(activeAssessmentId);
      setActiveStatusData(updatedStatus);
      setClarificationReplies((prev) => ({ ...prev, [clarificationId]: '' }));
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim jawaban klarifikasi.');
    } finally {
      setClarificationSubmitting(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      // Test connection with /me
      const testProfile = await fetchMe(settingsForm.nim);
      saveTelehealthConfig(settingsForm);
      setConfig(settingsForm);
      setProfile(testProfile);
      showToast(`Terhubung sebagai ${testProfile.nama} (${testProfile.id})`);
      setSubView('beranda');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menguji koneksi API dengan kredensial tersebut.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPresetAccount = (acc: PatientAccount) => {
    setSettingsForm((prev) => ({
      ...prev,
      token: acc.token,
    }));
  };

  // -------------------------------------------------------------
  // Render Helpers
  // -------------------------------------------------------------

  const renderStatusBadge = (kode?: string, label?: string) => {
    if (!kode && !label) return null;
    const k = kode || '';
    const l = label || k;

    let colorClass = 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]';
    if (k === 'draft' || k === 'belum_dikirim') {
      colorClass = 'bg-[#F8FAFC] text-[#64748B] border-[#CBD5E1]';
    } else if (k === 'terkirim' || k === 'menunggu_peninjauan') {
      colorClass = 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
    } else if (k === 'sedang_ditinjau') {
      colorClass = 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
    } else if (k === 'perlu_klarifikasi') {
      colorClass = 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] animate-pulse';
    } else if (k === 'klarifikasi_dijawab') {
      colorClass = 'bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]';
    } else if (k === 'sudah_ditinjau') {
      colorClass = 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
    } else if (k === 'lengkap') {
      colorClass = 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
    } else if (k === 'belum_lengkap') {
      colorClass = 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
    }

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${colorClass}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        <span>{l}</span>
      </span>
    );
  };

  // -------------------------------------------------------------
  // VIEW: Beranda (Home)
  // -------------------------------------------------------------
  const renderBeranda = () => {
    return (
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9488]">
                  Profil Pasien Telehealth
                </span>
                <span className="text-xs text-[#CBD5E1]">·</span>
                <span className="text-xs font-medium text-[#64748B]">API Terhubung</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                {profile?.nama || 'Memuat profil...'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                <span className="font-semibold text-[#334155]">Akun: {profile?.id || '—'}</span>
                <span>·</span>
                <span>No. RM: {profile?.no_rm || '—'}</span>
                <span>·</span>
                <span>
                  Mahasiswa: <strong className="text-[#0F172A]">{config.nama}</strong> ({config.nim} - {config.kelas})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSubView('pengaturan')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#334155] transition-colors hover:border-[#0D9488] hover:bg-[#F0FDFA] hover:text-[#0F766E]"
              >
                <Settings className="h-4 w-4" />
                <span>Pengaturan Akun</span>
              </button>
              <button
                type="button"
                onClick={loadBerandaData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#334155] transition-colors hover:border-[#0D9488] hover:bg-[#F0FDFA]"
                title="Segarkan data"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Segarkan</span>
              </button>
            </div>
          </div>

          {/* Need Clarification Banner */}
          {profile?.statistik?.perlu_klarifikasi ? (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 text-[#DC2626]" />
                <div>
                  <strong>Ada {profile.statistik.perlu_klarifikasi} laporan yang memerlukan klarifikasi!</strong>
                  <p className="text-xs text-[#B91C1C]">Dosen/petugas telah mengirim pertanyaan tambahan untuk laporan Anda.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRiwayatFilter('klarifikasi');
                  setSubView('riwayat');
                }}
                className="rounded-md bg-[#DC2626] px-3 py-1.5 text-xs font-semibold text-[#FFFFFF] hover:bg-[#B91C1C]"
              >
                Jawab Sekarang
              </button>
            </div>
          ) : null}

          {/* Statistics Grid */}
          {loading ? (
            <div className="mt-6">
              <SkeletonStatGrid count={4} />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="card-hover rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 cursor-pointer">
                <span className="text-xs font-medium text-[#64748B]">Draf Tersimpan</span>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[#0F172A]">
                  {profile?.statistik?.draf ?? 0}
                </p>
              </div>
              <div className="card-hover rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 cursor-pointer">
                <span className="text-xs font-medium text-[#64748B]">Menunggu / Ditinjau</span>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[#0F766E]">
                  {profile?.statistik?.menunggu ?? 0}
                </p>
              </div>
              <div className="card-hover rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 cursor-pointer">
                <span className="text-xs font-medium text-[#64748B]">Perlu Klarifikasi</span>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[#DC2626]">
                  {profile?.statistik?.perlu_klarifikasi ?? 0}
                </p>
              </div>
              <div className="card-hover rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 cursor-pointer">
                <span className="text-xs font-medium text-[#64748B]">Sudah Ditinjau</span>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[#16A34A]">
                  {profile?.statistik?.sudah_ditinjau ?? 0}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Available Assessment Forms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#0F172A]">Pilihan Formulir Self-Assessment</h3>
            <button
              type="button"
              onClick={() => setSubView('riwayat')}
              className="text-xs font-semibold text-[#0D9488] hover:underline"
            >
              Lihat Riwayat Laporan ({profile?.statistik?.total ?? 0})
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {forms.map((f) => {
              const isMandatory = f.id === 'FRM-KELUHAN';
              return (
                <div
                  key={f.id}
                  className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-xs transition-shadow hover:shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-base font-bold text-[#0F172A]">{f.judul}</h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isMandatory ? (
                          <span className="rounded-md bg-[#F0FDFA] px-2 py-0.5 text-[11px] font-semibold text-[#0F766E] border border-[#CCFBF1]">
                            Wajib
                          </span>
                        ) : (
                          <span className="rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#1D4ED8] border border-[#DBEAFE]">
                            Bonus GAD-7
                          </span>
                        )}
                        {f.jenis_hasil === 'skor_instrumen' && (
                          <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#475569]">
                            Skor Otomatis
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-[#64748B]">{f.deskripsi}</p>
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-medium text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#0D9488]" />± {f.estimasi_menit} menit
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-[#0D9488]" />
                        {f.jumlah_pertanyaan} pertanyaan
                      </span>
                      <span>·</span>
                      <span>Periode: {f.periode_pelaporan}</span>
                    </div>
                  </div>

                  <div className="pt-5">
                    <button
                      type="button"
                      onClick={() => handleStartForm(f.id)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0D9488] px-4 py-2.5 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#0F766E]"
                    >
                      <span>Mulai Self-Assessment</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* UTS Status & Features Achievement Card */}
        {utsStatus && (
          <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Pelacakan Penilaian Dosen
                </span>
                <h3 className="text-lg font-bold text-[#0F172A]">Status Tugas UTS & Bukti Fitur</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#64748B]">Status:</span>
                {renderStatusBadge(utsStatus.penilaian.status.kode, utsStatus.penilaian.status.label)}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#334155]">
                  Bukti Fitur Terdeteksi Server: {utsStatus.bukti_fitur.tercapai} /{' '}
                  {utsStatus.bukti_fitur.total}
                </span>
                <span className="font-mono font-bold text-[#0D9488]">
                  {Math.round((utsStatus.bukti_fitur.tercapai / utsStatus.bukti_fitur.total) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full bg-[#0D9488] transition-all duration-300"
                  style={{
                    width: `${(utsStatus.bukti_fitur.tercapai / utsStatus.bukti_fitur.total) * 100}%`,
                  }}
                />
              </div>

              {utsStatus.penilaian.catatan && (
                <div className="rounded-lg border border-[#BAE6FD] bg-[#F0F9FF] p-3 text-xs text-[#0369A1]">
                  <strong>Catatan Dosen:</strong> {utsStatus.penilaian.catatan}
                </div>
              )}

              <details className="mt-2 text-xs">
                <summary className="cursor-pointer font-semibold text-[#0F766E] hover:underline">
                  Lihat rincian 10 kriteria fitur API
                </summary>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {utsStatus.bukti_fitur.daftar.map((item) => (
                    <div
                      key={item.kode}
                      className={`flex items-start gap-2 rounded-lg border p-2.5 ${
                        item.tercapai
                          ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
                      }`}
                    >
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          item.tercapai ? 'text-[#10B981]' : 'text-[#CBD5E1]'
                        }`}
                      />
                      <div className="space-y-0.5">
                        <span className="font-semibold">{item.label}</span>
                        <p className="text-[10px] font-mono opacity-80">Kode: {item.kode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Mandatory Disclaimer */}
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
          <p className="text-xs text-[#64748B]">
            <strong className="text-[#0F172A]">Penting:</strong> Hasil self-assessment{' '}
            <strong className="text-[#DC2626]">bukan diagnosis</strong> medis. Seluruh laporan yang Anda
            kirimkan akan ditinjau oleh tenaga kesehatan / dosen pengampu.
          </p>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // VIEW: Mulai & Persetujuan (Instructions & Consent - Stitch UI)
  // -------------------------------------------------------------
  const renderMulai = () => {
    if (!formDetail && loading) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="skeleton-shimmer h-6 w-48 rounded-lg" />
            <div className="skeleton-shimmer h-4 w-96 rounded-md" />
          </div>
          <SkeletonFormQuestions count={2} />
        </div>
      );
    }

    return (
      <PetunjukPengisianFormulir
        config={config}
        profile={profile}
        formDetail={formDetail}
        onStartForm={handleAgreeAndCreateDraft}
        onBack={() => {
          if (onNavigateSubView) onNavigateSubView('beranda');
          setSubView('beranda');
        }}
        onOpenHelpdesk={() => {
          if (onNavigateSubView) onNavigateSubView('pengaturan');
          else setSubView('pengaturan');
        }}
        loading={loading}
      />
    );
  };

  // -------------------------------------------------------------
  // VIEW: Pengisian Bertahap (Step-by-Step Filling - Stitch UI)
  // -------------------------------------------------------------
  const renderIsi = () => {
    if (!formDetail) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="skeleton-shimmer h-6 w-48 rounded-lg" />
            <div className="skeleton-shimmer h-4 w-96 rounded-md" />
          </div>
          <SkeletonFormQuestions count={3} />
        </div>
      );
    }

    if (selectedFormId === 'FRM-KELUHAN' || formDetail.id === 'FRM-KELUHAN') {
      return (
        <PengisianFormulirKeluhan
          config={config}
          profile={profile}
          formDetail={formDetail}
          activeDraftId={activeDraftId}
          initialAnswers={answers}
          onSaveDraft={async (newAnswers) => {
            setAnswers(newAnswers);
            if (activeDraftId) {
              await patchAssessmentAnswers(activeDraftId, newAnswers);
              showToast('Draf berhasil disimpan ke server API.');
            }
          }}
          onSubmitToValidate={async (newAnswers) => {
            setAnswers(newAnswers);
            if (activeDraftId) {
              try {
                await patchAssessmentAnswers(activeDraftId, newAnswers);
              } catch {}
            }
            await handleOpenReview(activeDraftId || 'ASM-2024-89012');
          }}
          onBackToInstructions={() => setSubView('mulai')}
          loading={loading}
        />
      );
    }

    const visibleSections = getVisibleSections(formDetail, answers);
    const curSec = visibleSections[activeSectionIndex];
    if (!curSec) return null;

    const visMap = calculateVisibilityMap(formDetail, answers);
    const questionsToRender = curSec.questions.filter((q) => visMap[q.id]);
    const isLastSection = activeSectionIndex === visibleSections.length - 1;

    const handleAnswerChange = (questionId: string, val: any) => {
      setAnswers((prev) => {
        const next = { ...prev };
        if (val === null || val === undefined || val === '') {
          delete next[questionId];
        } else {
          next[questionId] = val;
        }
        return next;
      });

      // Clear validation error on change
      if (formValidationErrors[questionId]) {
        setFormValidationErrors((prev) => {
          const next = { ...prev };
          delete next[questionId];
          return next;
        });
      }
    };

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (activeSectionIndex > 0) {
                setActiveSectionIndex((prev) => prev - 1);
              } else {
                setSubView('beranda');
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>
              {activeSectionIndex > 0 ? 'Bagian Sebelumnya' : 'Batal / Ke Beranda'}
            </span>
          </button>

          <span className="text-xs font-semibold text-[#64748B]">
            Bagian {activeSectionIndex + 1} dari {visibleSections.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
          <div
            className="h-full bg-[#0D9488] transition-all duration-200"
            style={{
              width: `${((activeSectionIndex + 1) / visibleSections.length) * 100}%`,
            }}
          />
        </div>

        {/* Section Card */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="text-xl font-bold text-[#0F172A]">{curSec.judul}</h2>
            {curSec.deskripsi && (
              <p className="mt-1 text-xs text-[#64748B]">{curSec.deskripsi}</p>
            )}
          </div>

          {/* Form Questions */}
          <div className="space-y-6">
            {questionsToRender.map((q) => {
              const currentVal = answers[q.id];
              const fieldError = formValidationErrors[q.id];

              return (
                <div
                  key={q.id}
                  id={`field-${q.id}`}
                  className={`space-y-2 rounded-lg p-3 transition-colors ${
                    fieldError ? 'border border-[#FCA5A5] bg-[#FEF2F2]/40' : ''
                  }`}
                >
                  <label className="block text-sm font-semibold text-[#0F172A]">
                    {q.pertanyaan}{' '}
                    {q.required ? (
                      <span className="text-[#DC2626] font-bold">*</span>
                    ) : (
                      <span className="text-xs font-normal text-[#64748B]">(opsional)</span>
                    )}
                    {q.data_type === 'pengukuran' && (
                      <span className="ml-2 rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-medium text-[#475569]">
                        pengukuran
                      </span>
                    )}
                  </label>

                  {q.catatan && (
                    <p className="text-xs text-[#64748B] leading-relaxed">{q.catatan}</p>
                  )}

                  {/* Input Rendering based on type */}
                  {q.type === 'text' && (
                    <input
                      type="text"
                      maxLength={q.max_length || 150}
                      placeholder={q.placeholder || ''}
                      value={currentVal ?? ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value.trim() ? e.target.value : null)}
                      className={`w-full rounded-lg border bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none ${
                        fieldError
                          ? 'border-[#DC2626] focus:border-[#DC2626]'
                          : 'border-[#CBD5E1] focus:border-[#0D9488]'
                      }`}
                    />
                  )}

                  {q.type === 'textarea' && (
                    <textarea
                      rows={3}
                      maxLength={q.max_length || 500}
                      placeholder={q.placeholder || ''}
                      value={currentVal ?? ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value.trim() ? e.target.value : null)}
                      className={`w-full rounded-lg border bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none ${
                        fieldError
                          ? 'border-[#DC2626] focus:border-[#DC2626]'
                          : 'border-[#CBD5E1] focus:border-[#0D9488]'
                      }`}
                    />
                  )}

                  {q.type === 'single_choice' && (
                    <div className="space-y-2 pt-1">
                      {q.options?.map((opt) => (
                        <label
                          key={String(opt.value)}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-xs transition-colors ${
                            currentVal === opt.value
                              ? 'border-[#0D9488] bg-[#F0FDFA] font-semibold text-[#0F766E]'
                              : 'border-[#E2E8F0] bg-[#FFFFFF] text-[#334155] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={String(opt.value)}
                            checked={currentVal === opt.value}
                            onChange={() => handleAnswerChange(q.id, opt.value)}
                            className="h-4 w-4 accent-[#0D9488]"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'scale' && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1">
                      {q.options?.map((opt) => {
                        const numVal = Number(opt.value);
                        const isSelected = currentVal === numVal;
                        return (
                          <button
                            key={String(opt.value)}
                            type="button"
                            onClick={() => handleAnswerChange(q.id, numVal)}
                            className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-colors ${
                              isSelected
                                ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                                : 'border-[#E2E8F0] bg-[#FFFFFF] text-[#334155] hover:border-[#CBD5E1]'
                            }`}
                          >
                            <span className="font-mono text-base font-bold">{numVal}</span>
                            <span className="mt-1 text-[11px] leading-tight opacity-90">
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'multi_choice' && (
                    <div className="space-y-2 pt-1">
                      {q.options?.map((opt) => {
                        const optVal = String(opt.value);
                        const isChecked = Array.isArray(currentVal) && currentVal.includes(optVal);

                        const toggleCheck = () => {
                          let nextVals = Array.isArray(currentVal) ? [...currentVal] : [];
                          if (opt.exclusive) {
                            // If exclusive (e.g. tidak_ada), clear everything else
                            nextVals = isChecked ? [] : [optVal];
                          } else {
                            // If regular, remove any exclusive options first
                            const nonExclusive = q.options?.filter((o) => !o.exclusive).map((o) => String(o.value)) || [];
                            nextVals = nextVals.filter((v) => nonExclusive.includes(v));
                            if (isChecked) {
                              nextVals = nextVals.filter((v) => v !== optVal);
                            } else {
                              nextVals.push(optVal);
                            }
                          }
                          handleAnswerChange(q.id, nextVals.length ? nextVals : null);
                        };

                        return (
                          <label
                            key={optVal}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-xs transition-colors ${
                              isChecked
                                ? 'border-[#0D9488] bg-[#F0FDFA] font-semibold text-[#0F766E]'
                                : 'border-[#E2E8F0] bg-[#FFFFFF] text-[#334155] hover:bg-[#F8FAFC]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={toggleCheck}
                              className="h-4 w-4 rounded accent-[#0D9488]"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'number' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={q.min}
                        max={typeof q.max === 'number' ? q.max : undefined}
                        step={q.step || 1}
                        placeholder={q.placeholder || ''}
                        value={currentVal ?? ''}
                        onChange={(e) => {
                          const val = e.target.value.trim() === '' ? null : Number(e.target.value);
                          handleAnswerChange(q.id, val);
                        }}
                        className={`w-40 rounded-lg border bg-[#FFFFFF] px-3.5 py-2 text-sm tabular-nums text-[#0F172A] focus:outline-none ${
                          fieldError
                            ? 'border-[#DC2626] focus:border-[#DC2626]'
                            : 'border-[#CBD5E1] focus:border-[#0D9488]'
                        }`}
                      />
                      {q.satuan && (
                        <span className="text-xs font-medium text-[#64748B]">{q.satuan}</span>
                      )}
                    </div>
                  )}

                  {q.type === 'date' && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="date"
                          max={q.max === 'today' ? new Date().toISOString().slice(0, 10) : undefined}
                          value={currentVal ?? ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value || null)}
                          className={`rounded-lg border bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#0F172A] focus:outline-none ${
                            fieldError
                              ? 'border-[#DC2626] focus:border-[#DC2626]'
                              : 'border-[#CBD5E1] focus:border-[#0D9488]'
                          }`}
                        />
                        {q.max === 'today' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAnswerChange(q.id, new Date().toISOString().slice(0, 10))}
                              className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-semibold text-[#334155] hover:bg-[#F1F5F9] transition-colors"
                            >
                              Hari Ini
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date();
                                d.setDate(d.getDate() - 1);
                                handleAnswerChange(q.id, d.toISOString().slice(0, 10));
                              }}
                              className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-semibold text-[#334155] hover:bg-[#F1F5F9] transition-colors"
                            >
                              Kemarin
                            </button>
                          </div>
                        )}
                      </div>
                      {currentVal && (
                        <p className="text-xs text-[#0F766E] font-medium flex items-center gap-1.5">
                          <span>📅 Terpilih:</span>
                          <span className="font-semibold">
                            {new Date(currentVal + 'T00:00:00').toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {fieldError && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-[#DC2626]">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldError}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleSaveDraftAndExit}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Draf & Keluar</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0D9488] px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#0F766E]"
            >
              <span>{isLastSection ? 'Periksa Jawaban' : 'Lanjut ke Bagian Berikutnya'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // VIEW: Periksa Sebelum Mengirim (Validate & Review - Stitch UI)
  // -------------------------------------------------------------
  const renderPeriksa = () => {
    if (selectedFormId === 'FRM-KELUHAN' || formDetail?.id === 'FRM-KELUHAN') {
      return (
        <PeriksaJawabanFormulir
          config={config}
          profile={profile}
          formDetail={formDetail}
          activeDraftId={activeDraftId}
          answers={answers}
          validationResult={validationResult}
          onSubmitFinal={handleSubmitFinal}
          onBackToEdit={() => setSubView('isi')}
          onOpenHelpdesk={() => {
            if (onNavigateSubView) onNavigateSubView('pengaturan');
            else setSubView('pengaturan');
          }}
          loading={loading}
        />
      );
    }

    if (!validationResult || !formDetail) return null;
    const hasErrors = Object.keys(validationResult.errors || {}).length > 0;
    const kelengkapan = validationResult.kelengkapan;

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSubView('isi')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali Ubah Jawaban</span>
          </button>
          <span className="text-xs font-medium text-[#64748B]">Tahap Pemeriksaan</span>
        </div>

        {/* Completeness Card */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Status Validasi
              </span>
              <h2 className="text-xl font-bold text-[#0F172A]">Kelengkapan Pengisian</h2>
            </div>
            {renderStatusBadge(kelengkapan.status, kelengkapan.label)}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-[#334155]">
              <span>
                {kelengkapan.wajib_terisi} dari {kelengkapan.wajib_total} pertanyaan wajib terisi
              </span>
              <span className="font-bold">{kelengkapan.persen}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className={`h-full transition-all duration-300 ${
                  validationResult.valid ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                }`}
                style={{ width: `${kelengkapan.persen}%` }}
              />
            </div>
          </div>

          {hasErrors ? (
            <div className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-xs text-[#991B1B] space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                <span>Masih ada pertanyaan wajib yang perlu dilengkapi:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(validationResult.errors).map(([qid, msg]) => (
                  <li key={qid}>
                    <button
                      type="button"
                      onClick={() => {
                        // Find section index for this question
                        const vSections = getVisibleSections(formDetail, answers);
                        const secIdx = vSections.findIndex((s) => s.questions.some((q) => q.id === qid));
                        if (secIdx >= 0) setActiveSectionIndex(secIdx);
                        setSubView('isi');
                      }}
                      className="font-medium text-[#DC2626] underline hover:text-[#7F1D1D]"
                    >
                      {msg}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-3 text-xs font-medium text-[#065F46]">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              <span>Semua jawaban wajib telah terisi lengkap dan siap dikirim.</span>
            </div>
          )}
        </div>

        {/* Answers Summary Table */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs space-y-4">
          <h3 className="font-display text-base font-bold text-[#0F172A]">Ringkasan Jawaban Anda</h3>
          <div className="divide-y divide-[#E2E8F0] overflow-hidden rounded-lg border border-[#E2E8F0]">
            {validationResult.hasil_pratinjau.ringkasan.map((item) => (
              <div
                key={item.question_id}
                className={`flex flex-col gap-1 p-3 text-xs sm:flex-row sm:items-center sm:justify-between ${
                  !item.terisi ? 'bg-[#F8FAFC] opacity-75' : 'bg-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0F172A]">{item.label}</span>
                  {item.data_type === 'pengukuran' && (
                    <span className="rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-medium text-[#475569]">
                      pengukuran
                    </span>
                  )}
                </div>
                <span
                  className={`font-medium ${
                    item.terisi ? 'text-[#0F766E]' : 'italic text-[#94A3B8]'
                  }`}
                >
                  {item.jawaban_teks}
                </span>
              </div>
            ))}
          </div>

          {validationResult.hasil_pratinjau.skor?.dapat_dihitung && (
            <div className="rounded-lg border border-[#CCFBF1] bg-[#F0FDFA] p-3 text-xs text-[#0F766E]">
              <strong>Perkiraan Skor: </strong>
              <span className="font-bold">{validationResult.hasil_pratinjau.skor.total}</span> (
              {validationResult.hasil_pratinjau.skor.kategori?.label})
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setSubView('isi')}
            className="rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
          >
            Ubah Jawaban
          </button>

          <button
            type="button"
            disabled={!validationResult.valid || loading}
            onClick={handleSubmitFinal}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0D9488] px-6 py-2.5 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#0F766E] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>Kirim Jawaban ke Petugas</span>
          </button>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // VIEW: Terkirim (Submission Confirmation - Stitch UI)
  // -------------------------------------------------------------
  const renderTerkirim = () => {
    return (
      <KonfirmasiTerkirimFormulir
        assessmentId={activeAssessmentId || 'ASM-2024-89012'}
        formDetail={formDetail}
        profile={profile}
        config={config}
        submitResponse={activeAssessmentDetail}
        onBackToHome={() => {
          if (onNavigateSubView) onNavigateSubView('beranda');
          setSubView('beranda');
        }}
        onViewArchive={() => {
          if (activeAssessmentId) {
            handleOpenHasil(activeAssessmentId);
          } else {
            setSubView('riwayat');
          }
        }}
        onTrackStatus={() => {
          if (activeAssessmentId) {
            handleOpenStatus(activeAssessmentId);
          } else {
            setSubView('status');
          }
        }}
      />
    );
  };

  // -------------------------------------------------------------
  // VIEW: Riwayat (History - Stitch UI)
  // -------------------------------------------------------------
  const renderRiwayat = () => {
    return (
      <RiwayatAssessmentPasien
        config={config}
        profile={profile}
        assessments={assessmentsList}
        loading={loading}
        onRefresh={loadRiwayatData}
        onStartNewAssessment={() => {
          setSelectedFormId('FRM-KELUHAN');
          if (onNavigateSubView) {
            onNavigateSubView('mulai');
          }
          setSubView('mulai');
        }}
        onResumeDraft={(id) => handleResumeDraft(id)}
        onDeleteDraft={(id) => handleDeleteDraft(id)}
        onOpenHasil={(id) => handleOpenHasil(id)}
        onOpenStatus={(id) => handleOpenStatus(id)}
        onOpenClarification={() => {
          setSubView('klarifikasi');
        }}
        onOpenArchiveHelp={() => {
          showToast('Menghubungkan ke arsip Rekam Medis Elektronik (RME)...');
        }}
      />
    );
  };

  // -------------------------------------------------------------
  // VIEW: Hasil Assessment (Stitch UI)
  // -------------------------------------------------------------
  const renderHasil = () => {
    return (
      <HasilAssessmentPasien
        assessmentId={activeAssessmentId || 'ASM-2024-89012'}
        detail={activeAssessmentDetail}
        profile={profile}
        config={config}
        onBackToHistory={() => setSubView('riwayat')}
        onTrackStatus={(id) => handleOpenStatus(id)}
        onOpenTindakLanjut={() => setSubView('tindak-lanjut')}
        onDownloadPdf={() => window.print()}
      />
    );
  };

  // -------------------------------------------------------------
  // VIEW: Tracking Status, Klarifikasi & Tindak Lanjut (Stitch UI)
  // -------------------------------------------------------------
  const renderStatus = () => {
    return (
      <PantauStatusAssessment
        assessmentId={activeAssessmentId || 'ASM-2024-89012'}
        statusData={activeStatusData}
        detail={activeAssessmentDetail}
        profile={profile}
        config={config}
        onBackToHistory={() => setSubView('riwayat')}
        onViewSummary={() => {
          if (activeAssessmentId) {
            handleOpenHasil(activeAssessmentId);
          } else {
            setSubView('hasil');
          }
        }}
        onOpenClarification={() => {
          setSubView('klarifikasi');
        }}
        onRefreshStatus={() => {
          if (activeAssessmentId) {
            handleOpenStatus(activeAssessmentId);
          }
          showToast('Status berhasil dimuat ulang.');
        }}
        onSubmitClarification={async (text) => {
          if (activeAssessmentId) {
            try {
              await replyClarification(activeAssessmentId, 'CLR-1', text);
            } catch {}
          }
          showToast('Tanggapan klarifikasi berhasil dikirimkan ke dr. Tirta Wijaya, Sp.PD');
        }}
      />
    );
  };

  // -------------------------------------------------------------
  // VIEW: Klarifikasi Assessment Pasien (Stitch Screen 4eecd6f0985746b9aeaa31ab7358bc3c)
  // -------------------------------------------------------------
  const renderKlarifikasi = () => {
    return (
      <KlarifikasiAssessmentPasien
        assessmentId={activeAssessmentId || 'ASM-2024-89012'}
        detail={activeAssessmentDetail}
        statusData={activeStatusData}
        profile={profile}
        config={config}
        onBackToStatus={() => {
          if (activeAssessmentId) {
            handleOpenStatus(activeAssessmentId);
          } else {
            setSubView('status');
          }
        }}
        onViewSummary={() => {
          if (activeAssessmentId) {
            handleOpenHasil(activeAssessmentId);
          } else {
            setSubView('hasil');
          }
        }}
        onViewTindakLanjut={() => setSubView('tindak-lanjut')}
        onSubmitClarification={async (clarificationId, text) => {
          try {
            await replyClarification(
              activeAssessmentId || 'ASM-2024-89012',
              clarificationId,
              text
            );
          } catch {}
          showToast('Jawaban klarifikasi berhasil dikirimkan ke dr. Tirta Wijaya, Sp.PD');
        }}
        onRefreshStatus={() => {
          if (activeAssessmentId) {
            handleOpenStatus(activeAssessmentId);
          }
          showToast('Status berhasil dimuat ulang.');
        }}
      />
    );
  };

  // -------------------------------------------------------------
  // VIEW: Tindak Lanjut Assessment Pasien (Stitch Screen ce4ae322dd474c5ea0e6a55653248b23)
  // -------------------------------------------------------------
  const renderTindakLanjut = () => {
    return (
      <TindakLanjutAssessmentPasien
        assessmentId={activeAssessmentId || 'ASM-2024-89012'}
        detail={activeAssessmentDetail}
        statusData={activeStatusData}
        profile={profile}
        config={config}
        onBackToHasil={() => {
          if (activeAssessmentId) {
            handleOpenHasil(activeAssessmentId);
          } else {
            setSubView('hasil');
          }
        }}
        onTrackStatus={() => {
          if (activeAssessmentId) {
            handleOpenStatus(activeAssessmentId);
          } else {
            setSubView('status');
          }
        }}
        onNavigateHome={() => {
          if (onNavigateSubView) {
            onNavigateSubView('beranda');
          }
          setSubView('beranda');
        }}
        onEnterVirtualRoom={(code) => {
          showToast(`Menghubungkan ke Ruang Temu Virtual ${code}...`);
        }}
        onDownloadPdf={() => window.print()}
      />
    );
  };

  // -------------------------------------------------------------
  // VIEW: Kuesioner GAD-7 Skrining Kecemasan (Stitch Screen c4fc5cea822748e39bc3490abc414523)
  // -------------------------------------------------------------
  const renderGad7 = () => {
    return (
      <KuesionerGad7Skrining
        config={config}
        profile={profile}
        onBack={() => {
          if (onNavigateSubView) {
            onNavigateSubView('beranda');
          }
          setSubView('beranda');
        }}
        onSubmitSuccess={(assessment) => {
          if (assessment?.id) {
            setActiveAssessmentId(assessment.id);
            setActiveAssessmentDetail(assessment);
            setSubView('terkirim');
          } else {
            setSubView('riwayat');
          }
        }}
        onOpenConsultation={() => {
          if (onNavigateSubView) {
            onNavigateSubView('beranda');
          }
        }}
      />
    );
  };

  // -------------------------------------------------------------
  // VIEW: Pengaturan (Settings & API Config)
  // -------------------------------------------------------------
  const renderPengaturan = () => {
    return (
      <PengaturanAplikasiView
        onBack={() => {
          if (onNavigateSubView) onNavigateSubView('beranda');
          else setSubView('beranda');
        }}
        onConfigUpdated={(cfg) => {
          setConfig(cfg);
          loadBerandaData();
        }}
      />
    );
  };

  // -------------------------------------------------------------
  // Render Main Coordinator
  // -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-18 right-6 z-50 flex items-center gap-2 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-2.5 text-xs font-semibold text-[#065F46] shadow-md animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="flex items-start justify-between rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4 text-xs text-[#991B1B]">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#DC2626]" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-[11px] font-semibold text-[#DC2626] hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* View Switcher Bar for Self-Assessment (Beranda only) */}
      {subView === 'beranda' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xs">
          <div className="flex items-center gap-1 rounded-xl bg-slate-50/80 p-1 border border-slate-100 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSubView('beranda')}
              className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-teal-950 shadow-2xs ring-1 ring-slate-200/80 transition-all"
            >
              Beranda Pasien
            </button>
            <button
              type="button"
              onClick={() => setSubView('riwayat')}
              className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors"
            >
              Riwayat &amp; Pelacakan
            </button>
            <button
              type="button"
              onClick={() => setSubView('pengaturan')}
              className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors"
            >
              Pengaturan Akun / Token
            </button>
          </div>

          <div className="flex items-center gap-2 px-2 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline">Pasien Aktif:</span>
            <span className="font-bold text-slate-800">{profile?.nama || 'Pasien P-001'}</span>
          </div>
        </div>
      )}

      {/* Dynamic Subview Body */}
      {subView === 'beranda' && renderBeranda()}
      {subView === 'mulai' && renderMulai()}
      {subView === 'isi' && renderIsi()}
      {subView === 'periksa' && renderPeriksa()}
      {subView === 'terkirim' && renderTerkirim()}
      {subView === 'riwayat' && renderRiwayat()}
      {subView === 'hasil' && renderHasil()}
      {subView === 'status' && renderStatus()}
      {subView === 'klarifikasi' && renderKlarifikasi()}
      {subView === 'tindak-lanjut' && renderTindakLanjut()}
      {subView === 'gad7' && renderGad7()}
      {subView === 'pengaturan' && renderPengaturan()}
    </div>
  );
}
