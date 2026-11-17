'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  Send,
  ShieldAlert,
} from 'lucide-react';
import {
  EhrTab,
  OrderFormInput,
  PatientCase,
  PrescriptionOrder,
  SoapNote,
  validateOrderForm,
  validateSoapNote,
} from '@/lib/clinical';
import { SeverityIndicator } from './StatusBadge';

interface EhrUtilityPanelProps {
  patient: PatientCase;
  activeTab: EhrTab;
  onSelectTab: (tab: EhrTab) => void;
  onSaveSoap: (patientId: string, soap: SoapNote) => void;
  onAddOrder: (patientId: string, order: PrescriptionOrder) => void;
  onSendMessage: (patientId: string, text: string) => void;
}

const EHR_TABS: { id: EhrTab; label: string }[] = [
  { id: 'vitals', label: 'Hasil Lab' },
  { id: 'soap', label: 'Catatan SOAP' },
  { id: 'orders', label: 'Resep & Obat' },
  { id: 'chat', label: 'Pesan' },
];

export function EhrUtilityPanel({
  patient,
  activeTab,
  onSelectTab,
  onSaveSoap,
  onAddOrder,
  onSendMessage,
}: EhrUtilityPanelProps) {
  const [soapDraft, setSoapDraft] = useState<SoapNote>(patient.soap);
  const [soapError, setSoapError] = useState<string | null>(null);
  const [soapSuccess, setSoapSuccess] = useState<string | null>(null);

  const [orderForm, setOrderForm] = useState<OrderFormInput>({
    medication: '',
    dosage: '',
    frequency: '1x sehari',
    route: 'Oral (Minum)',
  });
  const [orderErrors, setOrderErrors] = useState<
    Partial<Record<keyof OrderFormInput, string>>
  >({});

  const [chatInput, setChatInput] = useState('');

  const handleSoapSubmit = (signAndLock: boolean) => {
    const check = validateSoapNote(soapDraft);
    if (!check.valid) {
      setSoapError(check.error);
      setSoapSuccess(null);
      return;
    }
    const nowTime = new Date().toTimeString().slice(0, 5);
    const updated: SoapNote = {
      ...soapDraft,
      lastSavedAt: nowTime,
      signedBy: signAndLock ? patient.attendingPhysician : soapDraft.signedBy,
    };
    onSaveSoap(patient.id, updated);
    setSoapError(null);
    setSoapSuccess(
      signAndLock
        ? `Ditandatangani oleh ${patient.attendingPhysician} pukul ${nowTime}`
        : `Draf catatan disimpan pukul ${nowTime}`
    );
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateOrderForm(orderForm);
    if (!validation.valid) {
      setOrderErrors(validation.errors);
      return;
    }
    const nowTime = new Date().toTimeString().slice(0, 5);
    const newOrder: PrescriptionOrder = {
      id: `rx-${Date.now()}`,
      medication: orderForm.medication.trim(),
      dosage: orderForm.dosage.trim(),
      frequency: orderForm.frequency.trim(),
      route: orderForm.route.trim(),
      status: 'Active',
      orderedAt: nowTime,
    };
    onAddOrder(patient.id, newOrder);
    setOrderForm({
      medication: '',
      dosage: '',
      frequency: '1x sehari',
      route: 'Oral (Minum)',
    });
    setOrderErrors({});
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(patient.id, chatInput.trim());
    setChatInput('');
  };

  return (
    <aside
      aria-label="Electronic Health Record utility panel"
      className="lg:col-span-4 flex flex-col rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_1px_3px_0_rgba(15,23,42,0.04),0_1px_2px_-1px_rgba(15,23,42,0.02)]"
    >
      {/* Panel Header & Segmented Tabs */}
      <div className="border-b border-[#E2E8F0] px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-[#0F172A]">
            Rekam Medis Elektronik (RME)
          </h2>
          <span className="font-mono text-xs tabular-nums text-[#64748B]">
            Kunjungan {patient.scheduledTime}
          </span>
        </div>

        <div
          role="tablist"
          aria-label="EHR sections"
          className="mt-3 grid grid-cols-4 gap-1 rounded-lg bg-[#F1F5F9] p-1"
        >
          {EHR_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectTab(tab.id)}
                className={`min-h-[36px] rounded-md px-2 py-1.5 text-xs font-medium whitespace-nowrap truncate transition-colors ${
                  isSelected
                    ? 'bg-[#FFFFFF] text-[#0F766E] shadow-xs'
                    : 'text-[#334155] hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-5">
        {activeTab === 'vitals' && (
          <div className="space-y-5">
            {/* Allergies & Clinical Alert Line */}
            <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#991B1B]">
                <ShieldAlert className="h-4 w-4 shrink-0 text-[#EF4444]" aria-hidden="true" />
                <span>Alergi Pasien Tercatat</span>
              </div>
              <p className="mt-1 text-xs text-[#7F1D1D]">
                {patient.allergies.join(' · ')}
              </p>
            </div>

            {/* Attending & Encounter Metadata */}
            <div className="border-b border-[#E2E8F0] pb-4 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Dokter Penanggung Jawab</span>
                <span className="font-medium text-[#0F172A]">
                  {patient.attendingPhysician}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Unit Spesialisasi</span>
                <span className="font-medium text-[#0F172A]">{patient.department}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Resep Obat Aktif</span>
                <span className="font-mono font-medium tabular-nums text-[#0F172A]">
                  {patient.orders.length}
                </span>
              </div>
            </div>

            {/* Recent Diagnostic Labs Table */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-[#0F172A]">
                  Hasil Pemeriksaan Laboratorium
                </h3>
                <span className="text-xs text-[#64748B]">Nilai Rujukan</span>
              </div>

              <div className="divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
                {patient.labs.map((lab) => (
                  <div
                    key={lab.id}
                    className="flex items-center justify-between gap-3 py-2.5 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#0F172A]">{lab.name}</p>
                      <p className="text-[11px] text-[#64748B]">
                        Rujukan {lab.referenceRange} · {lab.collectedAt}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-semibold tabular-nums text-[#0F172A]">
                        {lab.value}{' '}
                        <span className="font-sans font-normal text-[#64748B]">
                          {lab.unit}
                        </span>
                      </p>
                      <SeverityIndicator severity={lab.flag} compact />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'soap' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>Dokumentasi Pemeriksaan Terstruktur</span>
              {patient.soap.lastSavedAt && (
                <span className="font-mono tabular-nums text-[#065F46]">
                  Tersimpan {patient.soap.lastSavedAt}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="soap-subjective"
                  className="mb-1 block text-xs font-semibold text-[#334155]"
                >
                  Subjektif (Keluhan & Riwayat Pasien)
                </label>
                <textarea
                  id="soap-subjective"
                  rows={3}
                  value={soapDraft.subjective}
                  onChange={(e) => {
                    setSoapDraft({ ...soapDraft, subjective: e.target.value });
                    setSoapError(null);
                  }}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-xs leading-relaxed text-[#0F172A] focus:border-[#0D9488] focus:outline-none focus:ring-3 focus:ring-[#0D9488]/12"
                />
              </div>

              <div>
                <label
                  htmlFor="soap-objective"
                  className="mb-1 block text-xs font-semibold text-[#334155]"
                >
                  Objektif (Pemeriksaan & Telemetri)
                </label>
                <textarea
                  id="soap-objective"
                  rows={2}
                  value={soapDraft.objective}
                  onChange={(e) => {
                    setSoapDraft({ ...soapDraft, objective: e.target.value });
                    setSoapError(null);
                  }}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-xs leading-relaxed text-[#0F172A] focus:border-[#0D9488] focus:outline-none focus:ring-3 focus:ring-[#0D9488]/12"
                />
              </div>

              <div>
                <label
                  htmlFor="soap-assessment"
                  className="mb-1 block text-xs font-semibold text-[#334155]"
                >
                  Asesmen (Evaluasi Klinis)
                </label>
                <textarea
                  id="soap-assessment"
                  rows={2}
                  value={soapDraft.assessment}
                  onChange={(e) => {
                    setSoapDraft({ ...soapDraft, assessment: e.target.value });
                    setSoapError(null);
                  }}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-xs leading-relaxed text-[#0F172A] focus:border-[#0D9488] focus:outline-none focus:ring-3 focus:ring-[#0D9488]/12"
                />
              </div>

              <div>
                <label
                  htmlFor="soap-plan"
                  className="mb-1 block text-xs font-semibold text-[#334155]"
                >
                  Rencana Tindakan (Plan)
                </label>
                <textarea
                  id="soap-plan"
                  rows={2}
                  value={soapDraft.plan}
                  onChange={(e) => {
                    setSoapDraft({ ...soapDraft, plan: e.target.value });
                    setSoapError(null);
                  }}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-xs leading-relaxed text-[#0F172A] focus:border-[#0D9488] focus:outline-none focus:ring-3 focus:ring-[#0D9488]/12"
                />
              </div>
            </div>

            {soapError && (
              <p className="flex items-center gap-1.5 text-xs text-[#EF4444]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{soapError}</span>
              </p>
            )}

            {soapSuccess && (
              <p
                data-testid="soap-saved-banner"
                className="flex items-center gap-1.5 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-2 text-xs font-medium text-[#065F46]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{soapSuccess}</span>
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSoapSubmit(false)}
                className="min-h-[40px] flex-1 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold text-[#0F172A] transition-colors hover:border-[#0D9488] hover:bg-[#F0FDFA]"
              >
                Simpan Catatan Medis
              </button>
              <button
                type="button"
                onClick={() => handleSoapSubmit(true)}
                className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0D9488] px-3 py-2 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#0F766E]"
              >
                <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tandatangani & Kunci</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-5">
            <div>
              <h3 className="mb-2.5 font-display text-sm font-semibold text-[#0F172A]">
                Daftar Resep Obat Aktif ({patient.orders.length})
              </h3>
              {patient.orders.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[#E2E8F0] px-4 py-6 text-center text-xs text-[#64748B]">
                  Belum ada resep obat untuk konsultasi ini.
                </p>
              ) : (
                <ul className="divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
                  {patient.orders.map((ord) => (
                    <li key={ord.id} className="py-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#0F172A]">
                          {ord.medication}
                        </span>
                        <span className="font-mono text-[11px] tabular-nums text-[#065F46]">
                          {ord.status === 'Active'
                            ? 'Aktif'
                            : ord.status === 'Pending Pharmacy'
                              ? 'Menunggu Apotek'
                              : 'Selesai'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[#334155]">
                        <span className="font-mono tabular-nums">{ord.dosage}</span> ·{' '}
                        {ord.frequency} · {ord.route}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form
              onSubmit={handleOrderSubmit}
              noValidate
              className="space-y-3 border-t border-[#E2E8F0] pt-4"
            >
              <h3 className="font-display text-sm font-semibold text-[#0F172A]">
                Tulis Resep / Tambah Obat
              </h3>

              <div>
                <label
                  htmlFor="order-medication"
                  className="mb-1 block text-xs font-medium text-[#334155]"
                >
                  Nama Obat
                </label>
                <input
                  id="order-medication"
                  type="text"
                  value={orderForm.medication}
                  onChange={(e) => {
                    setOrderForm({ ...orderForm, medication: e.target.value });
                    if (orderErrors.medication)
                      setOrderErrors({ ...orderErrors, medication: undefined });
                  }}
                  placeholder="mis. Furosemide"
                  className={`w-full rounded-lg border bg-[#FFFFFF] px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none ${
                    orderErrors.medication
                      ? 'border-[#EF4444] ring-3 ring-[#EF4444]/15'
                      : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-3 focus:ring-[#0D9488]/12'
                  }`}
                />
                {orderErrors.medication && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-[#EF4444]">
                    <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span>{orderErrors.medication}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="order-dosage"
                    className="mb-1 block text-xs font-medium text-[#334155]"
                  >
                    Dosis
                  </label>
                  <input
                    id="order-dosage"
                    type="text"
                    value={orderForm.dosage}
                    onChange={(e) => {
                      setOrderForm({ ...orderForm, dosage: e.target.value });
                      if (orderErrors.dosage)
                        setOrderErrors({ ...orderErrors, dosage: undefined });
                    }}
                    placeholder="mis. 20 mg"
                    className={`w-full rounded-lg border bg-[#FFFFFF] px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none ${
                      orderErrors.dosage
                        ? 'border-[#EF4444] ring-3 ring-[#EF4444]/15'
                        : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-3 focus:ring-[#0D9488]/12'
                    }`}
                  />
                  {orderErrors.dosage && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-[#EF4444]">
                      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>{orderErrors.dosage}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="order-frequency"
                    className="mb-1 block text-xs font-medium text-[#334155]"
                  >
                    Aturan Pakai
                  </label>
                  <input
                    id="order-frequency"
                    type="text"
                    value={orderForm.frequency}
                    onChange={(e) => {
                      setOrderForm({ ...orderForm, frequency: e.target.value });
                      if (orderErrors.frequency)
                        setOrderErrors({ ...orderErrors, frequency: undefined });
                    }}
                    placeholder="mis. 1x sehari"
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-xs text-[#0F172A] focus:border-[#0D9488] focus:outline-none focus:ring-3 focus:ring-[#0D9488]/12"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="order-route"
                  className="mb-1 block text-xs font-medium text-[#334155]"
                >
                  Rute Pemberian
                </label>
                <select
                  id="order-route"
                  value={orderForm.route}
                  onChange={(e) => setOrderForm({ ...orderForm, route: e.target.value })}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-xs text-[#0F172A] focus:border-[#0D9488] focus:outline-none focus:ring-3 focus:ring-[#0D9488]/12"
                >
                  <option value="Oral (Minum)">Oral (Minum)</option>
                  <option value="Inhalasi">Inhalasi</option>
                  <option value="Subkutan">Subkutan</option>
                  <option value="Topikal (Oles)">Topikal (Oles)</option>
                </select>
              </div>

              <button
                type="submit"
                className="min-h-[40px] w-full rounded-lg bg-[#0D9488] px-4 py-2 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#0F766E]"
              >
                Kirim Resep Obat
              </button>
            </form>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex h-[460px] flex-col justify-between">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {patient.chat.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[#E2E8F0] px-4 py-8 text-center text-xs text-[#64748B]">
                  Belum ada pesan dalam sesi ini. Kirim instruksi atau arahan melalui kolom di bawah.
                </p>
              ) : (
                patient.chat.map((msg) => {
                  const isClinician = msg.sender === 'Clinician';
                  return (
                    <div
                      key={msg.id}
                      className={`rounded-lg border px-3.5 py-2.5 text-xs ${
                        isClinician
                          ? 'ml-4 border-[#99EFE5] bg-[#F0FDFA]'
                          : 'mr-4 border-[#E2E8F0] bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#0F172A]">
                          {msg.senderName}
                        </span>
                        <span className="font-mono text-[11px] tabular-nums text-[#64748B]">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="leading-relaxed text-[#334155]">{msg.text}</p>
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={handleSendChat}
              className="mt-4 flex items-center gap-2 border-t border-[#E2E8F0] pt-3"
            >
              <label htmlFor="chat-message-input" className="sr-only">
                Ketik pesan untuk pasien
              </label>
              <input
                id="chat-message-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ketik pesan untuk pasien..."
                className="min-h-[40px] flex-1 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:border-[#0D9488] focus:outline-none focus:ring-3 focus:ring-[#0D9488]/12"
              />
              <button
                type="submit"
                aria-label="Kirim pesan"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#0D9488] px-3.5 py-2 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#0F766E]"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Kirim</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
