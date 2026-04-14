import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";
import SummaryCards from "@/components/admin/finance/summary-cards";
import TransactionTable, { type Transaction as FinanceTransaction } from "@/components/admin/finance/transaction-table";
import TransactionForm from "@/components/admin/finance/transaction-form";
import FinanceChart from "@/components/admin/finance/finance-chart";
import type { FinancialTransaction } from "@prisma/client";
import { TransactionType } from "@prisma/client";

export default async function AdminKeuanganPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch transactions from DB
  const transactions = await prisma.financialTransaction.findMany({
    orderBy: { date: "desc" },
    take: 50,
  });

  // Calculate summary
  const allTransactions = (await prisma.financialTransaction.findMany({
    select: { amount: true, type: true, date: true }
  })) as { amount: number; type: TransactionType; date: Date }[];
  
  const totalIncome = allTransactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = allTransactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Aggregate by year for chart
  const yearlyMap = new Map<number, { income: number; expense: number }>();
  for (const t of allTransactions) {
    const year = new Date(t.date).getFullYear();
    const prev = yearlyMap.get(year) ?? { income: 0, expense: 0 };
    if (t.type === TransactionType.INCOME) {
      prev.income += t.amount;
    } else {
      prev.expense += t.amount;
    }
    yearlyMap.set(year, prev);
  }
  const yearlyData: { name: string; income: number; expense: number }[] = Array.from(yearlyMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, vals]) => ({
      name: String(year),
      income: vals.income,
      expense: vals.expense,
    }));

  return (
    <section className="space-y-8 pb-20">
      <PageHeader
        eyebrow="Keuangan Organisasi"
        title="Laporan Keuangan"
        description="Pantau arus kas masuk dan keluar organisasi RIMBA secara transparan."
      />

      <SummaryCards 
        totalIncome={totalIncome} 
        totalExpense={totalExpense} 
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <SectionCard
            title="Ringkasan Tahunan"
            description="Diagram pemasukan dan pengeluaran per tahun untuk melihat tren kas."
          >
            <div className="mt-4">
              <FinanceChart data={yearlyData} />
            </div>
          </SectionCard>

          <SectionCard
            title="Riwayat Transaksi"
            description="Daftar transaksi terbaru yang dicatat oleh bendahara."
          >
            <div className="mt-4 -mx-6">
              <TransactionTable 
                transactions={transactions as unknown as FinanceTransaction[]} 
              />
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <TransactionForm />
          </div>
        </div>
      </div>
    </section>
  );
}
