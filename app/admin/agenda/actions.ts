"use server";

import prisma from "@/lib/prisma";
import { agendaSchema, type AgendaInput } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAgenda(data: AgendaInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validated = agendaSchema.parse(data);

  try {
    await prisma.agenda.create({
      data: validated,
    });
  } catch (error) {
    console.error("Failed to create agenda:", error);
    return { error: "Gagal menyimpan agenda." };
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/public/agenda");
  revalidatePath("/public");
  redirect("/admin/agenda");
}

export async function updateAgenda(id: string, data: AgendaInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validated = agendaSchema.parse(data);

  try {
    await prisma.agenda.update({
      where: { id },
      data: validated,
    });
  } catch (error) {
    console.error("Failed to update agenda:", error);
    return { error: "Gagal memperbarui agenda." };
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/public/agenda");
  revalidatePath("/public");
  return { success: true };
}

export async function deleteAgenda(id: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.agenda.delete({
      where: { id },
    });
    revalidatePath("/admin/agenda");
    revalidatePath("/public/agenda");
    revalidatePath("/public");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete agenda:", error);
    return { error: "Gagal menghapus agenda." };
  }
}
