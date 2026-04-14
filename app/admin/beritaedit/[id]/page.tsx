import PageHeader from "@/components/admin/page-header";
import NewsForm from "@/components/admin/news-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

type EditBeritaPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBeritaPage({ params }: EditBeritaPageProps) {
  const { id } = await params;

  const news = await prisma.news.findUnique({
    where: { id },
  });

  if (!news) {
    notFound();
  }

  const initialData = {
    title: news.title,
    slug: news.slug,
    excerpt: news.excerpt ?? undefined,
    content: news.content,
    coverImage: news.coverImage ?? undefined,
    isPublished: news.isPublished,
  };

  return (
    <section className="space-y-6 pb-20">
      <PageHeader
        eyebrow="Admin Berita"
        title="Edit Berita"
        description={`Mengedit berita: ${news.title}`}
      />

      <NewsForm initialData={initialData} id={id} />
    </section>
  );
}
