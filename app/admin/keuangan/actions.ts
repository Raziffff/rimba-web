"use server";

import prisma from "../../../lib/prisma";
import { transactionSchema, type TransactionInput } from "../../../lib/validations";
import { auth } from "../../../lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
