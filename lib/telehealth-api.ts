export interface Mahasiswa {
  nim: string;
  nama: string;
  kelas: string;
}

export interface PatientAccount {
  id: string;
  nama: string;
  keterangan: string;
  token: string;
}

export const PRESET_ACCOUNTS: PatientAccount[] = [
  {
    id: 'P-001',
    nama: 'Budi Santoso',
    keterangan: 'Pasien umum',
    token: 'tlh_pasien_e89c3a630df4c65d4d75856ab900959834fd49e2',
  },
  {
    id: 'P-002',
    nama: 'Siti Aminah',
    keterangan: 'Contoh pasien yang diisi pendamping',
    token: 'tlh_pasien_14e0b0ed213d717074a5503f07253004ae620661',
  },
  {
    id: 'P-003',
    nama: 'Andi Wijaya',
    keterangan: 'Pasien umum',
    token: 'tlh_pasien_18337a01caa11e8d627efc338033f82e139807df',
  },
];

export const DEFAULT_CONFIG = {
  apiBase:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://telehealth.informatikaunimus.site/api',
  token:
    process.env.NEXT_PUBLIC_DEFAULT_TOKEN ||
    PRESET_ACCOUNTS[0].token,
  nim: process.env.NEXT_PUBLIC_NIM || 'B2A021045',
  nama: process.env.NEXT_PUBLIC_NAMA || 'Citra Lestari Putri',
  kelas: process.env.NEXT_PUBLIC_KELAS || '4A-Informatika Medis',
  tanggalLahir: '2000-04-12',
  jenisKelamin: 'Perempuan',
};

const STORAGE_KEY = 'tlh_patient_config_v2';

export interface TelehealthConfig {
  apiBase: string;
  token: string;
  nim: string;
  nama: string;
  kelas: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
}

export function getTelehealthConfig(): TelehealthConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      apiBase: parsed.apiBase || DEFAULT_CONFIG.apiBase,
      token: parsed.token || DEFAULT_CONFIG.token,
      nim: parsed.nim || DEFAULT_CONFIG.nim,
      nama: parsed.nama || DEFAULT_CONFIG.nama,
      kelas: parsed.kelas || DEFAULT_CONFIG.kelas,
      tanggalLahir: parsed.tanggalLahir || DEFAULT_CONFIG.tanggalLahir,
      jenisKelamin: parsed.jenisKelamin || DEFAULT_CONFIG.jenisKelamin,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveTelehealthConfig(cfg: Partial<TelehealthConfig>): TelehealthConfig {
  const current = getTelehealthConfig();
  const next: TelehealthConfig = {
    ...current,
    ...cfg,
    nim: (cfg.nim ?? current.nim).trim().toUpperCase(),
    kelas: (cfg.kelas ?? current.kelas).trim(),
    tanggalLahir: cfg.tanggalLahir ?? current.tanggalLahir,
    jenisKelamin: cfg.jenisKelamin ?? current.jenisKelamin,
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('telehealth_config_changed'));
    } catch {
      // ignore
    }
  }
  return next;
}

export interface PatientProfile {
  id: string;
  role: string;
  nama: string;
  no_rm?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  statistik: {
    filter_nim: string;
    total: number;
    draf: number;
    menunggu: number;
    perlu_klarifikasi: number;
    sudah_ditinjau: number;
  };
}

export interface FormMeta {
  id: string;
  judul: string;
  deskripsi: string;
  jenis_hasil: 'ringkasan' | 'skor_instrumen';
  estimasi_menit: number;
  jumlah_pertanyaan: number;
  periode_pelaporan: string;
  instrumen?: {
    nama: string;
    singkatan: string;
    rentang_skor: string;
  };
}

export interface FormOption {
  value: string | number;
  label: string;
  exclusive?: boolean;
}

export interface FormQuestion {
  id: string;
  pertanyaan: string;
  type:
    | 'text'
    | 'textarea'
    | 'single_choice'
    | 'multi_choice'
    | 'scale'
    | 'number'
    | 'date';
  data_type?: 'subjektif' | 'pengukuran';
  required: boolean;
  pesan_wajib?: string;
  catatan?: string;
  placeholder?: string;
  max_length?: number;
  min?: number;
  max?: number | 'today';
  step?: number;
  satuan?: string;
  options?: FormOption[];
  show_if?: any;
}

