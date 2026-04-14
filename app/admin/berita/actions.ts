"use server";

import prisma from "@/lib/prisma";
import { newsSchema, type NewsInput } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createNews(data: NewsInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validated = newsSchema.parse(data);

  try {
    await prisma.news.create({
      data: {
        ...validated,
        authorId: session.user.id,
        publishedAt: validated.isPublished ? new Date() : null,
      },
    });
  } catch (error) {
    console.error("Failed to create news:", error);
    return { error: "Terjadi kesalahan saat menyimpan berita." };
  }

  revalidatePath("/admin/berita");
  revalidatePath("/public/berita");
  redirect("/admin/berita");
}

export async function updateNews(id: string, data: NewsInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validated = newsSchema.parse(data);

  try {
    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews) {
      return { error: "Berita tidak ditemukan." };
    }

    // Update publishedAt logic
    let publishedAt = existingNews.publishedAt;
    if (validated.isPublished && !existingNews.isPublished) {
      publishedAt = new Date();
    } else if (!validated.isPublished) {
      publishedAt = null;
    }

    await prisma.news.update({
      where: { id },
      data: {
        ...validated,
        publishedAt,
      },
    });
  } catch (error) {
    console.error("Failed to update news:", error);
    return { error: "Gagal memperbarui berita." };
  }

  revalidatePath("/admin/berita");
  revalidatePath(`/public/berita/${data.slug}`);
  revalidatePath("/public/berita");
  return { success: true };
}

export async function deleteNews(id: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.news.delete({
      where: { id },
    });
    revalidatePath("/admin/berita");
    revalidatePath("/public/berita");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete news:", error);
    return { error: "Gagal menghapus berita." };
  }
}
