import prisma from "@/lib/prisma";
import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";
import RegistrationTable, { type Registration } from "./registration-table";

export default async function AdminPendaftaranPage() {
  const registrations = await prisma.agendaRegistration.findMany({
    include: {
      agenda: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section className="space-y-8 pb-20">
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Daftar Pendaftaran Agenda"
        description="Pantau siapa saja yang mendaftar untuk kegiatan organisasi."
      />

      <SectionCard
        title="Pendaftar Terbaru"
        description="Berikut adalah daftar masyarakat yang mengisi form pendaftaran agenda."
      >
        <div className="mt-4 -mx-6 overflow-x-auto">
          <RegistrationTable registrations={registrations as unknown as Registration[]} />
        </div>
      </SectionCard>
    </section>
  );
}
