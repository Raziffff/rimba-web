"use server";

import prisma from "../../../lib/prisma";
import { transactionSchema, type TransactionInput } from "../../../lib/validations";
import { auth } from "../../../lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import Groq from "groq-sdk";

export async function createTransaction(data: TransactionInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validated = transactionSchema.parse(data);

  try {
    await prisma.financialTransaction.create({
      data: validated,
    });
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return { error: "Gagal menyimpan transaksi." };
  }

  revalidatePath("/admin/keuangan");
  revalidatePath("/admin");
  redirect("/admin/keuangan");
}

export async function deleteTransaction(id: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.financialTransaction.delete({
      where: { id },
    });
    revalidatePath("/admin/keuangan");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return { error: "Gagal menghapus transaksi." };
  }
}

// Fungsi untuk Export Excel
export async function exportTransactions(year?: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  let whereClause = {};
  if (year) {
    whereClause = {
      date: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    };
  }

  const transactions = await prisma.financialTransaction.findMany({
    where: whereClause,
    orderBy: { date: "asc" },
  });

  // Mapping data ke format Excel
  const dataForExcel = transactions.map((t) => ({
    Tanggal: new Date(t.date).toLocaleDateString("id-ID"),
    Tipe: t.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
    Kategori: t.category,
    Jumlah: t.amount,
    Deskripsi: t.description,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");

  // Konversi ke base64 string
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  const base64 = buffer.toString("base64");

  return { base64, filename: `Laporan_Keuangan_RIMBA_${year || new Date().getFullYear()}.xlsx` };
}

// Fungsi untuk Import Excel
export async function importTransactions(base64File: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const buffer = Buffer.from(base64File, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, cellNF: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: "dd/mm/yyyy" });

    // Helper untuk parsing tanggal dd/mm/yyyy
    const parseDate = (dateValue: any): Date | null => {
      if (!dateValue) return null;
      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return dateValue;
      }
      const dateStr = String(dateValue);
      const parts = dateStr.split("/");
      if (parts.length !== 3) {
        const partsDash = dateStr.split("-");
        if (partsDash.length === 3) {
          parts.push(...partsDash);
        } else {
          return null;
        }
      }
      let day, month, year;
      if (parts.length === 3) {
        day = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        year = parseInt(parts[2]);
      } else {
        day = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        year = parseInt(parts[2]);
      }
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    };

    console.log("Data parsed from Excel:", data);

    // Validasi dan simpan data satu per satu
    for (const row of data) {
      const rowTyped = row as {
        Tanggal?: any;
        Tipe?: string;
        Kategori?: string;
        Jumlah?: number;
        Deskripsi?: string;
      };
      console.log("Processing row:", rowTyped);
      const tanggal = parseDate(rowTyped.Tanggal);
      const tipe = rowTyped.Tipe === "Pemasukan" ? "INCOME" : "EXPENSE";
      const kategori = rowTyped.Kategori || "Lainnya";
      const jumlah = Number(rowTyped.Jumlah);
      const deskripsi = rowTyped.Deskripsi || "-";

      if (tanggal && !isNaN(jumlah)) {
        await prisma.financialTransaction.create({
          data: {
            date: tanggal,
            type: tipe,
            category: kategori,
            amount: jumlah,
            description: deskripsi,
          },
        });
      }
    }

    revalidatePath("/admin/keuangan");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to import transactions error:", error);
    return { error: "Gagal mengimport data. Periksa format file!" };
  }
}

// Fungsi untuk Download Template Excel
export async function downloadTemplate() {
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
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  const base64 = buffer.toString("base64");

  return { base64, filename: "Template_Laporan_Keuangan_RIMBA.xlsx" };
}

// Fungsi untuk Generate Laporan AI
export async function generateFinancialReport(year: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  const transactions = await prisma.financialTransaction.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  });

  if (transactions.length === 0) {
    return { report: "Tidak ada data transaksi untuk tahun ini." };
  }

  // Hitung total
  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Ambil data untuk AI
  const dataPrompt = JSON.stringify({
    tahun: year,
    totalPemasukan: totalIncome,
    totalPengeluaran: totalExpense,
    saldoAkhir: netBalance,
    jumlahTransaksi: transactions.length,
    transaksi: transactions.map(t => ({
      tanggal: new Date(t.date).toLocaleDateString("id-ID"),
      tipe: t.type,
      kategori: t.category,
      jumlah: t.amount,
      deskripsi: t.description
    }))
  });

  // Panggil Groq AI
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const systemPrompt = `
    Anda adalah Bendahara Organisasi Remaja Masjid Al-Barkah (RIMBA) yang profesional dan sopan.
    Tugas Anda adalah membuat laporan keuangan tahunan dalam Bahasa Indonesia dengan format narasi yang jelas, formal, dan mudah dipahami.
    Gunakan bahasa yang santai tapi tetap sopan.
  `;

  const userPrompt = `
    Berikut adalah data keuangan organisasi RIMBA tahun ${year}:
    ${dataPrompt}

    Buatlah laporan narasi yang menjelaskan:
    1. Ringkasan umum kondisi keuangan tahun ini
    2. Analisis perbandingan pemasukan dan pengeluaran
    3. Kategori transaksi terbesar
    4. Kesimpulan dan saran singkat (jika ada)
  `;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  return { report: completion.choices[0]?.message?.content || "Gagal menghasilkan laporan." };
}
