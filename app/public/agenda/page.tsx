import prisma from "@/lib/prisma";
import Link from "next/link";
import AgendaCalendar from "@/components/public/agenda-calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, Filter } from "lucide-react";

type AgendaPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const sp = await searchParams;
  const category = (sp?.category ?? "").trim();

  const agendas = await prisma.agenda.findMany({
    where: {
      ...(category ? { category } : {}),
    },
    orderBy: { date: "asc" },
    take: 200,
    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      location: true,
      category: true,
    },
  });

  const categoriesRaw = await prisma.agenda.findMany({
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
            Agenda
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            Agenda Kegiatan RIMBA
          </h1>
          <p className="mt-4 max-w-2xl leading-8 text-slate-600">
            Lihat jadwal kajian, pelatihan, dan kegiatan sosial. Klik tanggal di
            kalender untuk melihat detail agenda.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            <Filter size={16} className="text-slate-500" />
            <span>Kategori:</span>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/public/agenda"
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
                  href={`/public/agenda?category=${encodeURIComponent(c)}`}
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
      </div>

      <AgendaCalendar
        agendas={agendas.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          date: a.date.toISOString(),
          location: a.location,
          category: a.category,
        }))}
      />

      <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <CalendarDays size={18} className="text-green-700" />
          <h2 className="text-xl font-bold text-slate-900">Daftar Agenda</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {agendas.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-500 md:col-span-2">
              Belum ada agenda yang tersedia.
            </div>
          ) : (
            agendas.slice(0, 8).map((a) => (
              <Link
                key={a.id}
                href={`/public/agenda/${a.id}`}
                className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-green-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">
                      {format(a.date, "dd MMMM yyyy", { locale: id })}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {a.title}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-600">
                      {a.description}
                    </p>
                  </div>
                  {a.category && (
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {a.category}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

