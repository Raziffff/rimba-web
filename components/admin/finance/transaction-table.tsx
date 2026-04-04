import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Transaction {
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
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                Belum ada transaksi tercatat.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
