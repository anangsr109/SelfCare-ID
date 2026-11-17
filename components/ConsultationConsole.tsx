'use client';

import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  RefreshCw,
  UserCheck,
  Video,
  VideoOff,
  Volume2,
} from 'lucide-react';
import {
  formatDuration,
  getInitials,
  PatientCase,
} from '@/lib/clinical';
import { ConnectionBadge } from './StatusBadge';

interface ConsultationConsoleProps {
  patient: PatientCase;
  onUpdateConnection: (patientId: string, status: PatientCase['connectionStatus']) => void;
  onRefreshVitals: (patientId: string) => void;
  onOpenChatTab: () => void;
  onSelectNextWaiting: () => void;
}

export function ConsultationConsole({
  patient,
  onUpdateConnection,
  onRefreshVitals,
  onOpenChatTab,
  onSelectNextWaiting,
}: ConsultationConsoleProps) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(492);
  const sessionEnded = patient.connectionStatus === 'disconnected';

  useEffect(() => {
    if (patient.connectionStatus !== 'connected' || sessionEnded) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [patient.connectionStatus, sessionEnded]);

  const handleEndConsultation = () => {
    setIsScreenSharing(false);
    onUpdateConnection(patient.id, 'disconnected');
  };

  const handleRejoinOrAdmit = () => {
    onUpdateConnection(patient.id, 'connected');
  };

  const isConnected = patient.connectionStatus === 'connected' && !sessionEnded;

  return (
    <section
      aria-label="Clinical video and biometric console"
      className="lg:col-span-8 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_0_rgba(15,23,42,0.04),0_1px_2px_-1px_rgba(15,23,42,0.02)]"
    >
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-6 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-xl font-bold tracking-[-0.015em] text-[#0F172A]">
              {patient.name}
            </h1>
            <ConnectionBadge status={patient.connectionStatus} liveStream />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#64748B]">
            <span className="font-mono tabular-nums font-medium text-[#334155]">
              {patient.mrn}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {patient.age} tahun · {patient.sex === 'Female' ? 'Perempuan' : 'Laki-laki'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{patient.department}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{patient.roomCode}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-[11px] font-medium text-[#64748B]">
              Durasi Sesi
            </span>
            <span
              data-testid="session-timer"
              className="font-mono text-sm font-semibold tabular-nums text-[#0F172A]"
            >
              {formatDuration(elapsedSeconds)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onRefreshVitals(patient.id)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-xs font-medium text-[#0F172A] whitespace-nowrap transition-colors hover:border-[#0D9488] hover:bg-[#F0FDFA] hover:text-[#0F766E]"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sinkronkan Vital</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-4">
        {/* Video Consultation Frame */}
        <div
          data-testid="video-viewport"
          data-screen-sharing={isScreenSharing ? 'true' : 'false'}
          data-mic-on={isMicOn ? 'true' : 'false'}
          data-camera-on={isCameraOn ? 'true' : 'false'}
          className={`relative aspect-[16/10] sm:aspect-[16/9] max-h-[340px] w-full overflow-hidden rounded-xl bg-[#0F172A] transition-shadow ${
            isConnected
              ? 'shadow-[0_0_0_1px_#0D9488,0_0_0_4px_rgba(13,148,136,0.12)]'
              : 'border border-[#E2E8F0]'
          }`}
        >
          {/* Subtle Clinical Ambient Grid inside viewport */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 25%, rgba(13, 148, 136, 0.35), transparent 55%), radial-gradient(circle at 75% 75%, rgba(15, 118, 110, 0.25), transparent 50%)',
            }}
          />

          {/* Viewport Center State */}
          {isConnected ? (
            isScreenSharing ? (
              <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-12 pt-6 text-center text-[#FFFFFF]">
                <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#0D9488]/40 bg-[#0D9488]/20 text-[#6BD8CB] sm:h-12 sm:w-12">
                  <MonitorUp className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </div>
                <p className="font-display text-base font-semibold sm:text-lg">
                  Membagikan Rekam Medis & Tampilan Telemetri
                </p>
                <p className="mt-1 hidden max-w-md text-xs text-[#CBD5E1] sm:block sm:text-sm">
                  Pasien {patient.name} sedang melihat ringkasan catatan medis dan rencana pengobatan Anda.
                </p>
                <button
                  type="button"
                  onClick={() => setIsScreenSharing(false)}
                  className="mt-3 min-h-[36px] rounded-lg bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] transition-colors hover:bg-[#F0FDFA]"
                >
                  Kembali ke Kamera Pasien
                </button>
              </div>
            ) : (
              <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-12 pt-8 text-center sm:pt-6">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#0D9488]/50 bg-[#1E293B] text-base font-bold tracking-tight text-[#F0FDFA] sm:h-20 sm:w-20 sm:text-xl">
                  {getInitials(patient.name)}
                </div>
                <p className="mt-2.5 font-display text-base font-semibold text-[#FFFFFF] sm:mt-3 sm:text-lg">
                  {patient.name}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#CBD5E1] sm:text-xs">
                  <Volume2 className="h-3.5 w-3.5 text-[#6BD8CB]" aria-hidden="true" />
                  <span>Audio/Video Telehealth Terenkripsi Aktif</span>
                </p>
              </div>
            )
          ) : patient.connectionStatus === 'pending' && !sessionEnded ? (
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-12 pt-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#F59E0B]/40 bg-[#FFFBEB]/10 text-[#FDE68A] sm:h-14 sm:w-14">
                <UserCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="mt-3 font-display text-base font-semibold text-[#FFFFFF] sm:text-lg">
                Pasien Menunggu di Ruang Tunggu Triase
              </p>
              <p className="mt-1 max-w-md text-xs text-[#CBD5E1]">
                {patient.name} telah menunggu {patient.waitMinutes} menit dengan telemetri awal aktif.
              </p>
              <button
                type="button"
                onClick={handleRejoinOrAdmit}
                className="mt-3 min-h-[38px] rounded-lg bg-[#0D9488] px-4 py-2 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#0F766E] sm:text-sm"
              >
                Izinkan Pasien Masuk Ruangan
              </button>
            </div>
          ) : (
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-12 pt-6 text-center">
              <p className="font-display text-base font-semibold text-[#FFFFFF] sm:text-lg">
                Sesi Konsultasi Telah Selesai
              </p>
              <p className="mt-1 max-w-md text-xs text-[#CBD5E1]">
                Kanal video ditutup untuk {patient.name} ({patient.mrn}). Catatan SOAP dan
                resep obat tetap dapat diedit di panel kanan.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRejoinOrAdmit}
                  className="min-h-[38px] rounded-lg bg-[#0D9488] px-4 py-2 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#0F766E]"
                >
                  Hubungkan Kembali Sesi
                </button>
                <button
                  type="button"
                  onClick={onSelectNextWaiting}
                  className="min-h-[38px] rounded-lg border border-[#475569] bg-[#1E293B] px-4 py-2 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#334155]"
                >
                  Buka Pasien Berikutnya
                </button>
              </div>
            </div>
          )}

          {/* Measured bottom scrim & participant overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/45 to-transparent px-4 pb-3 pt-10 sm:px-5">
            <div className="min-w-0 text-left">
              <p className="truncate text-[11px] font-medium text-[#E2E8F0] sm:text-xs">
                Keluhan Utama: {patient.chiefComplaint}
              </p>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <p className="font-mono text-xs tabular-nums text-[#CBD5E1]">
                {isMicOn ? 'Mikrofon Aktif' : 'Mikrofon Dibisukan'} ·{' '}
                {isCameraOn ? 'Kamera Aktif' : 'Kamera Mati'}
              </p>
            </div>
          </div>

          {/* Clinician PiP Self-View */}
          <div className="absolute right-2.5 top-2.5 z-20 flex items-center gap-2 rounded-lg border border-[#334155] bg-[#1E293B]/95 px-2.5 py-1.5 shadow-sm sm:right-4 sm:top-4 sm:h-18 sm:w-28 sm:flex-col sm:justify-center sm:gap-1 sm:px-2 sm:text-center">
            {isCameraOn ? (
              <>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0D9488]/25 text-[10px] font-bold text-[#99EFE5] sm:h-7 sm:w-7 sm:text-xs">
                  AT
                </span>
                <span className="max-w-[90px] truncate text-[10px] font-medium text-[#E2E8F0] sm:max-w-full sm:text-[11px]">
                  {patient.attendingPhysician.split(',')[0]}
                </span>
              </>
            ) : (
              <>
                <VideoOff className="h-3.5 w-3.5 text-[#94A3B8] sm:h-4 sm:w-4" aria-hidden="true" />
                <span className="text-[10px] text-[#94A3B8] sm:text-[11px]">Kamera Mati</span>
              </>
            )}
          </div>
        </div>

        {/* Clinical Telehealth Console Deck */}
        <div className="flex justify-center">
          <div
            role="toolbar"
            aria-label="Telehealth consultation controls"
            className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 shadow-[0_10px_15px_-3px_rgba(15,23,42,0.08),0_4px_6px_-4px_rgba(15,23,42,0.04)]"
          >
            <button
              type="button"
              onClick={() => setIsMicOn((prev) => !prev)}
              aria-pressed={!isMicOn}
              aria-label={isMicOn ? 'Bisukan mikrofon' : 'Nyalakan mikrofon'}
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                isMicOn
                  ? 'bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0]'
                  : 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA]'
              }`}
            >
              {isMicOn ? (
                <Mic className="h-4 w-4" aria-hidden="true" />
              ) : (
                <MicOff className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{isMicOn ? 'Bisukan' : 'Aktifkan Mic'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCameraOn((prev) => !prev)}
              aria-pressed={!isCameraOn}
              aria-label={isCameraOn ? 'Matikan kamera' : 'Nyalakan kamera'}
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                isCameraOn
                  ? 'bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0]'
                  : 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA]'
              }`}
            >
              {isCameraOn ? (
                <Video className="h-4 w-4" aria-hidden="true" />
              ) : (
                <VideoOff className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{isCameraOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScreenSharing((prev) => !prev)}
              aria-pressed={isScreenSharing}
              aria-label={isScreenSharing ? 'Hentikan berbagi layar' : 'Bagikan layar'}
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                isScreenSharing
                  ? 'bg-[#F0FDFA] text-[#0F766E] ring-1 ring-[#0D9488]'
                  : 'bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0]'
              }`}
            >
              <MonitorUp className="h-4 w-4" aria-hidden="true" />
              <span>{isScreenSharing ? 'Berbagi Layar' : 'Bagikan Layar'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenChatTab}
              aria-label="Buka pesan percakapan pasien"
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#F1F5F9] px-3.5 py-2 text-xs font-semibold text-[#0F172A] whitespace-nowrap transition-colors hover:bg-[#E2E8F0]"
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              <span>Pesan ({patient.chat.length})</span>
            </button>

            <div className="mx-1 hidden h-6 w-px bg-[#E2E8F0] sm:block" aria-hidden="true" />

            <button
              type="button"
              onClick={handleEndConsultation}
              disabled={!isConnected}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2 text-xs font-semibold text-[#FFFFFF] whitespace-nowrap transition-colors hover:bg-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#EF4444]/30"
            >
              <PhoneOff className="h-4 w-4" aria-hidden="true" />
              <span>Akhiri Konsultasi</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
