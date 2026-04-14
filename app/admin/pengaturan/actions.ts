"use server";

import prisma from "@/lib/prisma";
import { siteSettingSchema, type SiteSettingInput } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSiteSettings(data: SiteSettingInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validated = siteSettingSchema.parse(data);

  try {
    // We only have one site setting record (id: 1)
    await prisma.siteSetting.upsert({
      where: { id: 1 },
      update: validated,
      create: {
        id: 1,
        ...validated,
      },
    });
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return { error: "Gagal menyimpan pengaturan." };
  }

  revalidatePath("/admin/pengaturan");
  revalidatePath("/public");
  return { success: true };
}
