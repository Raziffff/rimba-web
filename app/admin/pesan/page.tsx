import prisma from "@/lib/prisma";
import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";
import FeedbackTable, { type Feedback } from "./feedback-table";

export const dynamic = "force-dynamic";

export default async function AdminPesanPage() {
  const messages = await prisma.feedbackMessage.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section className="space-y-8 pb-20">
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Masukan & Pengaduan"
        description="Dengarkan suara masyarakat dan kelola status penyelesaiannya."
      />

      <SectionCard
        title="Pesan Masuk"
        description="Daftar saran, pertanyaan, atau pengaduan yang dikirim melalui website."
      >
        <div className="mt-4 -mx-6 overflow-x-auto">
          <FeedbackTable messages={messages as unknown as Feedback[]} />
        </div>
      </SectionCard>
    </section>
  );
}
