import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(ChatMessageSchema).max(20).optional(),
});

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

type RateState = {
  windowStartMs: number;
  count: number;
};

function rateLimitOk(ip: string) {
  const key = `ai_chat_rl:${ip}`;
  const now = Date.now();
  const windowMs = 60_000;
  const max = 20;

  const store = globalThis as unknown as {
    __aiChatRateLimit?: Map<string, RateState>;
  };

  store.__aiChatRateLimit ??= new Map<string, RateState>();
  const existing = store.__aiChatRateLimit.get(key);

  if (!existing || now - existing.windowStartMs > windowMs) {
    store.__aiChatRateLimit.set(key, { windowStartMs: now, count: 1 });
    return true;
  }

  if (existing.count >= max) return false;

  existing.count += 1;
  store.__aiChatRateLimit.set(key, existing);
  return true;
}

function looksForbidden(text: string) {
  const t = text.toLowerCase();
  const forbidden = [
    "password",
    "kata sandi",
    "login",
    "admin",
    "role",
    "akun",
    "user",
    "anggota",
    "member",
    "transaksi",
    "keuangan",
    "anggaran",
    "laporan",
    "database",
    "schema",
    "api key",
    "secret",
    "supabase service role",
    "service role",
    "token",
  ];
  return forbidden.some((k) => t.includes(k));
}

function truncateText(text: string, maxLen: number) {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trimEnd()}…`;
}

async function buildPublicContext() {
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

async function callOpenAI(params: {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  context: string;
}) {
  const groqApiKey = process.env.GROQ_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const forcedProvider = (process.env.AI_PROVIDER || "").trim().toLowerCase();

  const groqProvider = groqApiKey
    ? ({
        name: "Groq",
        apiBaseUrl: "https://api.groq.com/openai/v1",
        apiKey: groqApiKey,
        model: process.env.GROQ_MODEL_CHAT || "llama-3.1-8b-instant",
        keyLabel: "GROQ_API_KEY",
        modelLabel: "GROQ_MODEL_CHAT",
      } as const)
    : null;

  const openaiProvider = openaiApiKey
    ? ({
        name: "OpenAI",
        apiBaseUrl: "https://api.openai.com/v1",
        apiKey: openaiApiKey,
        model: process.env.OPENAI_MODEL_CHAT || "gpt-4o-mini",
        keyLabel: "OPENAI_API_KEY",
        modelLabel: "OPENAI_MODEL_CHAT",
      } as const)
    : null;

  const provider =
    forcedProvider === "groq"
      ? groqProvider
      : forcedProvider === "openai"
        ? openaiProvider
        : groqProvider ?? openaiProvider;

  if (!provider) {
    return {
      error:
        forcedProvider === "groq"
          ? "Konfigurasi AI belum tersedia. Isi GROQ_API_KEY."
          : forcedProvider === "openai"
            ? "Konfigurasi AI belum tersedia. Isi OPENAI_API_KEY."
            : "Konfigurasi AI belum tersedia. Isi GROQ_API_KEY (atau OPENAI_API_KEY).",
    } as const;
  }

  const system = [
    "Anda adalah asisten chatbot publik untuk website organisasi RIMBA.",
    "Anda hanya boleh menjawab menggunakan informasi dari CONTEXT yang diberikan.",
    "Jika informasi tidak ada di CONTEXT, jawab: 'Maaf, saat ini belum ada informasi tersebut di website. Silakan hubungi kami melalui halaman kontak.'",
    "Jangan mengarang data, jangan menebak tanggal/nama/kegiatan.",
    "Jawab dalam Bahasa Indonesia, sopan, ringkas (3–7 kalimat).",
    "Jika relevan, sertakan bagian 'Sumber:' dengan link halaman yang ada di CONTEXT.",
    "",
    "CONTEXT:",
    params.context,
  ].join("\n");

  const messages = [
    { role: "system", content: system },
    ...params.history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: params.message },
  ];

  const res = await fetch(`${provider.apiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature: 0.2,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    let providerMessage = "";
    try {
      const parsed = JSON.parse(raw) as { error?: { message?: string } };
      providerMessage = parsed.error?.message || "";
    } catch {
      providerMessage = raw;
    }

    console.error(`${provider.name} error:`, {
      status: res.status,
      statusText: res.statusText,
      model: provider.model,
      providerMessage: providerMessage ? providerMessage.slice(0, 500) : "",
    });

    if (res.status === 401) {
      return {
        error: `AI (${provider.name}) ditolak (API key salah/expired). Coba periksa ${provider.keyLabel}.`,
      } as const;
    }

    if (res.status === 429) {
      return {
        error: `AI (${provider.name}) sedang dibatasi (rate limit/kuota). Coba lagi nanti atau cek usage/limit.`,
      } as const;
    }

    if (res.status === 404) {
      return {
        error: `Model AI (${provider.name}) tidak tersedia. Coba ganti ${provider.modelLabel}.`,
      } as const;
    }

    return { error: `AI (${provider.name}) sedang bermasalah. Coba lagi nanti.` } as const;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return { error: `AI (${provider.name}) tidak mengembalikan jawaban.` } as const;
  }

  return { answer: content } as const;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimitOk(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid." }, { status: 400 });
  }

  const { message, history } = parsed.data;

  if (looksForbidden(message)) {
    return NextResponse.json({
      answer:
        "Maaf, saya tidak bisa membantu untuk informasi internal atau sensitif. Silakan hubungi kami melalui halaman kontak.",
    });
  }

  try {
    const context = await buildPublicContext();
    const result = await callOpenAI({
      message,
      history: history ?? [],
      context,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ answer: result.answer });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi nanti." },
      { status: 500 },
    );
  }
}
