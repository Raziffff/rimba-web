import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/admin/page-header";
import { TransactionType } from "@prisma/client";
import FinanceDashboardClient from "@/components/admin/finance/finance-dashboard-client";

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
  const allTransactions = await prisma.financialTransaction.findMany({
    select: { amount: true, type: true, date: true, category: true, description: true }
  });
  
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
    <>
      <PageHeader
        eyebrow="Keuangan Organisasi"
        title="Laporan Keuangan"
        description="Pantau arus kas masuk dan keluar organisasi RIMBA secara transparan."
      />
      <FinanceDashboardClient
        allTransactions={allTransactions}
        transactions={transactions}
        yearlyData={yearlyData}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />
    </>
  );
}
