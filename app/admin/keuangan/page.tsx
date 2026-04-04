import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";
import SummaryCards from "@/components/admin/finance/summary-cards";
import FinanceChart from "@/components/admin/finance/finance-chart";
import TransactionTable from "@/components/admin/finance/transaction-table";
import { PlusCircle } from "lucide-react";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description: string;
  date: Date;
}

export default async function AdminKeuanganPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch transactions from DB
  const transactions = await prisma.financialTransaction.findMany({
    orderBy: { date: "desc" },
    take: 10,
  });

  // Calculate summary
  const allTransactions = await prisma.financialTransaction.findMany();
  const totalIncome = allTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = allTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Prepare chart data (Last 6 months)
  const chartData = [
    { name: "Jan", income: 1200000, expense: 800000 },
    { name: "Feb", income: 1500000, expense: 950000 },
    { name: "Mar", income: 1100000, expense: 1200000 },
    { name: "Apr", income: 1800000, expense: 700000 },
    { name: "Mei", income: 2000000, expense: 1100000 },
    { name: "Jun", income: 1600000, expense: 900000 },
  ];

  return (
    <section className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          eyebrow="Keuangan Organisasi"
          title="Laporan Keuangan"
          description="Pantau arus kas masuk dan keluar organisasi RIMBA secara transparan."
        />
        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-green-700 px-6 text-sm font-semibold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800">
          <PlusCircle size={18} />
          Tambah Transaksi
        </button>
      </div>

      <SummaryCards totalIncome={totalIncome || 5200000} totalExpense={totalExpense || 3450000} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="Grafik Arus Kas"
            description="Visualisasi perbandingan pemasukan dan pengeluaran 6 bulan terakhir."
          >
            <div className="mt-6">
              <FinanceChart data={chartData} />
            </div>
          </SectionCard>
        </div>

        <div className="xl:col-span-1">
          <SectionCard
            title="Kategori Terbesar"
            description="Alokasi dana berdasarkan kategori utama."
          >
            <div className="mt-6 space-y-4">
              {[
                { label: "Donasi Umum", value: 65, color: "bg-green-500" },
                { label: "Kegiatan Ramadhan", value: 20, color: "bg-emerald-500" },
                { label: "Operasional Kas", value: 10, color: "bg-slate-400" },
                { label: "Lain-lain", value: 5, color: "bg-slate-200" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Riwayat Transaksi"
        description="Daftar 10 transaksi terbaru yang dicatat oleh bendahara."
      >
        <div className="mt-4 -mx-6">
          <TransactionTable 
            transactions={transactions.length > 0 ? (transactions as Transaction[]) : [
              {
                id: "1",
                type: "INCOME",
                category: "Donasi",
                amount: 500000,
                description: "Infaq Jumat Berkah",
                date: new Date(),
              },
              {
                id: "2",
                type: "EXPENSE",
                category: "Peralatan",
                amount: 150000,
                description: "Pembelian Sound System",
                date: new Date(new Date().setDate(new Date().getDate() - 1)),
              },
              {
                id: "3",
                type: "INCOME",
                category: "Kas",
                amount: 250000,
                description: "Iuran Anggota Bulanan",
                date: new Date(new Date().setDate(new Date().getDate() - 2)),
              }
            ]} 
          />
        </div>
      </SectionCard>
    </section>
  );
}
