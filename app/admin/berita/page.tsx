import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";

export default function AdminBeritaPage() {
  return (
    <section>
      <PageHeader
        eyebrow="Admin Berita"
        title="Kelola Berita"
        description="Halaman ini akan dipakai untuk tambah, edit, hapus, dan publish berita organisasi."
      />

      <SectionCard
        title="Daftar Berita"
        description="Tahap berikutnya kita akan menghubungkan halaman ini ke database."
      />
    </section>
  );
}