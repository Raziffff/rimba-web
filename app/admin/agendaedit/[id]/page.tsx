import PageHeader from "@/components/admin/page-header";
import AgendaForm from "@/components/admin/agenda-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

type EditAgendaPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAgendaPage({ params }: EditAgendaPageProps) {
  const { id } = await params;

  const agenda = await prisma.agenda.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      category: true,
      date: true,
      location: true,
      status: true,
      statusNote: true,
      requirements: true,
      registrationDeadline: true,
    },
  });

  if (!agenda) {
    notFound();
  }

  const initialData = {
    title: agenda.title,
    description: agenda.description,
    category: agenda.category ?? undefined,
    date: agenda.date,
    location: agenda.location ?? undefined,
    status: agenda.status,
    statusNote: agenda.statusNote ?? undefined,
    requirements: agenda.requirements ?? undefined,
    registrationDeadline: agenda.registrationDeadline ?? undefined,
  };

  return (
    <section className="space-y-6 pb-20">
      <PageHeader
        eyebrow="Admin Agenda"
        title="Edit Agenda"
        description={`Mengedit agenda: ${agenda.title}`}
      />

      <AgendaForm initialData={initialData} id={id} />
    </section>
  );
}
