import { LucideIcon, TrendingUp } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
          <Icon size={22} />
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <TrendingUp size={12} />
          Aktif
        </span>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}