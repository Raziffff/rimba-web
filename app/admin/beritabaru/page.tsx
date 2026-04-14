import PageHeader from "@/components/admin/page-header";
import NewsForm from "@/components/admin/news-form";

export default function AdminBeritaBaruPage() {
  return (
    <section className="space-y-6 pb-20">
      <PageHeader
        eyebrow="Admin Berita"
        title="Tambah Berita Baru"
        description="Gunakan halaman ini untuk membuat artikel atau berita baru untuk website."
      />

      <NewsForm />
    </section>
  );
}