export interface FormSection {
  id: string;
  judul: string;
  deskripsi?: string;
  show_if?: any;
  questions: FormQuestion[];
}

export interface FormDetail extends FormMeta {
  petunjuk: string[];
  persetujuan: {
    teks: string;
  };
  sections: FormSection[];
}

export interface ValidationSummaryItem {
  question_id: string;
  section_id?: string;
  label: string;
  pertanyaan: string;
  jawaban: any;
  jawaban_teks: string;
  terisi: boolean;
  wajib: boolean;
  data_type?: 'subjektif' | 'pengukuran';
  satuan?: string | null;
}

export interface ValidationResponse {
  valid: boolean;
  errors: Record<string, string>;
  kelengkapan: {
    status: string;
    label: string;
    persen: number;
    wajib_terisi: number;
    wajib_total: number;
    belum_diisi: string[];
    opsional_kosong: string[];
  };
  pertanyaan_tampil: string[];
  hasil_pratinjau: {
    ringkasan: ValidationSummaryItem[];
    skor?: {
      dapat_dihitung: boolean;
      total: number;
      kategori: {
        kode: string;
        label: string;
      };
    };
  };
}

export interface AssessmentItem {
  id: string;
  form: {
    id: string;
    judul: string;
    versi?: string;
  };
  judul: string;
  mahasiswa: Mahasiswa;
  status_pengiriman: {
    kode: 'draft' | 'terkirim';
    label: string;
  };
  status_peninjauan: {
    kode:
      | 'belum_dikirim'
      | 'menunggu_peninjauan'
      | 'sedang_ditinjau'
      | 'perlu_klarifikasi'
      | 'klarifikasi_dijawab'
      | 'sudah_ditinjau';
    label: string;
  };
  status_kelengkapan: 'lengkap' | 'belum_lengkap';
  klarifikasi_menunggu: number;
  ada_tindak_lanjut: boolean;
  dibuat_pada: string;
  diperbarui_pada?: string;
  dikirim_pada?: string;
  skor?: {
    total: number;
    kategori: string;
  };
}

export interface ClarificationItem {
  id: string;
  pertanyaan: string;
  question_id?: string;
  diminta_pada: string;
  status: 'menunggu_jawaban' | 'dijawab';
  jawaban?: string;
  dijawab_pada?: string;
}

export interface FollowUpItem {
  jenis: {
    kode:
      | 'jadwalkan_konsultasi'
      | 'pemantauan_mandiri'
      | 'rujuk_faskes'
      | 'kunjungan_langsung'
      | 'tidak_perlu';
    label: string;
  };
  arahan: string;
  jadwal_konsultasi?: string | null;
  dicatat_oleh?: {
    nama: string;
    role?: string;
  };
  dicatat_pada: string;
}

export interface AssessmentTimelineEvent {
  waktu: string;
  event: string;
  status_pengiriman: string;
  status_peninjauan: string;
  aktor: {
    id: string;
    nama: string;
    role: string;
  };
  keterangan: string;
}

