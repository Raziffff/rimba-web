import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Maaf, halaman yang Anda cari belum tersedia atau alamatnya salah.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}