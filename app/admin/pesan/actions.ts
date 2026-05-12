"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { FeedbackStatus } from "@prisma/client";

export async function updateFeedbackStatus(id: string, status: FeedbackStatus) {
  try {
    await prisma.feedbackMessage.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/pesan");
    return { ok: true };
  } catch (error) {
    return { error: "Gagal memperbarui status" };
  }
}

export async function deleteFeedback(id: string) {
  try {
    await prisma.feedbackMessage.delete({
      where: { id },
    });
    revalidatePath("/admin/pesan");
    return { ok: true };
  } catch (error) {
    return { error: "Gagal menghapus pesan" };
  }
}
