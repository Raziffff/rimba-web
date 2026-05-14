"use server";

import prisma from "@/lib/prisma";
import { newsSchema, type NewsInput } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

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
  return { success: true };
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

export async function uploadNewsImage(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return { error: "Konfigurasi Supabase belum lengkap." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "File tidak valid." };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "File harus berupa gambar." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Ukuran gambar maksimal 5MB." };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${randomUUID()}-${Date.now()}.${fileExt}`;
  const filePath = `news/${fileName}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("rimba-web")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return { error: "Gagal mengunggah gambar." };
    }

    const { data } = supabase.storage.from("rimba-web").getPublicUrl(filePath);
    if (!data?.publicUrl) {
      return { error: "Gagal mendapatkan URL gambar." };
    }

    return { publicUrl: data.publicUrl };
  } catch (error) {
    console.error("Upload news image error:", error);
    return { error: "Terjadi kesalahan saat mengunggah gambar." };
  }
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
