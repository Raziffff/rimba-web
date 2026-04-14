import { z } from "zod";

export const newsSchema = z.object({
  title: z.string().min(5, "Judul berita minimal 5 karakter").max(200),
  slug: z.string().min(3, "Slug minimal 3 karakter").max(200),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(10, "Konten berita minimal 10 karakter"),
  coverImage: z.string().optional(),
  isPublished: z.boolean(),
});

export type NewsInput = z.infer<typeof newsSchema>;

export const agendaSchema = z.object({
  title: z.string().min(5, "Judul agenda minimal 5 karakter").max(200),
  description: z.string().min(10, "Deskripsi agenda minimal 10 karakter"),
  category: z.string().optional(),
  date: z.date({ message: "Tanggal agenda harus diisi" }),
  location: z.string().optional(),
});

export type AgendaInput = z.infer<typeof agendaSchema>;

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(3, "Kategori minimal 3 karakter").max(50),
  amount: z.number().min(1, "Jumlah harus lebih dari 0"),
  description: z.string().min(5, "Deskripsi minimal 5 karakter").max(200),
  date: z.date({ message: "Tanggal harus diisi" }),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const siteSettingSchema = z.object({
  organizationName: z.string().min(3, "Nama organisasi minimal 3 karakter").max(100),
  description: z.string().max(500).optional(),
  address: z.string().max(300).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  logoUrl: z.string().optional(),
});

export type SiteSettingInput = z.infer<typeof siteSettingSchema>;

export const gallerySchema = z.object({
  imageUrl: z.string().url("URL gambar tidak valid"),
  title: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  caption: z.string().max(300).optional(),
});

export type GalleryInput = z.infer<typeof gallerySchema>;

export const memberSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(100),
  position: z.string().min(2, "Jabatan minimal 2 karakter").max(100),
  category: z.string().min(2, "Kategori minimal 2 karakter").max(50),
  imageUrl: z.string().url("URL foto tidak valid").optional().or(z.literal("")),
  order: z.number(),
});

export type MemberInput = z.infer<typeof memberSchema>;
