import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search } from "lucide-react";

type BeritaPageProps = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
  }>;
};

export default async function BeritaPage({ searchParams }: BeritaPageProps) {
  const sp = await searchParams;
  const pageSize = 9;
  const page = Math.max(1, Number(sp?.page ?? "1") || 1);
  const query = (sp?.q ?? "").trim();

  const where = query
    ? {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { excerpt: { contains: query, mode: "insensitive" as const } },
          { content: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : { isPublished: true };

  const [total, items] = await Promise.all([
    prisma.news.count({ where }),
    prisma.news.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const makeHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (nextPage > 1) params.set("page", String(nextPage));
    return `/public/berita${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            Berita
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            Berita dan Informasi
          </h1>
          <p className="mt-4 max-w-2xl leading-8 text-slate-600">
            Temukan update terbaru seputar kegiatan, program, dan kabar dari
            RIMBA.
          </p>
        </div>

        <form
          action="/public/berita"
          className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <Search size={18} className="text-slate-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Cari berita..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
        </form>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          {query
            ? "Tidak ada berita yang cocok dengan pencarian Anda."
            : "Belum ada berita yang dipublish."}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/public/berita/${item.slug}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-48 bg-gradient-to-br from-green-900 via-green-700 to-emerald-500" />
              <div className="p-6">
                <p className="text-sm text-slate-500">
                  {format(item.publishedAt ?? item.createdAt, "dd MMMM yyyy", {
                    locale: id,
                  })}
                </p>
                <h2 className="mt-3 text-xl font-semibold leading-snug text-slate-900 group-hover:text-green-800">
                  {item.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                  {item.excerpt ?? "Baca selengkapnya untuk detail berita."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            aria-disabled={safePage <= 1}
            href={makeHref(Math.max(1, safePage - 1))}
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              safePage <= 1
                ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
                : "border-slate-300 bg-white text-slate-700 hover:border-green-700 hover:text-green-700"
            }`}
          >
            Sebelumnya
          </Link>

          <p className="text-sm text-slate-600">
            Halaman <span className="font-semibold">{safePage}</span> dari{" "}
            <span className="font-semibold">{totalPages}</span>
          </p>

          <Link
            aria-disabled={safePage >= totalPages}
            href={makeHref(Math.min(totalPages, safePage + 1))}
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              safePage >= totalPages
                ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
                : "border-slate-300 bg-white text-slate-700 hover:border-green-700 hover:text-green-700"
            }`}
          >
            Berikutnya
          </Link>
        </div>
      )}
    </section>
  );
}
