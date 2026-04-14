'use client';

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteTransaction } from "@/app/admin/keuangan/actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description: string;
  date: Date;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteTransaction(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Transaksi berhasil dihapus");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tanggal
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kategori
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Deskripsi
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
              Jumlah
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                {format(new Date(transaction.date), "dd MMM yyyy", { locale: id })}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    transaction.type === "INCOME"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {transaction.category}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {transaction.description}
              </td>
              <td
                className={`px-6 py-4 text-right text-sm font-semibold ${
                  transaction.type === "INCOME" ? "text-green-700" : "text-red-700"
                }`}
              >
                {transaction.type === "INCOME" ? "+" : "-"} Rp{" "}
                {transaction.amount.toLocaleString("id-ID")}
              </td>
              <td className="px-6 py-4 text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isDeleting === transaction.id}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      {isDeleting === transaction.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl border-slate-200">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Transaksi senilai <strong>Rp {transaction.amount.toLocaleString("id-ID")}</strong> akan dihapus permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(transaction.id)}
                        className="rounded-xl bg-red-600 hover:bg-red-700"
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                Belum ada transaksi tercatat.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
