import PageHeader from "@/components/admin/page-header";
import AgendaForm from "@/components/admin/agenda-form";

export default function AdminAgendaBaruPage() {
  return (
    <section className="space-y-6 pb-20">
      <PageHeader
        eyebrow="Admin Agenda"
        title="Tambah Agenda Baru"
        description="Buat jadwal kegiatan atau program kerja baru."
      />

      <AgendaForm />
    </section>
  );
}
