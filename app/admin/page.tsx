import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Newspaper,
  Users,
  WalletCards,
  ArrowUpRight,
  ImageIcon,
} from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import StatCard from "@/components/admin/stat-card";
import SectionCard from "@/components/admin/section-card";

const stats = [
  {
    title: "Total Berita",
    value: "12",
    description: "Artikel yang sudah dibuat",
    icon: Newspaper,
  },
  {
    title: "Total Agenda",
    value: "8",
    description: "Kegiatan terjadwal",
    icon: CalendarDays,
  },
  {
    title: "Saldo Kas",
    value: "Rp 1,75Jt",
    description: "Dana tersedia saat ini",
    icon: WalletCards,
  },
  {
    title: "Anggota Aktif",
    value: "120+",
    description: "Data tampilan organisasi",
    icon: Users,
  },
];

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

        <SectionCard
          title="Aktivitas Terbaru"
          description="Riwayat singkat perubahan konten dashboard."
        >
          <div className="space-y-4">
            {recentActivities.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.time}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </section>
  );
}