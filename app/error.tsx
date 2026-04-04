"use client";

export default function Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Terjadi Kesalahan
        </p>
        <h2 className="mt-3 text-2xl font-bold text-slate-900">
          Halaman gagal dimuat
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Coba muat ulang halaman. Jika masalah masih muncul, periksa kembali
          kode atau server development.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}