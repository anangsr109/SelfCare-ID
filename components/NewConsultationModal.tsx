'use client';

import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import {
  ConsultationFormInput,
  PatientCase,
  validateConsultationForm,
} from '@/lib/clinical';

interface NewConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePatient: (newPatient: PatientCase, admitImmediately: boolean) => void;
}

const DEPARTMENTS = [
  'Kardiologi',
  'Pulmonologi',
  'Endokrinologi',
  'Nefrologi',
  'Penyakit Dalam',
  'Neurologi',
];

export function NewConsultationModal({
  isOpen,
  onClose,
  onCreatePatient,
}: NewConsultationModalProps) {
  const [form, setForm] = useState<ConsultationFormInput>({
    name: '',
    age: '',
    sex: 'Female',
    department: 'Kardiologi',
    chiefComplaint: '',
    attendingPhysician: 'dr. Aris Thorne, Sp.JP',
  });
  const [admitNow, setAdmitNow] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof ConsultationFormInput, string>>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateConsultationForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const randomCode = Math.floor(10000 + Math.random() * 89999);
    const roomNum = Math.floor(412 + Math.random() * 80);
    const now = new Date();
    const hhmm = now.toTimeString().slice(0, 5);
    const hhmmss = now.toTimeString().slice(0, 8);

    const patient: PatientCase = {
      id: `pt-${randomCode}`,
      mrn: `RM-${randomCode}`,
      name: form.name.trim(),
      age: Number(form.age),
      sex: form.sex,
      department: form.department,
      chiefComplaint: form.chiefComplaint.trim(),
      attendingPhysician: form.attendingPhysician.trim(),
      scheduledTime: hhmm,
      roomCode: `RUANG-CF-${roomNum}`,
      connectionStatus: admitNow ? 'connected' : 'pending',
      waitMinutes: admitNow ? 0 : 1,
      allergies: ['Tidak Ada Alergi Obat yang Diketahui'],
      vitals: {
        heartRate: 78,
        systolicBp: 122,
        diastolicBp: 78,
        spo2: 98,
        respiratoryRate: 16,
        temperatureC: 36.7,
        updatedAt: hhmmss,
      },
      labs: [
        {
          id: `lab-${randomCode}-1`,
          name: 'Panel Metabolik Dasar',
          value: 'Menunggu',
          unit: '—',
          referenceRange: 'Dipesan',
          flag: 'nominal',
          collectedAt: `Hari ini ${hhmm}`,
        },
      ],
      soap: {
        subjective: '',
        objective: 'Pendaftaran awal telehealth dilakukan.',
        assessment: '',
        plan: '',
        lastSavedAt: null,
        signedBy: null,
      },
      orders: [],
      chat: [
        {
          id: `msg-${randomCode}-1`,
          sender: 'Clinician',
          senderName: form.attendingPhysician.trim(),
          text: `Selamat datang ${form.name.trim()}. Ruang konsultasi virtual Anda RUANG-CF-${roomNum} telah dibuka.`,
          timestamp: hhmm,
        },
      ],
    };

    onCreatePatient(patient, admitNow);
    setForm({
      name: '',
      age: '',
      sex: 'Female',
      department: 'Kardiologi',
      chiefComplaint: '',
      attendingPhysician: 'dr. Aris Thorne, Sp.JP',
    });
    setErrors({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-consultation-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 p-4 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-lg rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_10px_15px_-3px_rgba(15,23,42,0.08),0_4px_6px_-4px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div>
            <h2
              id="new-consultation-title"
              className="font-display text-lg font-semibold tracking-[-0.01em] text-[#0F172A]"
            >
              Pendaftaran Konsultasi Telehealth
            </h2>
            <p className="text-xs text-[#64748B]">
              Buka ruangan konsultasi virtual dan inisialisasi sesi klinis pasien.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal konsultasi baru"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 px-6 py-5">
          <div>
            <label
              htmlFor="patient-name-input"
              className="mb-1.5 block text-[13px] font-medium text-[#334155]"
            >
              Nama Lengkap Pasien
            </label>
            <input
              id="patient-name-input"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="mis. Clara Hendriks"
              className={`w-full rounded-lg border bg-[#FFFFFF] px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none ${
                errors.name
                  ? 'border-[#EF4444] ring-3 ring-[#EF4444]/15'
                  : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-3 focus:ring-[#0D9488]/12'
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#EF4444]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="patient-age-input"
                className="mb-1.5 block text-[13px] font-medium text-[#334155]"
              >
                Usia (tahun)
              </label>
              <input
                id="patient-age-input"
                type="number"
                min={0}
                max={120}
                value={form.age}
                onChange={(e) => {
                  setForm({ ...form, age: e.target.value });
                  if (errors.age) setErrors({ ...errors, age: undefined });
                }}
                placeholder="44"
                className={`w-full rounded-lg border bg-[#FFFFFF] px-3 py-2 text-sm tabular-nums text-[#0F172A] placeholder:text-[#64748B] focus:outline-none ${
                  errors.age
                    ? 'border-[#EF4444] ring-3 ring-[#EF4444]/15'
                    : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-3 focus:ring-[#0D9488]/12'
                }`}
              />
              {errors.age && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-[#EF4444]">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.age}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="patient-sex-select"
                className="mb-1.5 block text-[13px] font-medium text-[#334155]"
              >
                Jenis Kelamin
              </label>
              <select
                id="patient-sex-select"
                value={form.sex}
                onChange={(e) =>
                  setForm({ ...form, sex: e.target.value as 'Female' | 'Male' })
                }
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-sm text-[#0F172A] focus:border-[#0D9488] focus:outline-none focus:ring-3 focus:ring-[#0D9488]/12"
              >
                <option value="Female">Perempuan</option>
                <option value="Male">Laki-laki</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="patient-dept-select"
                className="mb-1.5 block text-[13px] font-medium text-[#334155]"
              >
                Spesialisasi
              </label>
              <select
                id="patient-dept-select"
                value={form.department}
                onChange={(e) => {
                  setForm({ ...form, department: e.target.value });
                  if (errors.department) setErrors({ ...errors, department: undefined });
                }}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-sm text-[#0F172A] focus:border-[#0D9488] focus:outline-none focus:ring-3 focus:ring-[#0D9488]/12"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="patient-complaint-input"
              className="mb-1.5 block text-[13px] font-medium text-[#334155]"
            >
              Keluhan Utama & Alasan Triase
            </label>
            <textarea
              id="patient-complaint-input"
              rows={2}
              value={form.chiefComplaint}
              onChange={(e) => {
                setForm({ ...form, chiefComplaint: e.target.value });
                if (errors.chiefComplaint)
                  setErrors({ ...errors, chiefComplaint: undefined });
              }}
              placeholder="mis. Pemeriksaan tekanan darah dan dada sesak pasca rawat inap"
              className={`w-full rounded-lg border bg-[#FFFFFF] px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none ${
                errors.chiefComplaint
                  ? 'border-[#EF4444] ring-3 ring-[#EF4444]/15'
                  : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-3 focus:ring-[#0D9488]/12'
              }`}
            />
            {errors.chiefComplaint && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#EF4444]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.chiefComplaint}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="attending-physician-input"
              className="mb-1.5 block text-[13px] font-medium text-[#334155]"
            >
              Dokter Penanggung Jawab
            </label>
            <input
              id="attending-physician-input"
              type="text"
              value={form.attendingPhysician}
              onChange={(e) => {
                setForm({ ...form, attendingPhysician: e.target.value });
                if (errors.attendingPhysician)
                  setErrors({ ...errors, attendingPhysician: undefined });
              }}
              className={`w-full rounded-lg border bg-[#FFFFFF] px-3 py-2 text-sm text-[#0F172A] focus:outline-none ${
                errors.attendingPhysician
                  ? 'border-[#EF4444] ring-3 ring-[#EF4444]/15'
                  : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-3 focus:ring-[#0D9488]/12'
              }`}
            />
            {errors.attendingPhysician && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#EF4444]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.attendingPhysician}</span>
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-sm text-[#334155]">
            <input
              type="checkbox"
              checked={admitNow}
              onChange={(e) => setAdmitNow(e.target.checked)}
              className="h-[18px] w-[18px] rounded border-[#CBD5E1] accent-[#0D9488] focus-visible:ring-3 focus-visible:ring-[#0D9488]/15"
            />
            <span>Langsung buka Ruang Konsultasi setelah pendaftaran</span>
          </label>

          <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-sm font-medium text-[#0F172A] transition-colors hover:border-[#0D9488] hover:bg-[#F0FDFA]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="min-h-[40px] rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-semibold text-[#FFFFFF] transition-colors hover:bg-[#0F766E]"
            >
              Buat Konsultasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
