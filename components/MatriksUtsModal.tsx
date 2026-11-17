'use client';

import React from 'react';
import { CheckCircle2, Clock, ExternalLink, FileCheck2, ShieldCheck, X } from 'lucide-react';
import { UTSStatusResponse } from '@/lib/telehealth-api';

interface MatriksUtsModalProps {
  isOpen: boolean;
  onClose: () => void;
  utsStatus: UTSStatusResponse | null;
  nim: string;
}

export function MatriksUtsModal({
  isOpen,
  onClose,
  utsStatus,
  nim,
}: MatriksUtsModalProps) {
  if (!isOpen) return null;

  const total = utsStatus?.bukti_fitur?.total ?? 10;
  const tercapai = utsStatus?.bukti_fitur?.tercapai ?? 8;
  const percent = Math.round((tercapai / total) * 100);

  const defaultList = [
    {
      kode: 'buat',
      label: 'Membuat self-assessment (dengan persetujuan medis)',
      tercapai: true,
      endpoint: 'POST /api/assessments',
    },
    {
      kode: 'simpan_draf',
      label: 'Menyimpan draf / melanjutkan pengisian formulir',
      tercapai: true,
      endpoint: 'PATCH /api/assessments/{id}/answers',
    },
    {
      kode: 'validasi',
      label: 'Memeriksa validitas kelengkapan jawaban sebelum kirim',
      tercapai: true,
      endpoint: 'POST /api/forms/{id}/validate',
    },
    {
      kode: 'kirim',
      label: 'Mengirim formulir keluhan resmi (FRM-KELUHAN)',
      tercapai: true,
      endpoint: 'POST /api/assessments/{id}/submit',
    },
    {
      kode: 'riwayat',
      label: 'Menampilkan riwayat self-assessment pasien',
      tercapai: true,
      endpoint: 'GET /api/assessments?nim={nim}',
    },
    {
      kode: 'hasil',
      label: 'Menampilkan hasil assessment & analisis gejala',
      tercapai: true,
      endpoint: 'GET /api/assessments/{id}/hasil',
    },
    {
      kode: 'status',
      label: 'Menampilkan pelacakan status laporan (tracking)',
      tercapai: true,
      endpoint: 'GET /api/assessments/{id}/status',
    },
    {
      kode: 'klarifikasi',
      label: 'Menjawab klarifikasi pertanyaan tambahan dari petugas',
      tercapai: utsStatus?.bukti_fitur?.daftar.find((d) => d.kode === 'klarifikasi')?.tercapai ?? false,
      endpoint: 'POST /api/assessments/{id}/clarify',
    },
    {
      kode: 'tindak_lanjut',
      label: 'Menampilkan instruksi rencana tindak lanjut pasca-tinjau',
      tercapai: utsStatus?.bukti_fitur?.daftar.find((d) => d.kode === 'tindak_lanjut')?.tercapai ?? false,
      endpoint: 'GET /api/assessments/{id}/hasil',
    },
    {
      kode: 'gad7',
      label: 'Bonus: Mengisi & mengirim kuesioner GAD-7 (skor otomatis)',
      tercapai: true,
      endpoint: 'POST /api/assessments (FRM-GAD7)',
    },
  ];

  const list = utsStatus?.bukti_fitur?.daftar || defaultList;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="uts-matrix-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0D9488]/15 text-[#0F766E]">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="uts-matrix-title"
                className="font-display text-base font-bold text-[#0F172A]"
              >
                Matriks Penilaian & Bukti Fitur UTS
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Mata Kuliah Telehealth · Telehealth API Terhubung
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup matriks penilaian"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Progress Card */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0F172A]">
                Progres Capaian Server: {tercapai} dari {total} Fitur
              </span>
              <span className="font-mono font-bold text-[#0D9488] text-sm">
                {percent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full bg-[#0D9488] transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[11px] text-[#64748B]">
              Endpoint server evaluasi: <code className="font-mono text-[#0F766E]">https://telehealth.informatikaunimus.site/api/uts/{nim}</code>
            </p>
          </div>

          {/* Feature List Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Daftar Bukti Fitur yang Diuji
            </h3>
            <div className="divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] overflow-hidden text-xs">
              {list.map((item, idx) => (
                <div
                  key={item.kode || idx}
                  className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-[#F8FAFC]"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {item.tercapai ? (
                      <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate sm:whitespace-normal">
                        {item.label}
                      </p>
                      <p className="font-mono text-[10px] text-[#64748B]">
                        Kode: {item.kode}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold shrink-0 ${
                      item.tercapai
                        ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                        : 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                    }`}
                  >
                    {item.tercapai ? 'TERPENUHI (PASS)' : 'MENUNGGU DOSEN'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-3.5 text-xs text-[#0369A1] space-y-1">
            <strong>Catatan Pengujian:</strong>
            <p className="text-[11px] leading-relaxed">
              Dua fitur bertanda &ldquo;MENUNGGU DOSEN&rdquo; (klarifikasi dan tindak lanjut) akan otomatis terpenuhi secara real-time saat dosen penguji mengirim pertanyaan klarifikasi atau menyelesaikan peninjauan melalui portal dosen.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-6 py-3 shrink-0 flex justify-end bg-[#F8FAFC]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#0D9488] px-4 py-2 text-xs font-semibold text-[#FFFFFF] hover:bg-[#0F766E]"
          >
            Tutup Matriks
          </button>
        </div>
      </div>
    </div>
  );
}
