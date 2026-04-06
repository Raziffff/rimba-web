import Link from "next/link";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Newspaper,
  Sparkles,
  Users,
  ImageIcon,
  CheckCircle2,
  Target,
  BookOpen,
  HeartHandshake,
} from "lucide-react";

const featuredPrograms = [
  {
    title: "Kajian Remaja",
    description:
      "Program pembinaan rutin untuk memperkuat akidah, akhlak, dan semangat belajar Islam.",
    icon: Users,
  },
  {
    title: "Aksi Sosial",
    description:
      "Kegiatan berbagi, bakti sosial, dan kepedulian terhadap masyarakat sekitar.",
    icon: HeartHandshake,
  },
  {
    title: "Media Dakwah",
    description:
      "Publikasi konten islami, dokumentasi kegiatan, dan dakwah digital yang kreatif.",
    icon: Sparkles,
  },
];

const aboutPoints = [
  {
    title: "Visi",
    description:
      "Membangun generasi remaja masjid yang aktif, berakhlak, dan berdampak di masyarakat.",
    icon: Target,
  },
  {
    title: "Misi",
    description:
      "Menguatkan pembinaan keislaman, kepedulian sosial, dan kreativitas dakwah digital secara berkelanjutan.",
    icon: BookOpen,
  },
  {
    title: "Tujuan",
    description:
      "Menjadi ruang tumbuh untuk remaja: belajar, berorganisasi, melayani, dan berkontribusi lewat program nyata.",
    icon: CheckCircle2,
  },
];

