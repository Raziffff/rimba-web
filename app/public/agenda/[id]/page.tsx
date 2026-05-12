import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft, CalendarDays, MapPin, Share2 } from "lucide-react";
import AgendaRegistrationForm from "@/components/public/agenda-registration-form";

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
      status: true,
      statusNote: true,
      requirements: true,
      registrationDeadline: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!agenda) {
    notFound();
  }

const registrationClosed =
  agenda.registrationDeadline != null &&
  agenda.registrationDeadline < new Date();

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

        <div className="flex flex-wrap items-center justify-end gap-3">
          {agenda.status !== "CANCELLED" && !registrationClosed && (
            <a
              href="#pendaftaran"
              className="inline-flex items-center gap-2 rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Daftar Sekarang
            </a>
          )}
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
          {agenda.status === "CANCELLED" && (
            <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              Dibatalkan
            </span>
          )}
          {agenda.status === "CHANGED" && (
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Diubah
            </span>
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

        {agenda.statusNote && (
          <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-semibold">Catatan perubahan</p>
            <p className="mt-2 whitespace-pre-wrap leading-7">{agenda.statusNote}</p>
          </div>
        )}

        <p className="mt-5 whitespace-pre-wrap leading-8 text-slate-700">
          {agenda.description}
        </p>

        <div
          id="pendaftaran"
          className="mt-10 scroll-mt-24 rounded-3xl border border-slate-200 bg-slate-50 p-6"
        >
          <p className="text-sm font-semibold text-slate-900">Informasi pendaftaran</p>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Batas pendaftaran:</span>{" "}
              {agenda.registrationDeadline
                ? format(agenda.registrationDeadline, "dd MMMM yyyy", { locale: id })
                : "Sampai kuota terpenuhi"}
            </p>
            <p className="whitespace-pre-wrap leading-7">
              <span className="font-semibold">Syarat:</span>{" "}
              {agenda.requirements?.trim()
                ? agenda.requirements
                : "Silakan lihat deskripsi agenda atau hubungi panitia untuk informasi syarat."}
            </p>
          </div>
          <div className="mt-6">
            <AgendaRegistrationForm
              agendaId={agenda.id}
              agendaTitle={agenda.title}
              disabled={agenda.status === "CANCELLED"}
              deadlineIso={agenda.registrationDeadline?.toISOString() ?? null}
            />
          </div>
        </div>

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
