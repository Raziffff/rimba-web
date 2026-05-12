import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const FeedbackSchema = z.object({
  category: z.enum(["SUGGESTION", "COMPLAINT", "QUESTION"]).optional(),
  name: z.string().max(120).optional().nullable(),
  contact: z.string().max(120).optional().nullable(),
  message: z.string().min(10).max(2000),
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
  const key = `feedback_rl:${ip}`;
  const now = Date.now();
  const windowMs = 60_000;
  const max = 10;

  const store = globalThis as unknown as {
    __feedbackRateLimit?: Map<string, RateState>;
  };

  store.__feedbackRateLimit ??= new Map<string, RateState>();
  const existing = store.__feedbackRateLimit.get(key);

  if (!existing || now - existing.windowStartMs > windowMs) {
    store.__feedbackRateLimit.set(key, { windowStartMs: now, count: 1 });
    return true;
  }

  if (existing.count >= max) return false;

  existing.count += 1;
  store.__feedbackRateLimit.set(key, existing);
  return true;
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

  const parsed = FeedbackSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid." }, { status: 400 });
  }

  const { category, name, contact, message } = parsed.data;

  try {
    await prisma.feedbackMessage.create({
      data: {
        category: category ?? "SUGGESTION",
        name: name ?? null,
        contact: contact ?? null,
        message,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengirim pesan. Coba lagi nanti." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
