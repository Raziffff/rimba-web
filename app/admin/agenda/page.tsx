import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";

export default function AdminAgendaPage() {
  return (
    <section>
      <PageHeader
        eyebrow="Admin Agenda"
        title="Kelola Agenda"
        description="Halaman ini akan dipakai untuk mengatur jadwal kegiatan dan acara organisasi."
      />

      <SectionCard
        title="Daftar Agenda"
        description="Tahap berikutnya kita akan membuat CRUD agenda."
      />
    </section>
  );
}