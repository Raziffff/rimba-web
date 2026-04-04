import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";

export default function AdminBeritaEditPage() {
  return (
    <section>
      <PageHeader
        eyebrow="Admin Berita"
        title="Edit Berita"
        description="Gunakan halaman ini untuk mengubah konten berita yang sudah ada."
      />

      <SectionCard
        title="Edit Konten"
        description="Perbarui informasi berita di bawah ini."
      >
        <p className="text-slate-500 italic">Sedang dalam pengembangan...</p>
      </SectionCard>
    </section>
  );
}