export interface AssessmentDetail {
  id: string;
  judul?: string;
  mahasiswa: Mahasiswa;
  pasien: {
    id: string;
    role: string;
    nama: string;
    no_rm: string;
  };
  form: {
    id: string;
    judul: string;
    versi: string;
  };
  sumber_data: {
    jenis: string;
    nama_pengisi: string;
  };
  persetujuan: {
    disetujui: boolean;
    waktu: string;
  };
  status_pengiriman: {
    kode: 'draft' | 'terkirim';
    label: string;
  };
  status_peninjauan: {
    kode:
      | 'belum_dikirim'
      | 'menunggu_peninjauan'
      | 'sedang_ditinjau'
      | 'perlu_klarifikasi'
      | 'klarifikasi_dijawab'
      | 'sudah_ditinjau';
    label: string;
  };
  pesan_status?: string;
  answers: Record<string, any>;
  hasil?: {
    jenis: string;
    judul: string;
    ringkasan: ValidationSummaryItem[];
    kelengkapan: {
      status: string;
      label: string;
      persen: number;
      wajib_terisi: number;
      wajib_total: number;
      belum_diisi: string[];
      opsional_kosong: string[];
    };
    skor?: {
      instrumen: string;
      dapat_dihitung: boolean;
      total: number;
      maks: number;
      kategori: {
        kode: string;
        label: string;
        rentang: string;
      };
      keterangan: string;
      rincian?: Array<{
        question_id: string;
        label: string;
        nilai: number;
      }>;
      tabel_kategori: Array<{
        min: number;
        max: number;
        kode: string;
        label: string;
      }>;
    };
    keterbatasan: string;
    langkah_berikutnya: string;
  };
  perubahan?: {
    pembanding_id: string;
    pembanding_dikirim_pada: string;
    jumlah_perubahan: number;
    perubahan: Array<{
      label: string;
      sebelumnya: string;
      sekarang: string;
    }>;
    skor?: {
      sebelumnya: number;
      sekarang: number;
      selisih: number;
      kategori_sebelumnya: string;
      kategori_sekarang: string;
    };
  } | null;
  klarifikasi: ClarificationItem[];
  tindak_lanjut: FollowUpItem | null;
  peninjau?: {
    nama: string;
    role?: string;
  } | null;
  dibuat_pada: string;
  diperbarui_pada: string;
  dikirim_pada?: string;
  ditinjau_pada?: string | null;
  timeline: AssessmentTimelineEvent[];
}

export interface AssessmentStatusResponse {
  status_pengiriman: {
    kode: 'draft' | 'terkirim';
    label: string;
  };
  status_peninjauan: {
    kode:
      | 'belum_dikirim'
      | 'menunggu_peninjauan'
      | 'sedang_ditinjau'
      | 'perlu_klarifikasi'
      | 'klarifikasi_dijawab'
      | 'sudah_ditinjau';
    label: string;
  };
  pesan: string;
  dikirim_pada?: string;
  peninjau?: {
    nama: string;
  } | null;
  klarifikasi_menunggu: ClarificationItem[];
  tindak_lanjut: FollowUpItem | null;
  timeline: AssessmentTimelineEvent[];
}

export interface UTSStatusResponse {
  nim: string;
  nama: string;
  kelas: string;
  jumlah: {
    total: number;
    terkirim: number;
    draf: number;
    sudah_ditinjau: number;
  };
  bukti_fitur: {
    tercapai: number;
    total: number;
    daftar: Array<{
      kode: string;
      label: string;
      tercapai: boolean;
    }>;
  };
  penilaian: {
    status: {
      kode: string;
      label: string;
    };
    catatan: string | null;
    diperiksa_pada: string | null;
  };
}

export interface ApiError {
  status: number;
  success?: boolean;
  message: string;
  errors?: Record<string, string>;
}

export function getFriendlyErrorMessage(status: number, serverMsg?: string): string {
  const isGeneric =
    !serverMsg ||
    [
      'Bad Request',
      'Unauthorized',
      'Forbidden',
      'Not Found',
      'Conflict',
      'Unprocessable Entity',
      'Internal Server Error',
    ].includes(serverMsg.trim());

  switch (status) {
    case 400:
      return isGeneric
        ? 'Format data JSON atau permohonan tidak valid (HTTP 400). Mohon periksa kembali isian formulir Anda.'
        : serverMsg!;
    case 401:
      return isGeneric
        ? 'Token autentikasi tidak ditemukan atau tidak valid (HTTP 401). Silakan perbarui token pasien resmi di menu Pengaturan Aplikasi.'
        : serverMsg!;
    case 403:
      return isGeneric
        ? 'Akses tidak diizinkan (HTTP 403). Anda tidak memiliki hak akses untuk data ini.'
        : serverMsg!;
    case 404:
      return isGeneric
        ? 'Data atau berkas assessment tidak ditemukan di server (HTTP 404).'
        : serverMsg!;
    case 409:
      return isGeneric
        ? 'Aksi tidak sesuai status (HTTP 409). Formulir yang sudah berstatus terkirim tidak dapat diubah atau disubmit ulang.'
        : serverMsg!;
    case 422:
      return isGeneric
        ? 'Validasi gagal (HTTP 422). Terdapat pertanyaan wajib yang belum diisi atau format belum sesuai ketentuan.'
        : serverMsg!;
    case 0:
      return 'Tidak dapat terhubung ke server Telehealth API. Periksa koneksi internet Anda.';
    default:
      return serverMsg || `Terjadi kendala pada server (HTTP ${status}).`;
  }
}

