import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";
import SettingsForm from "@/components/admin/settings-form";
import prisma from "@/lib/prisma";

export default async function AdminPengaturanPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const settings = await prisma.siteSetting.findUnique({
    where: { id: 1 },
  });

  const initialData = settings ? {
    organizationName: settings.organizationName,
    description: settings.description ?? undefined,
    address: settings.address ?? undefined,
    phone: settings.phone ?? undefined,
    email: settings.email ?? undefined,
    instagram: settings.instagram ?? undefined,
    youtube: settings.youtube ?? undefined,
    logoUrl: settings.logoUrl ?? undefined,
  } : undefined;

  return (
    <section className="space-y-6 pb-20">
      <PageHeader
        eyebrow="Pengaturan"
        title="Pengaturan Website"
        description="Kelola profil organisasi, informasi kontak, dan media sosial website RIMBA."
      />

      <SettingsForm initialData={initialData} />
    </section>
  );
}