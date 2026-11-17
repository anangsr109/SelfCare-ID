export type ConnectionStatus = 'connected' | 'pending' | 'disconnected';
export type TriageSeverity = 'nominal' | 'warning' | 'critical';
export type ClinicalWorkspaceView = 'assessment' | 'consultation' | 'queue';
export type EhrTab = 'vitals' | 'soap' | 'orders' | 'chat';

export interface VitalSigns {
  heartRate: number; // bpm
  systolicBp: number; // mmHg
  diastolicBp: number; // mmHg
  spo2: number; // %
  respiratoryRate: number; // breaths/min
  temperatureC: number; // Celsius
  updatedAt: string;
}

export interface LabMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: TriageSeverity;
  collectedAt: string;
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  lastSavedAt: string | null;
  signedBy: string | null;
}

export interface PrescriptionOrder {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  route: string;
  status: 'Active' | 'Pending Pharmacy' | 'Completed';
  orderedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'Clinician' | 'Patient';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface PatientCase {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: 'Female' | 'Male';
  department: string;
  chiefComplaint: string;
  attendingPhysician: string;
  scheduledTime: string;
  roomCode: string;
  connectionStatus: ConnectionStatus;
  waitMinutes: number;
  allergies: string[];
  vitals: VitalSigns;
  labs: LabMetric[];
  soap: SoapNote;
  orders: PrescriptionOrder[];
  chat: ChatMessage[];
}

export interface AcademicRoundItem {
  id: string;
  timeSlot: string;
  title: string;
  presenter: string;
  caseId: string;
  patientName: string;
  focusMetric: string;
  status: 'In Progress' | 'Scheduled' | 'Reviewed';
}

export interface ConsultationFormInput {
  name: string;
  age: string;
  sex: 'Female' | 'Male';
  department: string;
  chiefComplaint: string;
  attendingPhysician: string;
}

export interface OrderFormInput {
  medication: string;
  dosage: string;
  frequency: string;
  route: string;
}

export interface ValidationResult<T> {
  valid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export function evaluateVitalSeverity(vitals: VitalSigns): TriageSeverity {
  if (
    vitals.spo2 < 92 ||
    vitals.heartRate > 120 ||
    vitals.heartRate < 45 ||
    vitals.systolicBp >= 180 ||
    vitals.systolicBp < 90 ||
    vitals.temperatureC >= 39.0
  ) {
    return 'critical';
  }

  if (
    vitals.spo2 < 95 ||
    vitals.heartRate > 100 ||
    vitals.heartRate < 55 ||
    vitals.systolicBp >= 140 ||
    vitals.diastolicBp >= 90 ||
    vitals.temperatureC >= 37.8
  ) {
    return 'warning';
  }

  return 'nominal';
}

export function getSingleVitalFlag(
  metric: 'heartRate' | 'bp' | 'spo2' | 'respiratoryRate' | 'temperatureC',
  vitals: VitalSigns
): TriageSeverity {
  switch (metric) {
    case 'heartRate':
      if (vitals.heartRate > 120 || vitals.heartRate < 45) return 'critical';
      if (vitals.heartRate > 100 || vitals.heartRate < 55) return 'warning';
      return 'nominal';
    case 'bp':
      if (vitals.systolicBp >= 180 || vitals.systolicBp < 90) return 'critical';
      if (vitals.systolicBp >= 140 || vitals.diastolicBp >= 90) return 'warning';
      return 'nominal';
    case 'spo2':
      if (vitals.spo2 < 92) return 'critical';
      if (vitals.spo2 < 95) return 'warning';
      return 'nominal';
    case 'respiratoryRate':
      if (vitals.respiratoryRate > 24 || vitals.respiratoryRate < 10) return 'critical';
      if (vitals.respiratoryRate > 20 || vitals.respiratoryRate < 12) return 'warning';
      return 'nominal';
    case 'temperatureC':
      if (vitals.temperatureC >= 39.0 || vitals.temperatureC < 35.5) return 'critical';
      if (vitals.temperatureC >= 37.8) return 'warning';
      return 'nominal';
  }
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function filterPatientQueue(
  patients: PatientCase[],
  query: string,
  statusFilter: 'all' | ConnectionStatus | 'critical'
): PatientCase[] {
  const normalizedQuery = query.trim().toLowerCase();

  return patients.filter((patient) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'critical'
          ? evaluateVitalSeverity(patient.vitals) === 'critical'
          : patient.connectionStatus === statusFilter;

    if (!matchesStatus) return false;
    if (!normalizedQuery) return true;

    return (
      patient.name.toLowerCase().includes(normalizedQuery) ||
      patient.mrn.toLowerCase().includes(normalizedQuery) ||
      patient.chiefComplaint.toLowerCase().includes(normalizedQuery) ||
      patient.department.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function validateConsultationForm(
  input: ConsultationFormInput
): ValidationResult<ConsultationFormInput> {
  const errors: Partial<Record<keyof ConsultationFormInput, string>> = {};

  if (!input.name.trim() || input.name.trim().length < 2) {
    errors.name = 'Nama lengkap pasien wajib diisi (minimal 2 karakter).';
  }

  const parsedAge = Number(input.age);
  if (!input.age.trim() || Number.isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120) {
    errors.age = 'Masukkan usia pasien yang valid antara 0 hingga 120 tahun.';
  }

  if (!input.department.trim()) {
    errors.department = 'Pilih departemen spesialisasi medis.';
  }

  if (!input.chiefComplaint.trim() || input.chiefComplaint.trim().length < 5) {
    errors.chiefComplaint = 'Masukkan keluhan utama pasien (minimal 5 karakter).';
  }

  if (!input.attendingPhysician.trim()) {
    errors.attendingPhysician = 'Nama dokter penanggung jawab wajib diisi.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateOrderForm(
  input: OrderFormInput
): ValidationResult<OrderFormInput> {
  const errors: Partial<Record<keyof OrderFormInput, string>> = {};

  if (!input.medication.trim()) {
    errors.medication = 'Nama obat wajib diisi.';
  }
  if (!input.dosage.trim()) {
    errors.dosage = 'Tentukan dosis dan satuan obat (mis. 20 mg).';
  }
  if (!input.frequency.trim()) {
    errors.frequency = 'Tentukan frekuensi aturan pakai.';
  }
  if (!input.route.trim()) {
    errors.route = 'Pilih rute pemberian obat.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSoapNote(soap: Pick<SoapNote, 'subjective' | 'assessment' | 'plan'>): {
  valid: boolean;
  error: string | null;
} {
  if (!soap.subjective.trim() && !soap.assessment.trim() && !soap.plan.trim()) {
    return {
      valid: false,
      error: 'Isi minimal satu catatan pada Subjektif, Asesmen, atau Rencana sebelum menyimpan.',
    };
  }
  return { valid: true, error: null };
}

export function getInitials(name: string): string {
  const parts = name
    .replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '')
    .trim()
    .split(/\s+/);
  if (parts.length === 0) return 'PT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
