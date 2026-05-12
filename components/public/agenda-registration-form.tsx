"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  agendaId: string;
  agendaTitle: string;
  disabled: boolean;
  deadlineIso: string | null;
};

function formatDeadline(deadlineIso: string | null) {
  if (!deadlineIso) return null;
  const d = new Date(deadlineIso);
  if (Number.isNaN(d.getTime())) return null;
  return d.getTime();
}

export default function AgendaRegistrationForm({
  agendaId,
  agendaTitle,
  disabled,
  deadlineIso,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deadlineMs = useMemo(() => formatDeadline(deadlineIso), [deadlineIso]);
  const closed = useMemo(() => {
    if (!deadlineMs) return false;
    return Date.now() > deadlineMs;
  }, [deadlineMs]);

  const canSubmit = !disabled && !closed && name.trim() && phone.trim();

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/agenda/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agendaId,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal mengirim pendaftaran.");
      }

      setSuccess(
        `Pendaftaran untuk “${agendaTitle}” berhasil dikirim. Panitia akan menghubungi jika diperlukan.`,
      );
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
    } catch (e) {
      const err = e as Error;
      setError(
        err.message ||
          "Terjadi gangguan saat mengirim pendaftaran. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Pendaftaran ditutup karena agenda dibatalkan.
      </div>
    );
  }

  if (closed) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Pendaftaran sudah ditutup.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-900">Form pendaftaran</p>
      <p className="mt-1 text-sm text-slate-600">
        Isi data singkat berikut. Panitia dapat menghubungi Anda melalui nomor
        yang dicantumkan.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Nama</p>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama lengkap"
            className="rounded-xl border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">No. WhatsApp</p>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
            className="rounded-xl border-slate-200"
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Email (opsional)</p>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="rounded-xl border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Catatan (opsional)</p>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: asal sekolah, kelas, dll"
            className="rounded-xl border-slate-200"
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

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Dengan mengirim form ini, Anda menyetujui data digunakan untuk
          keperluan pendaftaran kegiatan.
        </p>
        <Button
          type="button"
          onClick={() => void submit()}
          disabled={!canSubmit || loading}
          className="rounded-xl bg-green-600 hover:bg-green-700"
        >
          {loading ? "Mengirim..." : "Daftar"}
        </Button>
      </div>
    </div>
  );
}
