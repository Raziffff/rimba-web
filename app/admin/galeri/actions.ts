"use server";

import prisma from "@/lib/prisma";
import { gallerySchema, type GalleryInput } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addGalleryItem(data: GalleryInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validated = gallerySchema.parse(data);

  try {
    await prisma.gallery.create({
      data: validated,
    });
  } catch (error) {
    console.error("Failed to add gallery item:", error);
    return { error: "Gagal menyimpan foto." };
  }

  revalidatePath("/admin/galeri");
  revalidatePath("/public/galeri");
  return { success: true };
}

export async function deleteGalleryItem(id: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.gallery.delete({
      where: { id },
    });
    revalidatePath("/admin/galeri");
    revalidatePath("/public/galeri");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete gallery item:", error);
    return { error: "Gagal menghapus foto." };
  }
}
