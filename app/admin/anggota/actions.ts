"use server";

import prisma from "@/lib/prisma";
import { memberSchema, type MemberInput } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createMember(data: MemberInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = memberSchema.parse(data);

  try {
    await prisma.member.create({
      data: validated,
    });
    revalidatePath("/admin/anggota");
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
    await prisma.member.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/admin/anggota");
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
    await prisma.member.delete({
      where: { id },
    });
    revalidatePath("/admin/anggota");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete member:", error);
    return { error: "Gagal menghapus anggota." };
  }
}
