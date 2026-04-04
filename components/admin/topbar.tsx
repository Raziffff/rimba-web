import { Bell, Search } from "lucide-react";

export default function AdminTopbar() {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
          Admin Panel
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Dashboard RIMBA
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 lg:flex">
          <Search size={16} className="text-slate-400" />
          <span className="text-sm text-slate-400">Cari menu atau data...</span>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
        >
          <Bell size={18} />
        </button>
      </div>
    </div>
  );
}