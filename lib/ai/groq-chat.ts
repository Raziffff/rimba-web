export type GroqChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function groqChat(params: {
  message: string;
  history: GroqChatMessage[];
  context: string;
}) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return { error: "Konfigurasi AI belum tersedia. Isi GROQ_API_KEY." } as const;
  }

  const model = process.env.GROQ_MODEL_CHAT || "llama-3.1-8b-instant";

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

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
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

    console.error("Groq error:", {
      status: res.status,
      statusText: res.statusText,
      model,
      providerMessage: providerMessage ? providerMessage.slice(0, 500) : "",
    });

    if (res.status === 401) {
      return {
        error: "AI (Groq) ditolak (API key salah/expired). Coba periksa GROQ_API_KEY.",
      } as const;
    }

    if (res.status === 429) {
      return {
        error: "AI (Groq) sedang dibatasi (rate limit/kuota). Coba lagi nanti atau cek usage/limit.",
      } as const;
    }

    if (res.status === 404) {
      return {
        error: "Model AI (Groq) tidak tersedia. Coba ganti GROQ_MODEL_CHAT.",
      } as const;
    }

    return { error: "AI (Groq) sedang bermasalah. Coba lagi nanti." } as const;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return { error: "AI (Groq) tidak mengembalikan jawaban." } as const;
  }

  return { answer: content } as const;
}

