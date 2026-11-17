'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import {
  AcademicRoundItem,
  ClinicalWorkspaceView,
  EhrTab,
  evaluateVitalSeverity,
  PatientCase,
  PrescriptionOrder,
  SoapNote,
} from '@/lib/clinical';
import { ACADEMIC_ROUNDS, INITIAL_PATIENTS } from '@/lib/seed';
import {
  DEFAULT_CONFIG,
  fetchForms,
  fetchMe,
  fetchStatusUTS,
  FormMeta,
  getTelehealthConfig,
  PatientProfile,
  TelehealthConfig,
  UTSStatusResponse,
} from '@/lib/telehealth-api';

import { CareFlowSidebar, WorkspaceNavigationTab } from './CareFlowSidebar';
import { CareFlowTopHeader } from './CareFlowTopHeader';
import { DashboardUtamaPasien } from './DashboardUtamaPasien';
import { SelfAssessmentView } from './SelfAssessmentView';
import { ConsultationConsole } from './ConsultationConsole';
import { EhrUtilityPanel } from './EhrUtilityPanel';
import { PatientQueueView } from './PatientQueueView';
import { NewConsultationModal } from './NewConsultationModal';
import { KlarifikasiModal } from './KlarifikasiModal';
import { MatriksUtsModal } from './MatriksUtsModal';
import { ProgressTugasUtsMahasiswa } from './ProgressTugasUtsMahasiswa';
import { PengaturanAplikasiView } from './PengaturanAplikasiView';

const STORAGE_KEYS = {
  patients: 'careflow_patients_v1',
  rounds: 'careflow_rounds_v1',
  activeId: 'careflow_active_patient_v1',
};

interface WorkspaceStoreState {
  patients: PatientCase[];
  rounds: AcademicRoundItem[];
  activePatientId: string;
}

const DEFAULT_STORE_STATE: WorkspaceStoreState = {
  patients: INITIAL_PATIENTS,
  rounds: ACADEMIC_ROUNDS,
  activePatientId: INITIAL_PATIENTS[0].id,
};

const listeners = new Set<() => void>();
let cachedRawKey = '';
let cachedSnapshot: WorkspaceStoreState = DEFAULT_STORE_STATE;

function readStorageSnapshot(): WorkspaceStoreState {
  if (typeof window === 'undefined') return DEFAULT_STORE_STATE;
  try {
    const rawPatients = localStorage.getItem(STORAGE_KEYS.patients) ?? '';
    const rawRounds = localStorage.getItem(STORAGE_KEYS.rounds) ?? '';
    const rawActiveId = localStorage.getItem(STORAGE_KEYS.activeId) ?? '';
    const combinedKey = `${rawPatients}::${rawRounds}::${rawActiveId}`;
    if (combinedKey === cachedRawKey) {
      return cachedSnapshot;
    }

    let patients = INITIAL_PATIENTS;
    if (rawPatients) {
      const parsed = JSON.parse(rawPatients) as PatientCase[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        patients = parsed;
      }
    }

    let rounds = ACADEMIC_ROUNDS;
    if (rawRounds) {
      const parsedRounds = JSON.parse(rawRounds) as AcademicRoundItem[];
      if (Array.isArray(parsedRounds) && parsedRounds.length > 0) {
        rounds = parsedRounds;
      }
    }

    const activePatientId =
      rawActiveId && patients.some((p) => p.id === rawActiveId)
        ? rawActiveId
        : patients[0].id;

    cachedRawKey = combinedKey;
    cachedSnapshot = { patients, rounds, activePatientId };
    return cachedSnapshot;
  } catch {
    return DEFAULT_STORE_STATE;
  }
}

