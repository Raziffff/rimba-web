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

    type ExcelRow = (string | number | boolean | Date | null | undefined)[];

    const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
      header: 1,
      defval: null,
    });

    console.log("All rows from Excel:", rows);

    if (rows.length < 2) {
      return { error: "File Excel kosong atau tidak memiliki header." };
    }

    // Dapatkan index kolom dari header
    const headers = rows[0] as string[];
    const headerIndex: Record<string, number> = {};
    headers.forEach((header, idx) => {
      if (header) {
        const key = header.toLowerCase().trim();
        headerIndex[key] = idx;
      }
    });

    console.log("Header index:", headerIndex);

    // Cari kolom yang dibutuhkan
    const tanggalIdx = headerIndex["tanggal"] ?? headerIndex["tgl"];
    const tipeIdx = headerIndex["tipe"] ?? headerIndex["type"];
    const kategoriIdx = headerIndex["kategori"] ?? headerIndex["category"];
    const jumlahIdx = headerIndex["jumlah"] ?? headerIndex["amount"] ?? headerIndex["harga"];
    const deskripsiIdx = headerIndex["deskripsi"] ?? headerIndex["description"] ?? headerIndex["keterangan"];

    if (tanggalIdx === undefined) {
      return { error: "Kolom 'Tanggal' tidak ditemukan di file Excel." };
    }
    if (tipeIdx === undefined) {
      return { error: "Kolom 'Tipe' tidak ditemukan di file Excel." };
    }
    if (jumlahIdx === undefined) {
      return { error: "Kolom 'Jumlah' tidak ditemukan di file Excel." };
    }

    let importedCount = 0;
    let errorCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue; // Skip baris kosong
      
      let tanggal: Date | null = null;
      const tglValue = row[tanggalIdx];
      if (tglValue instanceof Date) {
        tanggal = tglValue;
      } else if (tglValue) {
        const tglStr = String(tglValue);
        const parts = tglStr.split(/[\/\-]/);
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            tanggal = date;
          }
        }
      }

      if (!tanggal) {
        console.error(`Invalid date at row ${i + 1}:`, tglValue);
        errorCount++;
        continue;
      }

      let tipe: "INCOME" | "EXPENSE" = "INCOME";
      const tipeCell = row[tipeIdx];
      if (tipeCell) {
        const tipeValue = String(tipeCell).toLowerCase().trim();
        if (tipeValue === "pengeluaran" || tipeValue === "expense") {
          tipe = "EXPENSE";
        }
      }

      const kategoriCell = row[kategoriIdx];
      const kategori = kategoriCell ? String(kategoriCell).trim() : "Lainnya";

      const jumlahCell = row[jumlahIdx];
      const jumlah = Number(jumlahCell);
      if (isNaN(jumlah) || jumlah <= 0) {
        console.error(`Invalid amount at row ${i + 1}:`, jumlahCell);
        errorCount++;
        continue;
      }

      const deskripsiCell = row[deskripsiIdx];
      const deskripsi = deskripsiCell ? String(deskripsiCell).trim() : "-";

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

    revalidatePath("/admin/keuangan");
    revalidatePath("/admin");

    if (importedCount === 0) {
      return { error: "Tidak ada data yang berhasil diimport. Periksa format file!" };
    }

    return {
      success: true,
      message: `Berhasil import ${importedCount} data!${errorCount > 0 ? ` (${errorCount} data gagal)` : ""}`
    };
  } catch (error) {
    console.error("Import failed completely:", error);
    return {
      error: `Gagal mengimport file: ${error instanceof Error ? error.message : "Format file tidak didukung"}`
    };
  }
}

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