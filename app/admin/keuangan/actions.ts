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
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length < 2) {
      return { error: "File Excel kosong atau tidak sesuai format!" };
    }
    const headers = data[0] as string[];
    console.log("Headers:", headers);

    const headerMap = new Map();
    headers.forEach((h, i) => {
      headerMap.set(h?.trim()?.toLowerCase(), i);
    });

    const tanggalIdx = headerMap.get("tanggal");
    const tipeIdx = headerMap.get("tipe");
    const kategoriIdx = headerMap.get("kategori");
    const jumlahIdx = headerMap.get("jumlah");
    const deskripsiIdx = headerMap.get("deskripsi");

    if (tanggalIdx === undefined || tipeIdx === undefined || jumlahIdx === undefined) {
      return { error: "Header kolom tidak sesuai! Pastikan ada: Tanggal, Tipe, Jumlah!" };
    }

    // Helper untuk parsing tanggal
    const parseDate = (dateValue: any): Date | null => {
      if (!dateValue) return null;
      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return dateValue;
      }
      const dateStr = String(dateValue);
      
      // Coba format dd/mm/yyyy atau dd-mm-yyyy
      const separators = ["/", "-"];
      for (const sep of separators) {
        const parts = dateStr.split(sep);
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // bulan 0-11
          const year = parseInt(parts[2]);
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
      
      // Coba format ISO atau lainnya
      const dateFromString = new Date(dateStr);
      if (!isNaN(dateFromString.getTime())) {
        return dateFromString;
      }
      return null;
    };

    let importedCount = 0;
    let errorCount = 0;

    // Validasi dan simpan data satu per satu
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      console.log("Processing row:", row);
      const tanggalValue = row[tanggalIdx];
      const tipeValue = row[tipeIdx];
      const kategoriValue = row[kategoriIdx];
      const jumlahValue = row[jumlahIdx];
      const deskripsiValue = row[deskripsiIdx];

      const tanggal = parseDate(tanggalValue);
      if (!tanggal) {
        console.error("Invalid date at row", i + 1, ":", tanggalValue);
        errorCount++;
        continue;
      }

      let tipe;
      if (String(tipeValue).toLowerCase() === "pemasukan" || String(tipeValue).toUpperCase() === "INCOME") {
        tipe = "INCOME";
      } else {
        tipe = "EXPENSE";
      }

      const kategori = kategoriValue ? String(kategoriValue).trim() : "Lainnya";
      const jumlah = Number(jumlahValue);
      const deskripsi = deskripsiValue ? String(deskripsiValue).trim() : "-";

      if (isNaN(jumlah) || jumlah <= 0) {
        console.error("Invalid amount at row", i + 1, ":", jumlahValue);
        errorCount++;
        continue;
      }

      await prisma.financialTransaction.create({
        data: {
          date: tanggal,
          type: tipe,
          category: kategori,
          amount: jumlah,
          description: deskripsi,
        },
      });
      importedCount++;
    }

    if (importedCount === 0) {
      return { error: "Tidak ada data yang berhasil diimport! Periksa format tanggal dan jumlah!" };
    }

    revalidatePath("/admin/keuangan");
    revalidatePath("/admin");
    return { success: true, message: `Berhasil import ${importedCount} data! ${errorCount > 0 ? `${errorCount} data gagal` : ""}` };
  } catch (error) {
    console.error("Failed to import transactions error:", error);
    return { error: `Gagal mengimport data: ${error instanceof Error ? error.message : "Periksa format file!"}` };
  }
}

// Fungsi untuk Download Template Excel
export async function downloadTemplate() {
  const templateData = [
    ["Tanggal", "Tipe", "Kategori", "Jumlah", "Deskripsi"],
    ["15/01/2024", "Pemasukan", "Donasi", 1000000, "Donasi dari Pak Ahmad"],
    ["18/01/2024", "Pengeluaran", "Acara", 350000, "Beli snack untuk kajian"],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template Laporan Keuangan");
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
