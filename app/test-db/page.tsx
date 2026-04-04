import prisma from "@/lib/prisma";

export default async function TestDbPage() {
  const totalNews = await prisma.news.count();
  const totalEvents = await prisma.event.count();
  const totalGallery = await prisma.gallery.count();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tes Database RIMBA</h1>
      <p>Total berita: {totalNews}</p>
      <p>Total agenda: {totalEvents}</p>
      <p>Total galeri: {totalGallery}</p>
    </main>
  );
}