function subscribeWorkspace(callback: () => void) {
  listeners.add(callback);
  const onStorage = () => callback();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

function notifyListeners() {
  cachedRawKey = '';
  listeners.forEach((cb) => cb());
}

export function CareFlowWorkspace() {
  const { patients, rounds, activePatientId } = useSyncExternalStore(
    subscribeWorkspace,
    readStorageSnapshot,
    () => DEFAULT_STORE_STATE
  );

  // Active navigation tab (Default: 'beranda' matching Stitch Dashboard Utama Pasien)
  const [activeTab, setActiveTab] = useState<WorkspaceNavigationTab>('beranda');
  const [activeEhrTab, setActiveEhrTab] = useState<EhrTab>('vitals');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);
  const [isUtsMatrixModalOpen, setIsUtsMatrixModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('selfcare_sidebar_collapsed');
      if (saved === 'true') {
        setIsSidebarCollapsed(true);
      }
    } catch {}
  }, []);

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('selfcare_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Telehealth API state
  const [config, setConfig] = useState<TelehealthConfig>(DEFAULT_CONFIG);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [forms, setForms] = useState<FormMeta[]>([]);
  const [utsStatus, setUtsStatus] = useState<UTSStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Target assessment form to start
  const [startFormId, setStartFormId] = useState<string | null>(null);

  // Load config & initial data
  const loadInitialApiData = async () => {
    const cfg = getTelehealthConfig();
    setConfig(cfg);
    setLoading(true);
    try {
      const [pRes, fRes, uRes] = await Promise.all([
        fetchMe(cfg.nim).catch(() => null),
        fetchForms().catch(() => []),
        fetchStatusUTS(cfg.nim).catch(() => null),
      ]);
      if (pRes) setProfile(pRes);
      if (fRes) setForms(fRes);
      if (uRes) setUtsStatus(uRes);
    } catch {
      // Ignore background fetch error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialApiData();
  }, []);

  const persistPatients = (next: PatientCase[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.patients, JSON.stringify(next));
      notifyListeners();
    } catch {
      // Ignore quota errors
    }
  };

  const persistActiveId = (nextId: string) => {
    try {
      localStorage.setItem(STORAGE_KEYS.activeId, nextId);
      notifyListeners();
    } catch {
      // Ignore quota errors
    }
  };

  const activePatient =
    patients.find((p) => p.id === activePatientId) ?? patients[0];

  const handleUpdateConnection = (
    patientId: string,
    status: PatientCase['connectionStatus']
  ) => {
    const next = patients.map((p) =>
      p.id === patientId
        ? { ...p, connectionStatus: status, waitMinutes: status === 'connected' ? 0 : p.waitMinutes }
        : p
    );
    persistPatients(next);
  };

  const handleRefreshVitals = (patientId: string) => {
    const nowTime = new Date().toTimeString().slice(0, 8);
    const next = patients.map((p) => {
      if (p.id !== patientId) return p;
      const deltaHr = Math.round((Math.random() - 0.5) * 4);
      const deltaSys = Math.round((Math.random() - 0.5) * 4);
      const deltaSpo2 = p.vitals.spo2 < 94 ? 1 : 0;
      return {
        ...p,
        vitals: {
          ...p.vitals,
          heartRate: Math.max(52, Math.min(135, p.vitals.heartRate + deltaHr)),
          systolicBp: Math.max(96, Math.min(190, p.vitals.systolicBp + deltaSys)),
          spo2: Math.max(88, Math.min(100, p.vitals.spo2 + deltaSpo2)),
          updatedAt: nowTime,
        },
      };
    });
    persistPatients(next);
  };

  const handleSaveSoap = (patientId: string, soap: SoapNote) => {
    const next = patients.map((p) => (p.id === patientId ? { ...p, soap } : p));
    persistPatients(next);
  };

  const handleAddOrder = (patientId: string, order: PrescriptionOrder) => {
    const next = patients.map((p) =>
      p.id === patientId ? { ...p, orders: [order, ...p.orders] } : p
    );
    persistPatients(next);
  };

  const handleSendMessage = (patientId: string, text: string) => {
    const nowTime = new Date().toTimeString().slice(0, 5);
    const clinicianMsg = {
      id: `msg-${Date.now()}`,
      sender: 'Clinician' as const,
      senderName: activePatient.attendingPhysician.split(',')[0],
      text,
      timestamp: nowTime,
    };

    const next = patients.map((p) =>
      p.id === patientId ? { ...p, chat: [...p.chat, clinicianMsg] } : p
    );
    persistPatients(next);
  };

  const handleCreatePatient = (newPatient: PatientCase, admitImmediately: boolean) => {
    const next = [newPatient, ...patients];
    persistPatients(next);
    if (admitImmediately) {
      persistActiveId(newPatient.id);
      setActiveTab('consultation');
    } else {
      setActiveTab('queue');
    }
  };

  const handleOpenPatientInRoom = (patientId: string) => {
    const target = patients.find((p) => p.id === patientId);
    if (target && target.connectionStatus === 'pending') {
      handleUpdateConnection(patientId, 'connected');
    }
    persistActiveId(patientId);
    setActiveTab('consultation');
  };

  const handleSelectNextWaiting = () => {
    const nextCandidate =
      patients.find((p) => p.id !== activePatient.id && p.connectionStatus !== 'disconnected') ??
      patients.find((p) => p.id !== activePatient.id) ??
      patients[0];
    if (nextCandidate) {
      handleOpenPatientInRoom(nextCandidate.id);
    }
  };

  const handleStartAssessmentFromDashboard = (formId: string) => {
    setStartFormId(formId);
    setActiveTab('self-assessment');
  };

  const handleTabSelect = (tab: WorkspaceNavigationTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex">
      {/* ------------------------------------------------------------- */}
      {/* Left Sidebar (SelfCare ID Clinical OS) */}
      {/* ------------------------------------------------------------- */}
      <CareFlowSidebar
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        studentName={profile?.nama || config.nama || 'Citra Lestari Putri'}
        studentNim={config.nim || 'B2A021045'}
        studentClass={config.kelas || '4A-Informatika Medis'}
      />

      {/* ------------------------------------------------------------- */}
      {/* Main Workspace Frame (Responsive offset for sidebar) */}
      {/* ------------------------------------------------------------- */}
      <div className={`flex-1 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-72'} transition-all duration-300 ease-in-out flex flex-col min-w-0`}>
        {/* Top Header Bar */}
        <CareFlowTopHeader
          profile={profile}
          config={config}
          activeTab={activeTab}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebarCollapse}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenClarification={() => setActiveTab('klarifikasi')}
          onOpenSettings={() => setActiveTab('pengaturan')}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />

        {/* Content Body */}
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 max-w-[1440px] w-full mx-auto">
          {/* VIEW: Beranda (Exact Stitch Dashboard Utama Pasien) */}
          {activeTab === 'beranda' && (
            <motion.div
              key="beranda"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <DashboardUtamaPasien
                config={config}
                profile={profile}
                forms={forms}
                utsStatus={utsStatus}
                loading={loading}
                onRefresh={loadInitialApiData}
                onStartAssessment={handleStartAssessmentFromDashboard}
                onNavigateSubView={(sub) => {
                  if (sub === 'beranda') setActiveTab('beranda');
                  else if (sub === 'riwayat') setActiveTab('riwayat');
                  else if (sub === 'pengaturan') setActiveTab('pengaturan');
                  else setActiveTab('self-assessment');
                }}
                onOpenClarification={() => setActiveTab('klarifikasi')}
                onOpenUtsMatrix={() => setActiveTab('status-uts')}
              />
            </motion.div>
          )}

          {/* VIEW: Self-Assessment Module */}
          {activeTab === 'self-assessment' && (
            <motion.div
              key="self-assessment"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <SelfAssessmentView
                initialSubView={startFormId === 'FRM-GAD7' ? 'gad7' : 'mulai'}
                targetFormId={startFormId}
                onNavigateSubView={(sub) => {
                  if (sub === 'beranda') {
                    setStartFormId(null);
                    setActiveTab('beranda');
                  } else if (sub === 'riwayat') {
                    setActiveTab('riwayat');
                  } else if (sub === 'pengaturan') {
                    setActiveTab('pengaturan');
                  }
                }}
              />
            </motion.div>
          )}

          {/* VIEW: Status Penilaian UTS (Stitch Screen c339fbf5da0e4ebd94e915940fff1aeb) */}
          {activeTab === 'status-uts' && (
            <motion.div
              key="status-uts"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProgressTugasUtsMahasiswa
                config={config}
                profile={profile}
                utsStatus={utsStatus}
                onRefresh={loadInitialApiData}
                onStartNewAssessment={() => {
                  setStartFormId('FRM-KELUHAN');
                  setActiveTab('self-assessment');
                }}
              />
            </motion.div>
          )}

          {/* VIEW: Riwayat Laporan */}
          {activeTab === 'riwayat' && (
            <motion.div
              key="riwayat"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <SelfAssessmentView
                initialSubView="riwayat"
                onNavigateSubView={(sub) => {
                  if (sub === 'beranda') setActiveTab('beranda');
                  else if (sub === 'mulai') setActiveTab('self-assessment');
                  else if (sub === 'pengaturan') setActiveTab('pengaturan');
                }}
                onOpenClarificationModal={() => setActiveTab('klarifikasi')}
              />
            </motion.div>
          )}

          {/* VIEW: Klarifikasi Assessment (Stitch Screen 4eecd6f0985746b9aeaa31ab7358bc3c) */}
          {activeTab === 'klarifikasi' && (
            <motion.div
              key="klarifikasi"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <SelfAssessmentView
                initialSubView="klarifikasi"
                onNavigateSubView={(sub) => {
                  if (sub === 'beranda') setActiveTab('beranda');
                  else if (sub === 'riwayat') setActiveTab('riwayat');
                  else if (sub === 'mulai') setActiveTab('self-assessment');
                  else if (sub === 'pengaturan') setActiveTab('pengaturan');
                }}
              />
            </motion.div>
          )}

          {/* VIEW: Tindak Lanjut Assessment (Stitch Screen ce4ae322dd474c5ea0e6a55653248b23) */}
          {activeTab === 'tindak-lanjut' && (
            <motion.div
              key="tindak-lanjut"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <SelfAssessmentView
                initialSubView="tindak-lanjut"
                onNavigateSubView={(sub) => {
                  if (sub === 'beranda') setActiveTab('beranda');
                  else if (sub === 'riwayat') setActiveTab('riwayat');
                  else if (sub === 'mulai') setActiveTab('self-assessment');
                  else if (sub === 'pengaturan') setActiveTab('pengaturan');
                }}
              />
            </motion.div>
          )}

          {/* VIEW: Pengaturan Aplikasi */}
          {activeTab === 'pengaturan' && (
            <motion.div
              key="pengaturan"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <PengaturanAplikasiView
                onBack={() => setActiveTab('beranda')}
                onConfigUpdated={(cfg) => {
                  setConfig(cfg);
                  loadInitialApiData();
                }}
              />
            </motion.div>
          )}

          {/* VIEW: Ruang Konsultasi Dokter (Telehealth Console) */}
          {activeTab === 'consultation' && (
            <motion.div
              key="consultation"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Quick Patient Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2.5 shadow-xs">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs font-semibold text-[#64748B]">Ruangan:</span>
                  {patients.map((p) => {
                    const isSelected = p.id === activePatient.id;
                    const isCrit = evaluateVitalSeverity(p.vitals) === 'critical';
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleOpenPatientInRoom(p.id)}
                        className={`flex min-h-[34px] items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                          isSelected
                            ? 'bg-[#0F766E] text-[#FFFFFF]'
                            : 'border border-[#E2E8F0] bg-[#FFFFFF] text-[#334155] hover:border-[#0D9488] hover:bg-[#F0FDFA]'
                        }`}
                      >
                        <span>{p.name.split(' ')[0]}</span>
                        <span className="font-mono text-[10px] opacity-75">
                          ({p.roomCode.replace('RUANG-CF-', '')})
                        </span>
                        {isCrit && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('queue')}
                  className="text-xs font-semibold text-[#0F766E] hover:underline"
                >
                  Lihat Semua Antrean ({patients.length})
                </button>
              </div>

              {/* 12-Column Split: Console + EHR Panel */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
                <ConsultationConsole
                  key={`console-${activePatient.id}`}
                  patient={activePatient}
                  onUpdateConnection={handleUpdateConnection}
                  onRefreshVitals={handleRefreshVitals}
                  onOpenChatTab={() => setActiveEhrTab('chat')}
                  onSelectNextWaiting={handleSelectNextWaiting}
                />

                <EhrUtilityPanel
                  key={`ehr-${activePatient.id}`}
                  patient={activePatient}
                  activeTab={activeEhrTab}
                  onSelectTab={setActiveEhrTab}
                  onSaveSoap={handleSaveSoap}
                  onAddOrder={handleAddOrder}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </motion.div>
          )}

          {/* VIEW: Antrean Pasien */}
          {activeTab === 'queue' && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <PatientQueueView
                patients={patients}
                activePatientId={activePatient.id}
                onSelectPatient={handleOpenPatientInRoom}
                onOpenNewConsultation={() => setIsNewModalOpen(true)}
              />
            </motion.div>
          )}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Global Modals */}
      {/* ------------------------------------------------------------- */}
      <NewConsultationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreatePatient={handleCreatePatient}
      />

      <KlarifikasiModal
        isOpen={isClarificationModalOpen}
        onClose={() => setIsClarificationModalOpen(false)}
        assessmentId="SR-2024-089"
        onSuccess={loadInitialApiData}
      />

      <MatriksUtsModal
        isOpen={isUtsMatrixModalOpen}
        onClose={() => setIsUtsMatrixModalOpen(false)}
        utsStatus={utsStatus}
        nim={config.nim}
      />
    </div>
  );
}
