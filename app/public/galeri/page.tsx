import prisma from "@/lib/prisma";
import Link from "next/link";
import GalleryLightbox from "@/components/public/gallery-lightbox";
import { ImageIcon } from "lucide-react";

type GaleriPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function GaleriPage({ searchParams }: GaleriPageProps) {
  const sp = await searchParams;
  const category = (sp?.category ?? "").trim();

  const items = await prisma.gallery.findMany({
    where: {
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 120,
    select: {
      id: true,
      title: true,
      caption: true,
      imageUrl: true,
      category: true,
      createdAt: true,
    },
  });

  const categoriesRaw = await prisma.gallery.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  const categories = categoriesRaw
    .map((c) => c.category)
    .filter((c): c is string => Boolean(c))
    .sort((a, b) => a.localeCompare(b, "id-ID"));

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            Galeri
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            Dokumentasi Kegiatan
          </h1>
          <p className="mt-4 max-w-2xl leading-8 text-slate-600">
            Koleksi foto kegiatan RIMBA. Klik gambar untuk melihat ukuran penuh.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
          <ImageIcon size={16} className="text-slate-500" />
          <span>Kategori:</span>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/public/galeri"
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                !category
                  ? "bg-green-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Semua
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={`/public/galeri?category=${encodeURIComponent(c)}`}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  category === c
                    ? "bg-green-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Belum ada foto galeri.
        </div>
      ) : (
        <GalleryLightbox
          items={items.map((i) => ({
            id: i.id,
            title: i.title,
            caption: i.caption,
            imageUrl: i.imageUrl,
            category: i.category,
            createdAt: i.createdAt.toISOString(),
          }))}
        />
      )}
    </section>
  );
}
