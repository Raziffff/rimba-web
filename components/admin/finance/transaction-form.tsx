"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionInput } from "@/lib/validations";
import { createTransaction } from "@/app/admin/keuangan/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, X, PlusCircle, MinusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TransactionForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "INCOME",
      category: "",
      amount: 0,
      description: "",
      date: new Date(),
    },
  });

  const transactionType = watch("type");

  const onSubmit = async (data: TransactionInput) => {
    setLoading(true);
    try {
      const result = await createTransaction(data);
      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      } else {
        toast.success("Transaksi berhasil dicatat!");
        reset({
          type: "INCOME",
          category: "",
          amount: 0,
          description: "",
        });
        router.refresh();
      }
    } catch (error) {
      if ((error as Error).message === "NEXT_REDIRECT") {
        return;
      }
      toast.error("Terjadi kesalahan.");
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Catat Transaksi Baru</CardTitle>
        <CardDescription>Masukkan detail pemasukan atau pengeluaran kas.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={transactionType === "INCOME" ? "default" : "outline"}
              onClick={() => setValue("type", "INCOME")}
              className={`rounded-xl py-6 ${transactionType === "INCOME" ? "bg-green-600 hover:bg-green-700" : "border-slate-200"}`}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Pemasukan
            </Button>
            <Button
              type="button"
              variant={transactionType === "EXPENSE" ? "default" : "outline"}
              onClick={() => setValue("type", "EXPENSE")}
              className={`rounded-xl py-6 ${transactionType === "EXPENSE" ? "bg-red-600 hover:bg-red-700" : "border-slate-200"}`}
            >
              <MinusCircle className="mr-2 h-4 w-4" />
              Pengeluaran
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="Contoh: Donasi, Kas, Peralatan"
              className="rounded-xl border-slate-300 py-6"
            />
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              {...register("amount", { valueAsNumber: true })}
              placeholder="Contoh: 50000"
              className="rounded-xl border-slate-300 py-6"
            />
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Contoh: Iuran Bulanan Anggota"
              className="rounded-xl border-slate-300 py-6"
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              {...register("date", { valueAsDate: true })}
              defaultValue={new Date().toISOString().split('T')[0]}
              className="rounded-xl border-slate-300 py-6"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-6 font-semibold bg-slate-900 hover:bg-slate-800"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Transaksi
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
