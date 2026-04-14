import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";
import GalleryForm from "@/components/admin/gallery-form";
import GalleryList from "@/components/admin/gallery-list";
import prisma from "@/lib/prisma";

export default async function AdminGaleriPage() {
  const items = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-8 pb-20">
      <PageHeader
        eyebrow="Admin Galeri"
        title="Kelola Galeri"
        description="Dokumentasikan kegiatan organisasi melalui foto-foto terbaik."
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="Daftar Dokumentasi"
            description={`Menampilkan ${items.length} foto dalam galeri.`}
          >
            <div className="mt-4">
              <GalleryList items={items} />
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-1">
          <GalleryForm />
        </div>
      </div>
    </section>
  );
}
