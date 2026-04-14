import PageHeader from "@/components/admin/page-header";
import SectionCard from "@/components/admin/section-card";
import NewsTable from "@/components/admin/news-table";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminBeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Number((await searchParams).page) || 1;
  const pageSize = 10;

  const [news, totalNews] = await Promise.all([
    prisma.news.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.news.count(),
  ]);

  const totalPages = Math.ceil(totalNews / pageSize);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          eyebrow="Admin Berita"
          title="Kelola Berita"
          description="Tambah, edit, hapus, dan publish berita organisasi."
        />
        <Button asChild className="rounded-full px-6">
          <Link href="/admin/beritabaru">
            <Plus size={18} />
            Buat Berita Baru
          </Link>
        </Button>
      </div>

      <SectionCard
        title="Daftar Berita"
        description={`Menampilkan ${news.length} dari ${totalNews} total berita.`}
      >
        <div className="space-y-4">
          <NewsTable news={news} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">
                Halaman <span className="font-medium">{page}</span> dari{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className={cn(
                    "rounded-full transition",
                    page <= 1 && "pointer-events-none opacity-40"
                  )}
                >
                  <Link href={`/admin/berita?page=${page - 1}`}>
                    <ChevronLeft size={18} />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className={cn(
                    "rounded-full transition",
                    page >= totalPages && "pointer-events-none opacity-40"
                  )}
                >
                  <Link href={`/admin/berita?page=${page + 1}`}>
                    <ChevronRight size={18} />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </section>
  );
}