export async function requestApi<T>(
  path: string,
  options: {
    method?: string;
    body?: any;
    token?: string;
    apiBase?: string;
  } = {}
): Promise<T> {
  const cfg = getTelehealthConfig();
  const apiBase = (options.apiBase || cfg.apiBase || DEFAULT_CONFIG.apiBase).replace(/\/$/, '');
  const token = options.token || cfg.token || DEFAULT_CONFIG.token;
  const method = options.method || 'GET';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${apiBase}${path}`, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (err: any) {
    throw {
      status: 0,
      message: 'Tidak dapat terhubung ke server Telehealth API. Periksa koneksi internet Anda.',
    } as ApiError;
  }

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw {
      status: res.status,
      message: `Format respons tidak valid (HTTP ${res.status}).`,
    } as ApiError;
  }

  if (!res.ok || json.success === false) {
    throw {
      status: res.status,
      success: false,
      message: getFriendlyErrorMessage(res.status, json?.message),
      errors: json.errors,
    } as ApiError;
  }

  return json.data as T;
}

// -------------------------------------------------------------
// Core API Calls
// -------------------------------------------------------------

export async function fetchApiInfo() {
  const cfg = getTelehealthConfig();
  const apiBase = cfg.apiBase.replace(/\/$/, '');
  const res = await fetch(apiBase);
  return res.json();
}

export async function fetchMe(nim?: string): Promise<PatientProfile> {
  const cfg = getTelehealthConfig();
  const targetNim = nim || cfg.nim;
  return requestApi<PatientProfile>(`/me?nim=${encodeURIComponent(targetNim)}`);
}

export async function fetchForms(): Promise<FormMeta[]> {
  return requestApi<FormMeta[]>('/forms');
}

export async function fetchFormDetail(formId: string): Promise<FormDetail> {
  return requestApi<FormDetail>(`/forms/${encodeURIComponent(formId)}`);
}

export async function validateFormAnswers(
  formId: string,
  answers: Record<string, any>,
  nim?: string
): Promise<ValidationResponse> {
  const cfg = getTelehealthConfig();
  const targetNim = nim || cfg.nim;
  return requestApi<ValidationResponse>(`/forms/${encodeURIComponent(formId)}/validate`, {
    method: 'POST',
    body: {
      nim: targetNim,
      answers,
    },
  });
}

export async function createAssessmentDraft(params: {
  form_id: string;
  persetujuan: boolean;
  mahasiswa?: Mahasiswa;
  answers?: Record<string, any>;
  kirim?: boolean;
}): Promise<AssessmentDetail> {
  const cfg = getTelehealthConfig();
  return requestApi<AssessmentDetail>('/assessments', {
    method: 'POST',
    body: {
      form_id: params.form_id,
      persetujuan: params.persetujuan,
      mahasiswa: params.mahasiswa || {
        nim: cfg.nim,
        nama: cfg.nama,
        kelas: cfg.kelas,
      },
      answers: params.answers || {},
      ...(params.kirim ? { kirim: true } : {}),
    },
  });
}

export async function fetchAssessments(params?: {
  nim?: string;
  status_peninjauan?: string;
  status_pengiriman?: string;
  form_id?: string;
  q?: string;
}): Promise<AssessmentItem[]> {
  const cfg = getTelehealthConfig();
  const targetNim = params?.nim || cfg.nim;
  const q = new URLSearchParams();
  q.set('nim', targetNim);
  if (params?.status_peninjauan) q.set('status_peninjauan', params.status_peninjauan);
  if (params?.status_pengiriman) q.set('status_pengiriman', params.status_pengiriman);
  if (params?.form_id) q.set('form_id', params.form_id);
  if (params?.q) q.set('q', params.q);

  return requestApi<AssessmentItem[]>(`/assessments?${q.toString()}`);
}

export async function fetchAssessmentDetail(id: string): Promise<AssessmentDetail> {
  return requestApi<AssessmentDetail>(`/assessments/${encodeURIComponent(id)}`);
}

export async function patchAssessmentAnswers(
  id: string,
  answers: Record<string, any>
): Promise<AssessmentDetail> {
  return requestApi<AssessmentDetail>(`/assessments/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { answers },
  });
}

