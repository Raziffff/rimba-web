import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";

export default function AdminBeritaBaruPage() {
  return (
    <section>
      <PageHeader
        eyebrow="Admin Berita"
        title="Tambah Berita Baru"
        description="Gunakan halaman ini untuk membuat artikel atau berita baru untuk website."
      />

      <SectionCard
        title="Form Berita"
        description="Lengkapi data berita di bawah ini."
      >
        <p className="text-slate-500 italic">Sedang dalam pengembangan...</p>
      </SectionCard>
    </section>
  );
}