export default async function HomePage() {
  const [news, agendas] = await Promise.all([
    prisma.news.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
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
    prisma.agenda.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 6,
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        location: true,
      },
    }),
  ]);

  const latestNews = news.slice(0, 3);
  const upcomingAgendas = agendas.slice(0, 3);

  const highlights = [
    ...latestNews.map((item) => ({
      key: `news-${item.id}`,
      kind: "news" as const,
      title: item.title,
      description: item.excerpt ?? "Baca selengkapnya untuk detail berita.",
      date: item.publishedAt ?? item.createdAt,
      href: `/public/berita/${item.slug}`,
    })),
    ...upcomingAgendas.map((item) => ({
      key: `agenda-${item.id}`,
      kind: "agenda" as const,
      title: item.title,
      description: item.description,
      date: item.date,
      href: `/public/agenda/${item.id}`,
      location: item.location,
    })),
  ].slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              <Sparkles size={16} />
              Website Resmi Organisasi RIMBA
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Membangun generasi remaja masjid yang aktif, berakhlak, dan
              berdampak.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              RIMBA adalah wadah pembinaan, kolaborasi, dan pengembangan potensi
              remaja Islam Masjid Albarkah melalui program keislaman, sosial,
              edukasi, dan dakwah kreatif.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/public/program"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-green-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Lihat Program
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/public/berita"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-green-700 hover:text-green-700"
              >
                Baca Berita Terbaru
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-slate-900">120+</p>
                <p className="mt-1 text-sm text-slate-500">Anggota Aktif</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-slate-900">35+</p>
                <p className="mt-1 text-sm text-slate-500">Kegiatan Tahunan</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-slate-900">10+</p>
                <p className="mt-1 text-sm text-slate-500">Program Unggulan</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/60">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-green-800 via-green-700 to-emerald-500 p-8 text-white">
                <p className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  Organisasi Remaja Masjid
                </p>
                <h2 className="text-3xl font-bold leading-tight">
                  Bersama RIMBA, tumbuh dalam iman, ilmu, dan aksi nyata.
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/85">
                  Menjadi ruang berkarya bagi generasi muda Islam untuk belajar,
                  melayani, dan memberi manfaat luas bagi masyarakat.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <CalendarDays size={22} />
                    <p className="mt-3 font-semibold">Agenda Terarah</p>
                    <p className="mt-1 text-sm text-white/80">
                      Kegiatan rutin, event spesial, dan pembinaan berkelanjutan.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                    <Newspaper size={22} />
                    <p className="mt-3 font-semibold">Informasi Aktual</p>
                    <p className="mt-1 text-sm text-white/80">
                      Berita, dokumentasi, dan publikasi kegiatan organisasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl md:block">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Fokus Utama
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                Pembinaan • Dakwah • Sosial
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="grid gap-8 lg:grid-cols-3">
            {aboutPoints.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-green-100 text-green-700">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Highlight
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Berita terbaru & agenda mendatang
            </h2>
            <p className="mt-4 max-w-2xl text-slate-600">
              Geser untuk melihat highlight. Konten berasal dari dashboard admin.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/public/berita"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-green-700 hover:text-green-700"
            >
              Lihat Berita
            </Link>
            <Link
              href="/public/agenda"
              className="inline-flex items-center justify-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Lihat Agenda
            </Link>
          </div>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {highlights.length === 0 && (
            <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Belum ada berita atau agenda yang dipublish.
            </div>
          )}

          {highlights.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="group w-[88%] flex-none snap-start overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:w-[420px]"
            >
              <div className="h-40 bg-gradient-to-br from-green-900 via-green-700 to-emerald-500" />
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      item.kind === "news"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.kind === "news" ? "Berita" : "Agenda"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {format(item.date, "dd MMMM yyyy", { locale: id })}
                  </span>
                  {"location" in item && item.location && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={14} />
                      {item.location}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-slate-900 group-hover:text-green-800">
                  {item.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            Program Unggulan
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Ruang tumbuh dan kontribusi bagi remaja masjid
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Program RIMBA dirancang untuk memperkuat karakter islami, kemampuan
            organisasi, dan kepedulian sosial.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featuredPrograms.map((program) => {
            const Icon = program.icon;
            return (
              <div
                key={program.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">
                  {program.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {program.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Berita Terkini
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Informasi terbaru dari kegiatan RIMBA
            </h2>
          </div>
          <Link
            href="/public/berita"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            Lihat semua berita
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {latestNews.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 lg:col-span-3">
              Belum ada berita yang dipublish.
            </div>
          )}
          {latestNews.map((item) => (
            <Link
              key={item.id}
              href={`/public/berita/${item.slug}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-52 bg-gradient-to-br from-green-900 via-green-700 to-emerald-500" />
              <div className="p-6">
                <p className="text-sm text-slate-500">
                  {format(item.publishedAt ?? item.createdAt, "dd MMMM yyyy", {
                    locale: id,
                  })}
                </p>
                <h3 className="mt-3 text-xl font-semibold leading-snug text-slate-900 group-hover:text-green-800">
                  {item.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                  {item.excerpt ?? "Baca selengkapnya untuk detail berita."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl sm:p-10 lg:grid-cols-3">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <CalendarDays size={22} />
            </div>
            <h3 className="mt-5 text-xl font-semibold">Agenda Kegiatan</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Jadwal kajian, pelatihan, dan kegiatan sosial akan ditampilkan
              secara terstruktur.
            </p>
          </div>

          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <ImageIcon size={22} />
            </div>
            <h3 className="mt-5 text-xl font-semibold">Galeri Dokumentasi</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Menampilkan dokumentasi kegiatan organisasi secara visual dan
              menarik.
            </p>
          </div>

          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Users size={22} />
            </div>
            <h3 className="mt-5 text-xl font-semibold">Kolaborasi Remaja</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Mendorong partisipasi aktif, kepemimpinan, dan kebersamaan antar
              anggota.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-green-200 bg-green-50 p-8 sm:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Bergabung Bersama Kami
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Wujudkan remaja masjid yang aktif, kreatif, dan berakhlak
            </h2>
            <p className="mt-4 text-slate-600">
              Ikuti program, kegiatan, dan pembinaan bersama RIMBA untuk
              membangun generasi muda Islam yang bermanfaat.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/public/kontak"
                className="rounded-full bg-green-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Hubungi Kami
              </Link>
              <Link
                href="/public/galeri"
                className="rounded-full border border-green-700 px-6 py-3.5 text-sm font-semibold text-green-700 transition hover:bg-green-100"
              >
                Lihat Galeri
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
