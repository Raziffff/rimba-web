import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/admin/page-header";
import { TransactionType } from "@prisma/client";
import FinanceDashboardClient from "@/components/admin/finance/finance-dashboard-client";

type AdminKeuanganPageProps = {
  searchParams?: Promise<{
    year?: string;
  }>;
};

export default async function AdminKeuanganPage({
  searchParams,
}: AdminKeuanganPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const sp = await searchParams;
  const currentYear = new Date().getFullYear();
  const parsedYear = Number(sp?.year);
  const selectedYear =
    Number.isInteger(parsedYear) && parsedYear > 0 ? parsedYear : currentYear;
  const startDate = new Date(selectedYear, 0, 1);
  const endDate = new Date(selectedYear + 1, 0, 1);

  const [transactions, allTransactions] = await Promise.all([
    prisma.financialTransaction.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.financialTransaction.findMany({
      select: {
        amount: true,
        type: true,
        date: true,
        category: true,
        description: true,
      },
    }),
  ]);
  
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
