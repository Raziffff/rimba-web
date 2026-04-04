import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from "lucide-react";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
}

export default function SummaryCards({ totalIncome, totalExpense }: SummaryCardsProps) {
  const balance = totalIncome - totalExpense;

  const cards = [
    {
      title: "Total Pemasukan",
      value: totalIncome,
      icon: TrendingUp,
      color: "bg-green-50 text-green-700",
      iconBg: "bg-green-100",
    },
    {
      title: "Total Pengeluaran",
      value: totalExpense,
      icon: TrendingDown,
      color: "bg-red-50 text-red-700",
      iconBg: "bg-red-100",
    },
    {
      title: "Saldo Saat Ini",
      value: balance,
      icon: Wallet,
      color: "bg-blue-50 text-blue-700",
      iconBg: "bg-blue-100",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`rounded-[2rem] border border-slate-100 p-6 shadow-sm ${card.color}`}
        >
          <div className="flex items-center justify-between">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconBg}`}>
              <card.icon size={24} />
            </div>
            <ArrowUpRight size={18} className="opacity-40" />
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium opacity-80">{card.title}</p>
            <p className="mt-1 text-2xl font-bold">
              Rp {card.value.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
