"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteRegistration(id: string) {
  try {
    await prisma.agendaRegistration.delete({
      where: { id },
    });
    revalidatePath("/admin/pendaftaran");
    return { ok: true };
  } catch (error) {
    return { error: "Gagal menghapus pendaftaran" };
  }
}
