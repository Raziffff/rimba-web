import { NextResponse } from "next/server";
import { z } from "zod";
import { buildPublicContext } from "@/lib/ai/public-context";
import { groqChat } from "@/lib/ai/groq-chat";

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

function isSmallTalk(text: string) {
  const t = text.toLowerCase().trim();
  const patterns = [
    "halo",
    "hai",
    "hi",
    "assalamualaikum",
    "asalamualaikum",
    "apa kabar",
    "gimana kabar",
    "terima kasih",
    "makasih",
    "thanks",
    "pagi",
    "siang",
    "sore",
    "malam",
  ];
  return patterns.some((p) => t === p || t.startsWith(`${p} `) || t.includes(p));
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

  if (isSmallTalk(message)) {
    return NextResponse.json({
      answer:
        "Halo! Saya Tanya RIMBA. Saya bisa bantu info publik seputar agenda, berita, program/kegiatan, dan kontak di website ini.\n\nContoh pertanyaan: “Agenda terdekat apa?”, “Berita terbaru apa?”, atau “Kontaknya di mana?”",
    });
  }

  if (looksForbidden(message)) {
    return NextResponse.json({
      answer:
        "Maaf, saya tidak bisa membantu untuk informasi internal atau sensitif. Silakan hubungi kami melalui halaman kontak.",
    });
  }

  try {
    const context = await buildPublicContext();
    const result = await groqChat({
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
