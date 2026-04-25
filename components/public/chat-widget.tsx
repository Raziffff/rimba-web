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

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya Tanya RIMBA. Silakan tanya seputar agenda, berita, program, atau kontak.",
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

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyForApi,
        }),
      });

      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses permintaan.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "Maaf, saya belum bisa menjawab." },
      ]);
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
                          : "max-w-[85%] rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-900"
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
                  placeholder="Tulis pertanyaan..."
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

