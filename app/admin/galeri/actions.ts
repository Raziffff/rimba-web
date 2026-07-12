"use server";

import prisma from "@/lib/prisma";
import { gallerySchema, type GalleryInput } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { logAdminActivity } from "@/lib/activity-log";

export async function addGalleryItem(data: GalleryInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validated = gallerySchema.parse(data);

  try {
    const galleryItem = await prisma.gallery.create({
      data: validated,
    });
    await logAdminActivity({
      action: "CREATE",
      entityType: "GALLERY",
      entityId: galleryItem.id,
      title: `Foto galeri "${galleryItem.title || "Tanpa Judul"}" ditambahkan`,
      detail: galleryItem.category || "Kategori belum diisi",
    });
  } catch (error) {
    console.error("Failed to add gallery item:", error);
    return { error: "Gagal menyimpan foto." };
  }

  revalidatePath("/admin/galeri");
  revalidatePath("/admin");
  revalidatePath("/public/galeri");
  return { success: true };
}

export async function uploadGalleryImage(formData: FormData) {
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
  const filePath = `gallery/${fileName}`;

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
    console.error("Upload gallery image error:", error);
    return { error: "Terjadi kesalahan saat mengunggah gambar." };
  }
}

export async function deleteGalleryItem(id: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const existingGalleryItem = await prisma.gallery.findUnique({
      where: { id },
      select: { title: true, category: true },
    });

    const deletedGalleryItem = await prisma.gallery.delete({
      where: { id },
    });
    await logAdminActivity({
      action: "DELETE",
      entityType: "GALLERY",
      entityId: deletedGalleryItem.id,
      title: `Foto galeri "${existingGalleryItem?.title || "Tanpa Judul"}" dihapus`,
      detail: existingGalleryItem?.category || "Foto dihapus dari galeri",
    });
    revalidatePath("/admin/galeri");
    revalidatePath("/admin");
    revalidatePath("/public/galeri");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete gallery item:", error);
    return { error: "Gagal menghapus foto." };
  }
}
