"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export type ContactActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function submitContact(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Mohon isi nama, email, dan pesan dengan benar.",
    };
  }

  const { name, email, message } = parsed.data;

  await prisma.contactMessage.create({
    data: {
      name,
      email,
      message,
    },
  });

  return {
    ok: true,
    message: "Pesan berhasil dikirim. Terima kasih sudah menghubungi RIMBA.",
  };
}

