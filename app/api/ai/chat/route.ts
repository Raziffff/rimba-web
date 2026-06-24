import { NextResponse } from "next/server";
import { z } from "zod";
import { buildPublicContext } from "@/lib/ai/public-context";
import { groqChat } from "@/lib/ai/groq-chat";
import prisma from "@/lib/prisma";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(ChatMessageSchema).max(20).optional(),
  conversationState: z.string().optional(),
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
  const max = 50;

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
    "script",
    "eval",
    "<script",
    "javascript:",
  ];
  return forbidden.some((k) => t.includes(k));
}

function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const smallTalkResponses = {
  greetings: [
    "Halo! Senang bertemu denganmu! Ada yang ingin kamu tanyakan tentang RIMBA? 😊",
    "Hey! Selamat datang di Tanya RIMBA! Ada yang bisa saya bantu hari ini?",
    "Assalamualaikum! Saya Tanya RIMBA. Ada informasi yang ingin kamu ketahui?",
    "Hai-hai! Semoga harimu menyenangkan! Butuh bantuan apa?"
  ],
  howAreYou: [
    "Saya baik-baik saja, terima kasih tanya! Bagaimana denganmu? Ada yang ingin kita bahas tentang RIMBA? 😃",
    "Alhamdulillah, saya selalu siap membantu! Kamu mau tanya agenda, berita, atau yang lain?",
    "Saya sehat dan bersemangat! Ada yang ingin kamu ketahui tentang organisasi kita?"
  ],
  thanks: [
    "Sama-sama! Senang bisa membantu 😊 Ada lagi yang ingin ditanyakan?",
    "Dengan senang hati! Kalau butuh informasi lain, tinggal chat aja ya!",
    "Terima kasih kembali! Jangan ragu untuk bertanya lagi kapan saja!"
  ],
  timeGreetings: {
    pagi: ["Selamat pagi! Semoga hari ini penuh berkah! Ada yang ingin kita bahas?"],
    siang: ["Selamat siang! Semoga harimu menyenangkan! Butuh informasi apa?"],
    sore: ["Selamat sore! Sudah istirahat sebentar? Ada yang ingin ditanyakan tentang RIMBA?"],
    malam: ["Selamat malam! Semoga malammu tenang. Ada yang ingin kita bicarakan?"]
  }
};

const quickSuggestions = [
  "Agenda terdekat apa?",
  "Berita terbaru?",
  "Lokasi dimana?",
  "Cara daftar agenda?"
];

