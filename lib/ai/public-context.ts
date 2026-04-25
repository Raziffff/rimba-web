import prisma from "@/lib/prisma";

function truncateText(text: string, maxLen: number) {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trimEnd()}…`;
}

export async function buildPublicContext() {
  const [siteSetting, latestNews, upcomingAgenda, latestEvents] = await Promise.all([
    prisma.siteSetting.findFirst(),
    prisma.news.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        title: true,
        excerpt: true,
        slug: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.agenda.findMany({
      orderBy: [{ date: "asc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        title: true,
        location: true,
        date: true,
        description: true,
      },
    }),
    prisma.event.findMany({
      orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        title: true,
        location: true,
        eventDate: true,
        description: true,
      },
    }),
  ]);

  const lines: string[] = [];

  if (siteSetting) {
    lines.push("PROFIL ORGANISASI");
    lines.push(`Nama: ${siteSetting.organizationName}`);
    if (siteSetting.description) lines.push(`Deskripsi: ${siteSetting.description}`);
    if (siteSetting.address) lines.push(`Alamat: ${siteSetting.address}`);
    if (siteSetting.email) lines.push(`Email: ${siteSetting.email}`);
    if (siteSetting.phone) lines.push(`Telepon: ${siteSetting.phone}`);
    if (siteSetting.instagram) lines.push(`Instagram: ${siteSetting.instagram}`);
    if (siteSetting.youtube) lines.push(`YouTube: ${siteSetting.youtube}`);
    lines.push("");
  }

  if (latestNews.length) {
    lines.push("BERITA TERBARU (PUBLISHED)");
    for (const n of latestNews) {
      const date = (n.publishedAt ?? n.createdAt).toISOString().slice(0, 10);
      lines.push(`- ${n.title} (${date})`);
      if (n.excerpt) lines.push(`  Ringkasan: ${truncateText(n.excerpt, 220)}`);
      lines.push(`  Link: /public/berita/${n.slug}`);
    }
    lines.push("");
  }

  if (upcomingAgenda.length) {
    lines.push("AGENDA");
    for (const a of upcomingAgenda) {
      lines.push(`- ${a.title} (${a.date.toISOString().slice(0, 10)})`);
      if (a.location) lines.push(`  Lokasi: ${a.location}`);
      if (a.description) lines.push(`  Deskripsi: ${truncateText(a.description, 220)}`);
      lines.push("  Link: /public/agenda");
    }
    lines.push("");
  }

  if (latestEvents.length) {
    lines.push("EVENT");
    for (const e of latestEvents) {
      lines.push(`- ${e.title} (${e.eventDate.toISOString().slice(0, 10)})`);
      if (e.location) lines.push(`  Lokasi: ${e.location}`);
      if (e.description) lines.push(`  Deskripsi: ${truncateText(e.description, 220)}`);
      lines.push("  Link: /public/agenda");
    }
    lines.push("");
  }

  lines.push("HALAMAN PUBLIK");
  lines.push("- Tentang: /public/tentang");
  lines.push("- Program/Kegiatan: /public/program");
  lines.push("- Kontak: /public/kontak");

  return lines.join("\n");
}

