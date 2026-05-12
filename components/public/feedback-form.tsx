"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FeedbackCategory = "SUGGESTION" | "COMPLAINT" | "QUESTION";

export default function FeedbackForm() {
  const [category, setCategory] = useState<FeedbackCategory>("SUGGESTION");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = message.trim().length >= 10;

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          name: name.trim() || null,
          contact: contact.trim() || null,
          message: message.trim(),
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal mengirim pesan.");
      }

      setSuccess("Pesan berhasil dikirim. Terima kasih atas masukan Anda.");
      setName("");
      setContact("");
      setMessage("");
      setCategory("SUGGESTION");
    } catch (e) {
      const err = e as Error;
      setError(err.message || "Terjadi gangguan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xl font-bold text-slate-900">Masukan / Pengaduan</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        Sampaikan saran, pertanyaan, atau pengaduan. Pesan akan diteruskan ke
        pengurus.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Kategori</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            <option value="SUGGESTION">Masukan</option>
            <option value="QUESTION">Pertanyaan</option>
            <option value="COMPLAINT">Pengaduan</option>
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            Kontak (opsional)
          </p>
          <Input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="No. WhatsApp atau email"
            className="rounded-xl border-slate-200"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Nama (opsional)</p>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama"
            className="rounded-xl border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Pesan</p>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis pesan minimal 10 karakter..."
            className="min-h-[120px] rounded-xl border-slate-200"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Jangan cantumkan kata sandi atau data sensitif.
        </p>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={!canSubmit || loading}
          className="rounded-xl bg-green-600 hover:bg-green-700"
        >
          {loading ? "Mengirim..." : "Kirim"}
        </Button>
      </div>
    </div>
  );
}

