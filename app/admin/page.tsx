import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Newspaper,
  Users,
  WalletCards,
  ArrowUpRight,
} from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import StatCard from "@/components/admin/stat-card";
import SectionCard from "@/components/admin/section-card";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { TransactionType } from "@prisma/client";

const recentActivities = [
  {
    title: "Berita Ramadhan berhasil dipublish",
    time: "10 menit lalu",
  },
  {
    title: "Agenda kajian Ahad telah diperbarui",
    time: "1 jam lalu",
  },
  {
    title: "Foto kegiatan bakti sosial ditambahkan",
    time: "3 jam lalu",
  },
  {
    title: "Pengaturan profil organisasi diperbarui",
    time: "Kemarin",
  },
];

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch dynamic stats
  const [totalNews, totalAgenda, totalUsers, transactions, upcomingAgendas] = await Promise.all([
    prisma.news.count(),
    prisma.agenda.count(),
    prisma.user.count(),
    prisma.financialTransaction.findMany({
      select: {
        type: true,
        amount: true,
      },
    }),
    prisma.agenda.findMany({
      where: {
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
      take: 3,
    }),
  ]);

  // Calculate net balance
  const balance = transactions.reduce((acc, curr) => {
    return curr.type === TransactionType.INCOME ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const stats = [
    {
      title: "Total Berita",
      value: totalNews.toString(),
      description: "Artikel yang sudah dibuat",
      icon: Newspaper,
    },
    {
      title: "Total Agenda",
      value: totalAgenda.toString(),
      description: "Kegiatan terjadwal",
      icon: CalendarDays,
    },
    {
      title: "Saldo Kas",
      value: formatCurrency(balance),
      description: "Dana tersedia saat ini",
      icon: WalletCards,
    },
    {
      title: "Anggota Aktif",
      value: totalUsers.toString(),
      description: "Data tampilan organisasi",
      icon: Users,
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Dashboard Admin"
        title={`Selamat datang, ${session.user.name ?? "Admin"}`}
        description="Kelola konten website organisasi mulai dari berita, agenda, galeri, hingga pengaturan informasi situs."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            description={item.description}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Aksi Cepat"
          description="Masuk ke menu penting dashboard untuk mulai mengelola website."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/admin/berita"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Kelola Berita
                </h3>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Tambah, edit, publish, atau hapus berita organisasi.
              </p>
            </Link>

            <Link
              href="/admin/agenda"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Kelola Agenda
                </h3>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Atur jadwal kegiatan, kajian, dan program organisasi.
              </p>
            </Link>

            <Link
              href="/admin/galeri"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Kelola Galeri
                </h3>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Tambahkan dokumentasi foto dan arsip visual kegiatan.
              </p>
            </Link>

            <Link
              href="/admin/keuangan"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Laporan Keuangan
                </h3>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Pantau saldo kas, pemasukan, dan pengeluaran organisasi.
              </p>
            </Link>

            <Link
              href="/admin/pengaturan"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Pengaturan Situs
                </h3>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Ubah profil organisasi, kontak, dan informasi website.
              </p>
            </Link>
          </div>
        </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Agenda Mendatang"
          description="Daftar kegiatan organisasi dalam waktu dekat."
        >
          <div className="mt-4 space-y-4">
            {upcomingAgendas.length > 0 ? (
              upcomingAgendas.map((agenda) => (
                <div key={agenda.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-green-50 text-green-700">
                      <span className="text-xs font-bold uppercase">{format(agenda.date, "MMM", { locale: idLocale })}</span>
                      <span className="text-lg font-bold leading-none">{format(agenda.date, "dd")}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{agenda.title}</p>
                      <p className="text-xs text-slate-500">{agenda.location || "Lokasi belum ditentukan"}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/agendaedit/${agenda.id}`}>Detail</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                <CalendarDays size={40} strokeWidth={1} className="mb-2 opacity-20" />
                <p className="text-sm italic">Tidak ada agenda mendatang.</p>
              </div>
            )}
            <Button variant="outline" className="w-full rounded-xl" asChild>
              <Link href="/admin/agenda">Lihat Semua Agenda</Link>
            </Button>
          </div>
        </SectionCard>

        <SectionCard
          title="Aktivitas Terbaru"
          description="Log aktivitas sistem terakhir."
        >
          <div className="mt-4 space-y-6">
            {recentActivities.map((activity, index) => (
              <div key={index} className="relative flex gap-4">
                {index !== recentActivities.length - 1 && (
                  <div className="absolute left-2.5 top-7 h-full w-px bg-slate-100" />
                )}
                <div className="mt-1.5 h-5 w-5 rounded-full border-4 border-white bg-green-600 shadow-sm" />
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-slate-900">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      </div>
    </section>
  );
}
