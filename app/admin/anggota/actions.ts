"use server";

import prisma from "@/lib/prisma";
import { memberSchema, type MemberInput } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAdminActivity } from "@/lib/activity-log";

export async function createMember(data: MemberInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = memberSchema.parse(data);

  try {
    const member = await prisma.member.create({
      data: validated,
    });
    await logAdminActivity({
      action: "CREATE",
      entityType: "MEMBER",
      entityId: member.id,
      title: `Anggota "${member.name}" ditambahkan`,
      detail: `${member.position}${member.category ? ` • ${member.category}` : ""}`,
    });
    revalidatePath("/admin/anggota");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to create member:", error);
    return { error: "Gagal menambahkan anggota." };
  }
}

export async function updateMember(id: string, data: MemberInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = memberSchema.parse(data);

  try {
    const member = await prisma.member.update({
      where: { id },
      data: validated,
    });
    await logAdminActivity({
      action: "UPDATE",
      entityType: "MEMBER",
      entityId: member.id,
      title: `Data anggota "${member.name}" diperbarui`,
      detail: `${member.position}${member.category ? ` • ${member.category}` : ""}`,
    });
    revalidatePath("/admin/anggota");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update member:", error);
    return { error: "Gagal memperbarui anggota." };
  }
}

export async function deleteMember(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const existingMember = await prisma.member.findUnique({
      where: { id },
      select: { name: true, position: true, category: true },
    });

    const deletedMember = await prisma.member.delete({
      where: { id },
    });
    await logAdminActivity({
      action: "DELETE",
      entityType: "MEMBER",
      entityId: deletedMember.id,
      title: `Anggota "${existingMember?.name ?? deletedMember.id}" dihapus`,
      detail: existingMember
        ? `${existingMember.position}${existingMember.category ? ` • ${existingMember.category}` : ""}`
        : "Data anggota dihapus dari sistem",
    });
    revalidatePath("/admin/anggota");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete member:", error);
    return { error: "Gagal menghapus anggota." };
  }
}
