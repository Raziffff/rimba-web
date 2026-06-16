"use server";

import prisma from "../../../lib/prisma";
import { transactionSchema, type TransactionInput } from "../../../lib/validations";
import { auth } from "../../../lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import Groq from "groq-sdk";

// Helper untuk parsing tanggal
function parseDate(dateValue: any): Date | null {
  if (!dateValue) return null;
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return dateValue;
  }
  const dateStr = String(dateValue);
  
  const separators = ["/", "-"];
  for (const sep of separators) {
    const parts = dateStr.split(sep);
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  const dateFromString = new Date(dateStr);
  return !isNaN(dateFromString.getTime()) ? dateFromString : null;
}

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

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  const base64 = buffer.toString("base64");

  return { base64, filename: `Laporan_Keuangan_RIMBA_${year || new Date().getFullYear()}.xlsx` };
}

export async function importTransactions(base64File: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const buffer = Buffer.from(base64File, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

    console.log("Data from Excel:", jsonData);

    let importedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const item = jsonData[i];
      console.log(`Processing item ${i + 1}:`, item);
      
      let tgl: Date | null = null;
      let tipe: "INCOME" | "EXPENSE" = "INCOME";
      let kategori = "Lainnya";
      let jumlah = 0;
      let deskripsi = "-";
      
      for (const key of Object.keys(item)) {
        const lowerKey = key.toLowerCase().trim();
        const val = item[key];
        
        if (lowerKey.includes("tanggal") || lowerKey.includes("tgl")) {
          tgl = parseDate(val);
        } else if (lowerKey.includes("tipe") || lowerKey.includes("type")) {
          const v = String(val).toLowerCase().trim();
          tipe = v === "pengeluaran" || v === "expense" ? "EXPENSE" : "INCOME";
        } else if (lowerKey.includes("kategori") || lowerKey.includes("category")) {
          kategori = String(val).trim();
        } else if (lowerKey.includes("jumlah") || lowerKey.includes("amount") || lowerKey.includes("harga")) {
          jumlah = Number(val);
        } else if (lowerKey.includes("deskripsi") || lowerKey.includes("description") || lowerKey.includes("keterangan")) {
          deskripsi = String(val).trim();
        }
      }
      
      if (!tgl) {
        console.error("Invalid date at item", i + 1);
        errorCount++;
        continue;
      }
      
      if (isNaN(jumlah) || jumlah <= 0) {
        console.error("Invalid amount at item", i + 1);
        errorCount++;
        continue;
      }
      
      await prisma.financialTransaction.create({
        data: {
          date: tgl,
          type: tipe,
          category: kategori || "Lainnya",
          amount: jumlah,
          description: deskripsi || "-",
        },
      });
      
      importedCount++;
    }
    
    if (importedCount === 0) {
      return { error: "Tidak ada data yang berhasil diimport!" };
    }
    
    revalidatePath("/admin/keuangan");
    revalidatePath("/admin");
    
    return { 
      success: true, 
      message: `Berhasil import ${importedCount} data!${errorCount > 0 ? ` (${errorCount} gagal)` : ""}` 
    };
    
  } catch (error) {
    console.error("Import failed:", error);
    return { error: `Gagal mengimport: ${error instanceof Error ? error.message : "File tidak sesuai"}` };
  }
}

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
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template Laporan Keuangan");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  const base64 = buffer.toString("base64");

  return { base64, filename: "Template_Laporan_Keuangan_RIMBA.xlsx" };
}

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

  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

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

  const groqClient = new Groq({
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

  const completion = await groqClient.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  return { report: completion.choices[0]?.message?.content || "Gagal menghasilkan laporan." };
}