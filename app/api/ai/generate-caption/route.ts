import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, type } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Judul dan konten wajib diisi" },
        { status: 400 }
      );
    }

    const systemPrompt = `
      Anda adalah admin media sosial yang cerdas, kreatif, dan islami untuk organisasi RIMBA (Remaja Islam Masjid Albarkah).
      Tugas Anda adalah membuat draf caption media sosial (Instagram/WhatsApp) berdasarkan data yang diberikan.
      
      Aturan:
      1. Gunakan Bahasa Indonesia yang santun, semangat, dan persuasif.
      2. Gunakan emoji yang relevan (🌙, ✨, 🕌, 🚀, 📢).
      3. Sertakan hashtag: #RIMBA #RemajaMasjid #Albarkah #IslamModern.
      4. Jika ini adalah Agenda, ajak audiens untuk mendaftar atau hadir.
      5. Jika ini adalah Berita, ajak audiens untuk membaca lebih lanjut atau mengambil hikmah.
      6. Jangan terlalu panjang, buatlah yang menarik dan 'to the point'.
    `;

    const userPrompt = `
      Tipe: ${type === "agenda" ? "Agenda Kegiatan" : "Berita Organisasi"}
      Judul: ${title}
      Isi/Deskripsi: ${content}
      
      Buatkan 1 draf caption yang menarik!
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    const caption = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({ caption });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("AI Error:", error.message);
    return NextResponse.json(
      { error: "Gagal menghasilkan caption AI" },
      { status: 500 }
    );
  }
}
