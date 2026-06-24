"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ConversationStep = "idle" | "choosing_topic" | "waiting_for_selection" | "providing_info";

const quickQuestions = [
  { label: "Agenda terdekat", text: "1" },
  { label: "Berita terbaru", text: "2" },
  { label: "Lokasi & Kontak", text: "3" },
  { label: "Tentang RIMBA", text: "4" },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<ConversationStep>("choosing_topic");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya Tanya RIMBA. Ada yang bisa saya bantu?\n\nPilih topik dibawah ini atau tanyakan langsung:\n1. Agenda terdekat\n2. Berita terbaru\n3. Lokasi dan kontak\n4. Tentang RIMBA",
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const historyForApi = useMemo(() => {
    const trimmed = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-12);
    return trimmed;
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages]);

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: text }]);

    let responseText = "";

    if (step === "choosing_topic" || step === "waiting_for_selection") {
      if (text === "1") {
        responseText = "Baik, saya akan menampilkan agenda terdekat...";
      } else if (text === "2") {
        responseText = "Baik, saya akan menampilkan berita terbaru...";
      } else if (text === "3") {
        responseText = "Baik, berikut informasi lokasi dan kontak RIMBA...";
      } else if (text === "4") {
        responseText = "Baik, berikut informasi tentang RIMBA...";
      }
    }

    if (responseText) {
      setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: responseText ? (text === "1" ? "Agenda terdekat apa?" : text === "2" ? "Berita terbaru apa?" : text === "3" ? "Kontak RIMBA di mana?" : "Apa itu RIMBA?") : text,
          history: historyForApi,
        }),
      });

      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses permintaan.");
      }

      if (responseText) {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: "assistant", content: data.answer || "Maaf, saya belum bisa menjawab." };
          return newMessages;
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer || "Maaf, saya belum bisa menjawab." },
        ]);
      }
    } catch (e) {
      const err = e as Error;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err.message ||
            "Maaf, terjadi gangguan. Silakan coba lagi atau hubungi kami lewat halaman kontak.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[min(420px,calc(100vw-2rem))]">
          <Card className="rounded-2xl border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Tanya RIMBA</p>
                  <p className="text-xs text-slate-500">Chatbot informasi publik</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-9 rounded-xl p-0"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div
              ref={listRef}
              className="max-h-[55vh] space-y-3 overflow-y-auto px-4 py-3"
            >
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      disabled={loading}
                      onClick={() => void send(q.text)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-green-600 hover:text-green-700 disabled:opacity-60"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={idx}
                    className={isUser ? "flex justify-end" : "flex justify-start"}
                  >
                    <div
                      className={
                        isUser
                          ? "max-w-[85%] rounded-2xl bg-green-600 px-3 py-2 text-sm text-white"
                          : "max-w-[85%] rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-900 whitespace-pre-line"
                      }
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 px-4 py-3">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tulis pertanyaan atau pilih topik..."
                  className="min-h-[44px] resize-none rounded-xl border-slate-200"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => void send()}
                  disabled={loading || !input.trim()}
                  className="h-[44px] rounded-xl bg-green-600 px-4 text-white hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Jika informasi tidak tersedia, chatbot akan mengarahkan ke halaman kontak.
              </p>
            </div>
          </Card>
        </div>
      )}

      {!open && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-green-600 px-4 py-6 text-white shadow-lg hover:bg-green-700"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Tanya RIMBA
          </Button>
        </div>
      )}
    </>
  );
}

