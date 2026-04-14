import { LucideIcon, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="rounded-3xl border-slate-200 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
          <Icon size={22} />
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <TrendingUp size={12} />
          Aktif
        </span>
      </CardHeader>

      <CardContent className="pt-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}