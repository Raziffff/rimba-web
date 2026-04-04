import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";

export default function AdminGaleriPage() {
  return (
    <section>
      <PageHeader
        eyebrow="Admin Galeri"
        title="Kelola Galeri"
        description="Gunakan halaman ini untuk menambah dan mengelola dokumentasi foto kegiatan."
      />

      <SectionCard
        title="Daftar Foto"
        description="Daftar foto kegiatan yang sudah diunggah."
      >
        <p className="text-slate-500 italic">Sedang dalam pengembangan...</p>
      </SectionCard>
    </section>
  );
}
