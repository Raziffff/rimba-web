import PageHeader from "@/components/admin/page-header";
import RegistrationDashboardClient from "@/components/admin/registration-dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminPendaftaranPage() {
  return (
    <section className="space-y-8 pb-20">
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Daftar Pendaftaran Agenda"
        description="Pantau dan kelola pendaftaran kegiatan organisasi."
      />

      <RegistrationDashboardClient />
    </section>
  );
}
