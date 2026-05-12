import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const RegistrationSchema = z.object({
  agendaId: z.string().min(1),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(30),
  email: z.string().email().nullable().optional(),
  notes: z.string().max(300).nullable().optional(),
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
  const key = `agenda_registration_rl:${ip}`;
  const now = Date.now();
  const windowMs = 60_000;
  const max = 8;

  const store = globalThis as unknown as {
    __agendaRegistrationRateLimit?: Map<string, RateState>;
  };

  store.__agendaRegistrationRateLimit ??= new Map<string, RateState>();
  const existing = store.__agendaRegistrationRateLimit.get(key);

  if (!existing || now - existing.windowStartMs > windowMs) {
    store.__agendaRegistrationRateLimit.set(key, { windowStartMs: now, count: 1 });
    return true;
  }

  if (existing.count >= max) return false;

  existing.count += 1;
  store.__agendaRegistrationRateLimit.set(key, existing);
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

  const parsed = RegistrationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid." }, { status: 400 });
  }

  const { agendaId, name, phone, email, notes } = parsed.data;

  const agenda = await prisma.agenda.findUnique({
    where: { id: agendaId },
    select: { id: true, status: true, registrationDeadline: true },
  });

  if (!agenda) {
    return NextResponse.json({ error: "Agenda tidak ditemukan." }, { status: 404 });
  }

  if (agenda.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Pendaftaran ditutup karena agenda dibatalkan." },
      { status: 400 },
    );
  }

  if (agenda.registrationDeadline && Date.now() > agenda.registrationDeadline.getTime()) {
    return NextResponse.json({ error: "Pendaftaran sudah ditutup." }, { status: 400 });
  }

  try {
    await prisma.agendaRegistration.create({
      data: {
        agendaId,
        name,
        phone,
        email: email ?? null,
        notes: notes ?? null,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal menyimpan pendaftaran. Coba lagi nanti." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
