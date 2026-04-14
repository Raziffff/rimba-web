import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft, CalendarDays, Share2, AlertCircle } from "lucide-react";
import { auth } from "@/lib/auth";

type BeritaDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BeritaDetailPage({ params }: BeritaDetailPageProps) {
  const p = await params;
  const session = await auth();

  // Jika bukan admin, hanya cari berita yang sudah published
  // Jika admin, cari semua status berita
  const whereClause = session?.user 
    ? { slug: p.slug } 
    : { slug: p.slug, isPublished: true };

  const news = await prisma.news.findFirst({
    where: whereClause,
    select: {
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      publishedAt: true,
      createdAt: true,
      slug: true,
      isPublished: true,
    },
  });

  if (!news) {
    notFound();
  }

  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const fullUrl = host ? `${proto}://${host}/public/berita/${news.slug}` : "";
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(news.title);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          href="/public/berita"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-green-700"
        >
          <ArrowLeft size={18} />
          Kembali
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-700 hover:text-green-700"
          >
            <Share2 size={16} />
            Share
          </a>
        </div>
      </div>

      {!news.isPublished && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">
            Berita ini berstatus <strong>Draft</strong>. Hanya Admin yang dapat melihat pratinjau ini.
          </p>
        </div>
      )}

      <div className="mb-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm relative">
        {news.coverImage ? (
          <img 
            src={news.coverImage} 
            alt={news.title} 
            className="h-64 w-full object-cover sm:h-80"
          />
        ) : (
          <div className="h-64 bg-gradient-to-br from-green-900 via-green-700 to-emerald-500 sm:h-80" />
        )}
      </div>

      <p className="inline-flex items-center gap-2 text-sm text-slate-500">
        <CalendarDays size={16} />
        {format(news.publishedAt ?? news.createdAt, "dd MMMM yyyy", { locale: id })}
      </p>

      <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
        {news.title}
      </h1>

      {news.excerpt && (
        <p className="mt-5 text-lg leading-8 text-slate-600">{news.excerpt}</p>
      )}

      <div className="mt-10 space-y-5 text-slate-700">
        <p className="whitespace-pre-wrap leading-8">{news.content}</p>
      </div>

      <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-semibold text-slate-900">
          Bagikan berita ini
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-700 hover:text-green-700"
          >
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-700 hover:text-green-700"
          >
            X
          </a>
          <a
            href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-700 hover:text-green-700"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
