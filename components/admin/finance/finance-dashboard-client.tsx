"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Upload, Sparkles, Copy, Check, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import SectionCard from "@/components/admin/section-card";
import SummaryCards from "@/components/admin/finance/summary-cards";
import TransactionTable, {
  type Transaction as FinanceTransaction,
} from "@/components/admin/finance/transaction-table";
import TransactionForm from "@/components/admin/finance/transaction-form";
import FinanceChart from "@/components/admin/finance/finance-chart";
import {
  exportTransactions,
  importTransactions,
  generateFinancialReport,
} from "@/app/admin/keuangan/actions";
import * as XLSX from "xlsx";

type Props = {
  allTransactions: { amount: number; type: "INCOME" | "EXPENSE"; date: Date }[];
  transactions: any[];
  yearlyData: { name: string; income: number; expense: number }[];
  totalIncome: number;
  totalExpense: number;
};

export default function FinanceDashboardClient({
  allTransactions,
  transactions,
  yearlyData,
  totalIncome,
  totalExpense,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const initialYear = Number(searchParams.get("year")) || currentYear;
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTransactions = allTransactions.filter(
    (t) => new Date(t.date).getFullYear() === selectedYear
  );
  const filteredIncome = filteredTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const filteredExpense = filteredTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    router.push(`/admin/keuangan?year=${year}`);
    setAiReport(null);
  };

  const handleExport = async () => {
    const buffer = await exportTransactions(selectedYear);
    if (buffer) {
      const url = window.URL.createObjectURL(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_Keuangan_RIMBA_${selectedYear}.xlsx`;
      a.click();
      toast.success("Berhasil mengunduh laporan!");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        const result = await importTransactions(Buffer.from(buffer));
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Berhasil mengimport data!");
          router.refresh();
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const result = await generateFinancialReport(selectedYear);
      if (result?.report) {
        setAiReport(result.report);
        toast.success("Laporan berhasil dibuat!");
      } else {
        toast.error("Gagal membuat laporan.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (aiReport) {
      navigator.clipboard.writeText(aiReport);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Laporan disalin!");
    }
  };

  const availableYears = Array.from(
    new Set(allTransactions.map((t) => new Date(t.date).getFullYear()))
  ).sort((a, b) => a - b);
  if (!availableYears.includes(currentYear)) availableYears.push(currentYear);

  const downloadTemplate = () => {
    const templateData = [
      {
        Tanggal: "15/01/2024",
        Tipe: "Pemasukan",
        Kategori: "Donasi",
        Jumlah: 1000000,
        Deskripsi: "Donasi dari Pak Ahmad"
      },
      {
        Tanggal: "18/01/2024",
        Tipe: "Pengeluaran",
        Kategori: "Acara",
        Jumlah: 350000,
        Deskripsi: "Beli snack untuk kajian"
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");
    XLSX.writeFile(workbook, "Template_Laporan_Keuangan_RIMBA.xlsx");
    toast.success("Template berhasil diunduh!");
  };

  return (
    <section className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Pilih Tahun:</label>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={downloadTemplate} variant="outline" size="sm">
            <FileSpreadsheet size={16} className="mr-2" />
            Unduh Template
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
            <Upload size={16} className="mr-2" />
            Import Excel
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleImport}
            className="hidden"
          />
          <Button onClick={handleExport} size="sm">
            <Download size={16} className="mr-2" />
            Export Excel
          </Button>
          <Button
            onClick={handleGenerateReport}
            size="sm"
            disabled={isGenerating}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Sparkles size={16} className="mr-2" />
            {isGenerating ? "Membuat Laporan..." : "Buat Laporan AI"}
          </Button>
        </div>
      </div>

      <SummaryCards totalIncome={filteredIncome} totalExpense={filteredExpense} />

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

          {aiReport && (
            <SectionCard
              title="Laporan Keuangan AI"
              description="Laporan narasi yang dihasilkan oleh AI berdasarkan data tahun ini."
            >
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {isCopied ? (
                    <Check size={14} className="mr-2" />
                  ) : (
                    <Copy size={14} className="mr-2" />
                  )}
                  {isCopied ? "Disalin" : "Salin Laporan"}
                </Button>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl whitespace-pre-line text-sm leading-relaxed border border-slate-200">
                {aiReport}
              </div>
            </SectionCard>
          )}

          <SectionCard
            title="Riwayat Transaksi"
            description="Daftar transaksi terbaru yang dicatat oleh bendahara."
          >
            <div className="mt-4 sm:-mx-6">
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
