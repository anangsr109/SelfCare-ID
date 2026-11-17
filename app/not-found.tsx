import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 shadow-sm mb-4 text-2xl font-bold">
        +
      </div>
      <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="mt-2 text-base font-bold text-slate-700">Halaman Tidak Ditemukan</h2>
      <p className="mt-1 max-w-sm text-xs text-slate-500">
        Halaman atau rute yang Anda tuju tidak tersedia atau telah dipindahkan ke layanan SelfCare ID.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition-colors"
      >
        <span>&larr; Kembali ke Beranda Pasien</span>
      </Link>
    </div>
  );
}
