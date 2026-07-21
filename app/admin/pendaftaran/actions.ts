"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { logAdminActivity } from "@/lib/activity-log";

export async function deleteRegistration(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const deleted = await prisma.agendaRegistration.delete({
      where: { id },
      include: { agenda: true }
    });

    await logAdminActivity({
      action: "DELETE",
      entityType: "REGISTRATION",
      entityId: deleted.id,
      title: `Pendaftaran "${deleted.name}" dihapus`,
      detail: deleted.agenda.title || "Agenda tidak diketahui"
    });

    revalidatePath("/admin/pendaftaran");
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete registration:", error);
    return { error: "Gagal menghapus pendaftaran" };
  }
}

export async function updateRegistrationStatus(
  id: string,
  status: "MENUNGGU" | "DIKONFIRMASI" | "DITOLAK"
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const updated = await prisma.agendaRegistration.update({
      where: { id },
      data: { status },
      include: { agenda: true }
    });

    await logAdminActivity({
      action: "UPDATE",
      entityType: "REGISTRATION",
      entityId: updated.id,
      title: `Status pendaftaran "${updated.name}" diubah menjadi ${status}`,
      detail: updated.agenda.title || "Agenda tidak diketahui"
    });

    revalidatePath("/admin/pendaftaran");
    return { ok: true };
  } catch (error) {
    console.error("Failed to update registration status:", error);
    return { error: "Gagal mengubah status pendaftaran" };
  }
}

export async function getRegistrations(
  searchQuery?: string,
  agendaId?: string
) {
  const where: any = {};

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { email: { contains: searchQuery, mode: "insensitive" } },
      { phone: { contains: searchQuery, mode: "insensitive" } }
    ];
  }

  if (agendaId) {
    where.agendaId = agendaId;
  }

  const registrations = await prisma.agendaRegistration.findMany({
    where,
    include: { agenda: true },
    orderBy: { createdAt: "desc" }
  });

  const stats = await prisma.agendaRegistration.aggregate({
    _count: { id: true },
    where
  });

  const statusStats = await prisma.agendaRegistration.groupBy({
    by: ["status"],
    _count: { id: true },
    where
  });

  const formattedStats = {
    total: stats._count.id,
    menunggu: statusStats.find(s => s.status === "MENUNGGU")?._count.id || 0,
    dikonfirmasi: statusStats.find(s => s.status === "DIKONFIRMASI")?._count.id || 0,
    ditolak: statusStats.find(s => s.status === "DITOLAK")?._count.id || 0
  };

  return { registrations, stats: formattedStats };
}

export async function getAgendas() {
  return prisma.agenda.findMany({
    orderBy: { date: "desc" },
    select: { id: true, title: true }
  });
}
