import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";
import AgendaTable from "@/components/admin/agenda-table";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminAgendaPage() {
  const agendas = await prisma.agenda.findMany({
    orderBy: { date: "asc" },
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          eyebrow="Admin Agenda"
          title="Kelola Agenda"
          description="Atur jadwal kegiatan, kajian, dan program organisasi."
        />
        <Button asChild className="rounded-full px-6">
          <Link href="/admin/agendabaru">
            <Plus size={18} />
            Tambah Agenda Baru
          </Link>
        </Button>
      </div>

      <SectionCard
        title="Daftar Agenda"
        description={`Terdapat ${agendas.length} agenda yang terdaftar.`}
      >
        <AgendaTable agendas={agendas} />
      </SectionCard>
    </section>
  );
}