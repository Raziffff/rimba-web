import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";

export default async function AdminPengaturanPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <section>
      <PageHeader
        eyebrow="Pengaturan"
        title="Pengaturan Website"
        description="Halaman ini akan dipakai untuk mengubah profil organisasi dan informasi website."
      />

      <SectionCard
        title="Pengaturan Umum"
        description="Tahap berikutnya kita akan hubungkan ke tabel SiteSetting di database."
      />
    </section>
  );
}