function isSmallTalk(text: string) {
  const t = text.toLowerCase().trim();
  const patterns = [
    "halo",
    "hai",
    "hi",
    "assalamualaikum",
    "asalamualaikum",
    "apa kabar",
    "apakabar",
    "gimana kabar",
    "gmna kabar",
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

function detectIntent(text: string) {
  const t = text.toLowerCase();
  
  if (t.includes("apa itu rimba") || t.includes("apa itu") || t.includes("pengertian")) {
    return "faq_about";
  } else if (t.includes("lokasi") || t.includes("dimana") || t.includes("alamat")) {
    return "faq_location";
  } else if (t.includes("kontak") || t.includes("wa") || t.includes("whatsapp") || t.includes("telp") || t.includes("telepon")) {
    return "faq_contact";
  } else if (t.includes("agenda") || t.includes("kegiatan")) {
    return "faq_agenda";
  } else if (t.includes("berita") || t.includes("info")) {
    return "faq_news";
  } else if (t.includes("cara daftar") || t.includes("daftar") || t.includes("registrasi")) {
    return "faq_register";
  }
  return "general";
}

function getSmallTalkResponse(text: string): string {
  const t = text.toLowerCase().trim();
  
  if (t.includes("apa kabar") || t.includes("apakabar") || t.includes("gimana kabar")) {
    return getRandomItem(smallTalkResponses.howAreYou);
  } else if (t.includes("terima kasih") || t.includes("makasih") || t.includes("thanks")) {
    return getRandomItem(smallTalkResponses.thanks);
  } else if (t.includes("pagi")) {
    return getRandomItem(smallTalkResponses.timeGreetings.pagi);
  } else if (t.includes("siang")) {
    return getRandomItem(smallTalkResponses.timeGreetings.siang);
  } else if (t.includes("sore")) {
    return getRandomItem(smallTalkResponses.timeGreetings.sore);
  } else if (t.includes("malam")) {
    return getRandomItem(smallTalkResponses.timeGreetings.malam);
  } else {
    return getRandomItem(smallTalkResponses.greetings);
  }
}

function addQuickSuggestions(text: string): string {
  const suggestions = getRandomItem([
    "\n\nMau tanya yang lain? Coba:",
    "\n\nAtau kamu tertarik tahu tentang:",
    "\n\nButuh info lain? Ini pilihan cepat:"
  ]);
  const randomSuggestions = [...quickSuggestions].sort(() => Math.random() - 0.5).slice(0, 3);
  return `${text}${suggestions}\n• ${randomSuggestions.join('\n• ')}`;
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

  const { message, history, conversationState } = parsed.data;

  if (isSmallTalk(message)) {
    const response = getSmallTalkResponse(message);
    return NextResponse.json({
      answer: addQuickSuggestions(response),
    });
  }

  if (looksForbidden(message)) {
    return NextResponse.json({
      answer:
        addQuickSuggestions("Maaf ya, saya tidak bisa membantu untuk informasi internal atau sensitif. Silakan hubungi kami melalui halaman kontak ya!"),
    });
  }

  const intent = detectIntent(message);

  if (intent !== "general") {
    const context = await buildPublicContext();
    
    let faqAnswer = "";
    switch (intent) {
      case "faq_about":
        const site = await prisma.siteSetting.findFirst();
        faqAnswer = `Oh, RIMBA adalah singkatan dari Remaja Islam Masjid Al-Barkah loh! ${site?.description ? site.description : 'Kita adalah organisasi remaja masjid yang fokus pada kegiatan keislaman dan sosial.'}`;
        break;
      
      case "faq_location":
      case "faq_contact":
        const siteContact = await prisma.siteSetting.findFirst();
        faqAnswer = `Ini dia info kontak RIMBA:\n${siteContact?.address ? `📍 Alamat: ${siteContact.address}` : ''}\n${siteContact?.phone ? `📞 Telepon/WA: ${siteContact.phone}` : ''}\n${siteContact?.email ? `📧 Email: ${siteContact.email}` : ''}`;
        break;

      case "faq_agenda":
        const agendas = await prisma.agenda.findMany({ take: 3, orderBy: { date: 'asc' } });
        if (agendas.length > 0) {
          faqAnswer = `Oke, ini agenda terdekat RIMBA yang akan datang:\n${agendas.map((a, i) => `${i+1}. ${a.title} - ${new Date(a.date).toLocaleDateString('id-ID')}${a.location ? ` (${a.location})` : ''}`).join('\n')}`;
        } else {
          faqAnswer = "Hmm, untuk saat ini belum ada agenda terdekat ya. Kamu bisa cek halaman agenda untuk update terbaru nanti!";
        }
        break;

      case "faq_news":
        const news = await prisma.news.findMany({ take: 3, where: { isPublished: true }, orderBy: { publishedAt: 'desc' } });
        if (news.length > 0) {
          faqAnswer = `Berita terbaru dari RIMBA nih:\n${news.map((n, i) => `${i+1}. ${n.title} - ${new Date(n.publishedAt || n.createdAt).toLocaleDateString('id-ID')}`).join('\n')}`;
        } else {
          faqAnswer = "Belum ada berita terbaru saat ini. Nanti kita update di halaman berita ya!";
        }
        break;

      case "faq_register":
        faqAnswer = "Untuk mendaftar agenda, caranya mudah! Cukup buka halaman agenda, pilih agenda yang ingin kamu ikuti, lalu isi form pendaftaran yang sudah disediakan ya!";
        break;
    }

    if (faqAnswer) {
      return NextResponse.json({ answer: addQuickSuggestions(faqAnswer) });
    }
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
