"use server";

import prisma from "@/lib/prisma";
import { agendaSchema, type AgendaInput } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminActivity } from "@/lib/activity-log";

export async function createAgenda(data: AgendaInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validated = agendaSchema.parse(data);

  try {
    const agenda = await prisma.agenda.create({
      data: validated,
    });
    await logAdminActivity({
      action: "CREATE",
      entityType: "AGENDA",
      entityId: agenda.id,
      title: `Agenda "${agenda.title}" ditambahkan`,
      detail: agenda.location || "Lokasi belum ditentukan",
    });
  } catch (error) {
    console.error("Failed to create agenda:", error);
    return { error: "Gagal menyimpan agenda." };
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
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
    const agenda = await prisma.agenda.update({
      where: { id },
      data: validated,
    });
    await logAdminActivity({
      action: "UPDATE",
      entityType: "AGENDA",
      entityId: agenda.id,
      title: `Agenda "${agenda.title}" diperbarui`,
      detail: agenda.location || "Lokasi belum ditentukan",
    });
  } catch (error) {
    console.error("Failed to update agenda:", error);
    return { error: "Gagal memperbarui agenda." };
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
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
    const existingAgenda = await prisma.agenda.findUnique({
      where: { id },
      select: { title: true, location: true },
    });

    const deletedAgenda = await prisma.agenda.delete({
      where: { id },
    });
    await logAdminActivity({
      action: "DELETE",
      entityType: "AGENDA",
      entityId: deletedAgenda.id,
      title: `Agenda "${existingAgenda?.title ?? deletedAgenda.id}" dihapus`,
      detail: existingAgenda?.location || "Agenda dihapus dari sistem",
    });
    revalidatePath("/admin/agenda");
    revalidatePath("/admin");
    revalidatePath("/public/agenda");
    revalidatePath("/public");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete agenda:", error);
    return { error: "Gagal menghapus agenda." };
  }
}
