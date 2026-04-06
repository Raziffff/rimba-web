import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft, CalendarDays, MapPin, Share2 } from "lucide-react";

type AgendaDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AgendaDetailPage({ params }: AgendaDetailPageProps) {
  const p = await params;

  const agenda = await prisma.agenda.findUnique({
    where: { id: p.id },
    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      location: true,
      category: true,
      createdAt: true,
    },
  });

  if (!agenda) {
    notFound();
  }

  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const fullUrl = host ? `${proto}://${host}/public/agenda/${agenda.id}` : "";
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(agenda.title);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          href="/public/agenda"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-green-700"
        >
          <ArrowLeft size={18} />
          Kembali
        </Link>

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

      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <p className="inline-flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays size={16} />
            {format(agenda.date, "dd MMMM yyyy", { locale: id })}
          </p>
          {agenda.location && (
            <p className="inline-flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={16} />
              {agenda.location}
            </p>
          )}
          {agenda.category && (
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {agenda.category}
            </span>
          )}
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {agenda.title}
        </h1>

        <p className="mt-5 whitespace-pre-wrap leading-8 text-slate-700">
          {agenda.description}
        </p>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm font-semibold text-slate-900">Bagikan agenda</p>
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
      </div>
    </article>
  );
}

