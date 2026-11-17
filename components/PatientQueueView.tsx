'use client';

import React, { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import {
  ConnectionStatus,
  evaluateVitalSeverity,
  filterPatientQueue,
  PatientCase,
} from '@/lib/clinical';
import { ConnectionBadge, SeverityIndicator } from './StatusBadge';

interface PatientQueueViewProps {
  patients: PatientCase[];
  activePatientId: string;
  onSelectPatient: (patientId: string) => void;
  onOpenNewConsultation: () => void;
}

type QueueFilter = 'all' | ConnectionStatus | 'critical';

export function PatientQueueView({
  patients,
  activePatientId,
  onSelectPatient,
  onOpenNewConsultation,
}: PatientQueueViewProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<QueueFilter>('all');

  const filtered = filterPatientQueue(patients, query, statusFilter);

  const filterButtons: { id: QueueFilter; label: string }[] = [
    { id: 'all', label: `Semua (${patients.length})` },
    {
      id: 'connected',
      label: `Terhubung (${patients.filter((p) => p.connectionStatus === 'connected').length})`,
    },
    {
      id: 'pending',
      label: `Menunggu (${patients.filter((p) => p.connectionStatus === 'pending').length})`,
    },
    {
      id: 'critical',
      label: `Tanda Vital Kritis (${
        patients.filter((p) => evaluateVitalSeverity(p.vitals) === 'critical').length
      })`,
    },
  ];

  return (
    <section
      aria-label="Telehealth patient queue"
      className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_0_rgba(15,23,42,0.04),0_1px_2px_-1px_rgba(15,23,42,0.02)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-6 py-5">
        <div>
          <h1 className="font-display text-xl font-bold tracking-[-0.015em] text-[#0F172A]">
            Antrean Telehealth Aktif
          </h1>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Daftar konsultasi virtual terprioritas dengan status triase telemetri langsung.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <label htmlFor="queue-search-input" className="sr-only">
              Cari pasien berdasarkan nama, No. RM, atau keluhan
            </label>
            <input
              id="queue-search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau No. RM..."
              className="min-h-[40px] w-full sm:w-64 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] pl-9 pr-3 text-sm text-[#0F172A] placeholder:text-[#64748B] focus:border-[#0D9488] focus:outline-none focus:ring-3 focus:ring-[#0D9488]/12"
            />
          </div>

          <div
            role="group"
            aria-label="Filter queue by status"
            className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F1F5F9] p-1"
          >
            {filterButtons.map((btn) => {
              const active = statusFilter === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setStatusFilter(btn.id)}
                  aria-pressed={active}
                  className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#FFFFFF] text-[#0F766E] shadow-xs'
                      : 'text-[#334155] hover:text-[#0F172A]'
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="font-display text-base font-semibold text-[#0F172A]">
            Tidak ada data pasien yang sesuai
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            Sesuaikan filter pencarian atau daftarkan pasien baru ke klinik virtual.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setStatusFilter('all');
              }}
              className="min-h-[40px] rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold text-[#0F172A] hover:border-[#0D9488] hover:bg-[#F0FDFA]"
            >
              Reset Filter
            </button>
            <button
              type="button"
              onClick={onOpenNewConsultation}
              className="min-h-[40px] rounded-lg bg-[#0D9488] px-4 py-2 text-xs font-semibold text-[#FFFFFF] hover:bg-[#0F766E]"
            >
              Konsultasi Baru
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#64748B]">
                <th className="px-6 py-3">Pasien & No. RM</th>
                <th className="px-4 py-3">Spesialisasi & Keluhan</th>
                <th className="px-4 py-3 text-right">Detak Jantung / Tekanan Darah / SpO2</th>
                <th className="px-4 py-3">Status Triase</th>
                <th className="px-4 py-3">Koneksi Telemetri</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((pt) => {
                const severity = evaluateVitalSeverity(pt.vitals);
                const isCurrent = pt.id === activePatientId;
                return (
                  <tr
                    key={pt.id}
                    className={`transition-colors hover:bg-[#F8FAFC] ${
                      isCurrent ? 'bg-[#F0FDFA]/60' : ''
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-[#0F172A]">{pt.name}</p>
                      <p className="font-mono text-xs tabular-nums text-[#64748B]">
                        {pt.mrn} · {pt.age} th ({pt.sex === 'Female' ? 'P' : 'L'}) · {pt.scheduledTime}
                      </p>
                    </td>
                    <td className="max-w-xs px-4 py-3.5">
                      <p className="text-xs font-semibold text-[#334155]">
                        {pt.department}
                      </p>
                      <p className="truncate text-xs text-[#64748B]">
                        {pt.chiefComplaint}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs tabular-nums text-[#0F172A]">
                      {pt.vitals.heartRate} bpm · {pt.vitals.systolicBp}/
                      {pt.vitals.diastolicBp} · {pt.vitals.spo2}%
                    </td>
                    <td className="px-4 py-3.5">
                      <SeverityIndicator severity={severity} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ConnectionBadge status={pt.connectionStatus} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectPatient(pt.id)}
                        className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                          isCurrent
                            ? 'bg-[#0F766E] text-[#FFFFFF]'
                            : 'border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] hover:border-[#0D9488] hover:bg-[#F0FDFA] hover:text-[#0F766E]'
                        }`}
                      >
                        <span>
                          {isCurrent
                            ? 'Sedang Konsultasi'
                            : pt.connectionStatus === 'pending'
                              ? 'Terima ke Ruangan'
                              : 'Buka Ruangan'}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