export async function putAssessmentAnswers(
  id: string,
  answers: Record<string, any>
): Promise<AssessmentDetail> {
  return requestApi<AssessmentDetail>(`/assessments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: { answers },
  });
}

export async function deleteAssessmentDraft(id: string): Promise<{ success: boolean; message: string }> {
  return requestApi<{ success: boolean; message: string }>(
    `/assessments/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    }
  );
}

export async function submitAssessment(id: string): Promise<AssessmentDetail> {
  return requestApi<AssessmentDetail>(`/assessments/${encodeURIComponent(id)}/submit`, {
    method: 'POST',
  });
}

export async function fetchAssessmentHasil(id: string): Promise<AssessmentDetail['hasil']> {
  return requestApi<AssessmentDetail['hasil']>(
    `/assessments/${encodeURIComponent(id)}/hasil`
  );
}

export async function fetchAssessmentStatus(id: string): Promise<AssessmentStatusResponse> {
  return requestApi<AssessmentStatusResponse>(
    `/assessments/${encodeURIComponent(id)}/status`
  );
}

export async function replyClarification(
  assessmentId: string,
  clarificationId: string,
  jawaban: string
): Promise<any> {
  return requestApi<any>(
    `/assessments/${encodeURIComponent(assessmentId)}/clarifications/${encodeURIComponent(
      clarificationId
    )}/reply`,
    {
      method: 'POST',
      body: { jawaban },
    }
  );
}

export async function fetchStatusUTS(nim?: string): Promise<UTSStatusResponse> {
  const cfg = getTelehealthConfig();
  const targetNim = nim || cfg.nim;
  return requestApi<UTSStatusResponse>(`/uts/${encodeURIComponent(targetNim)}`);
}

// -------------------------------------------------------------
// Logic for Branching (show_if) & Visibility Matching API Spec
// -------------------------------------------------------------

export function isFilled(v: any): boolean {
  return (
    v !== undefined &&
    v !== null &&
    v !== '' &&
    !(Array.isArray(v) && v.length === 0)
  );
}

export function evalCondition(
  cond: any,
  answers: Record<string, any>,
  visibleMap: Record<string, boolean>
): boolean {
  if (!cond) return true;
  if (cond.any && Array.isArray(cond.any)) {
    return cond.any.some((c: any) => evalCondition(c, answers, visibleMap));
  }
  if (cond.all && Array.isArray(cond.all)) {
    return cond.all.every((c: any) => evalCondition(c, answers, visibleMap));
  }
  const qid = cond.question;
  const v = visibleMap[qid] ? answers[qid] : undefined;
  const filled = isFilled(v);

  if ('equals' in cond) return v === cond.equals;
  if ('in' in cond && Array.isArray(cond.in)) return cond.in.includes(v);
  if ('includes' in cond) {
    return Array.isArray(v) && v.includes(cond.includes);
  }
  if ('filled' in cond) {
    return filled === cond.filled;
  }
  return true;
}

export function calculateVisibilityMap(
  form: FormDetail,
  answers: Record<string, any>
): Record<string, boolean> {
  const vis: Record<string, boolean> = {};
  for (const s of form.sections) {
    for (const q of s.questions) {
      vis[q.id] =
        evalCondition(s.show_if, answers, vis) &&
        evalCondition(q.show_if, answers, vis);
    }
  }
  return vis;
}

export function getVisibleSections(
  form: FormDetail,
  answers: Record<string, any>
): FormSection[] {
  const vis = calculateVisibilityMap(form, answers);
  return form.sections.filter((s) => s.questions.some((q) => vis[q.id]));
}
