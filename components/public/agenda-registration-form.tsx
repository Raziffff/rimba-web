"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Phone, School, User, Calendar, MessageSquare, ArrowRight } from "lucide-react";
import { isLombaCategory } from "@/lib/agenda-category";

type Props = {
  agendaId: string;
  agendaTitle: string;
  category: string | null;
  disabled: boolean;
  deadlineIso: string | null;
  adminPhone: string;
};

function formatDeadline(deadlineIso: string | null) {
  if (!deadlineIso) return null;
  const d = new Date(deadlineIso);
  if (Number.isNaN(d.getTime())) return null;
  return d.getTime();
}

function buildWaUrl(
  adminPhone: string,
  msg: string,
) {
  let formattedPhone = adminPhone.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "62" + formattedPhone.slice(1);
  }
  if (!formattedPhone) {
    formattedPhone = "6281513983136";
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
}

export default function AgendaRegistrationForm({
  agendaId,
  agendaTitle,
  category,
  disabled,
  deadlineIso,
  adminPhone,
}: Props) {
  const isLomba = isLombaCategory(category);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [institution, setInstitution] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const deadlineMs = useMemo(() => formatDeadline(deadlineIso), [deadlineIso]);
  const closed = useMemo(() => {
    if (!deadlineMs) return false;
    return Date.now() > deadlineMs;
  }, [deadlineMs]);

  const canSubmit =
    !disabled &&
    !closed &&
    Boolean(name.trim() && phone.trim()) &&
    (isLomba ? Boolean(age.trim() && institution.trim()) : true);

  const waUrl = useMemo(() => {
    if (isLomba) {
      const msg = `Assalamu'alaikum Admin RIMBA,

Saya ingin mengonfirmasi pendaftaran lomba melalui website. Berikut adalah data pendaftaran saya:

📝 *DATA PENDAFTARAN LOMBA*
• *Nama Peserta:* ${name.trim()}
• *Cabang Lomba:* ${agendaTitle}
• *Umur:* ${age.trim()}
• *Asal Sekolah/TPA:* ${institution.trim()}
${notes.trim() ? `• *Catatan:* ${notes.trim()}\n` : ""}
Mohon informasi selanjutnya terkait perlombaan ini. Terima kasih!`;
      return buildWaUrl(adminPhone, msg);
    }

    const msg = `Assalamu'alaikum Admin RIMBA,

Saya ingin mengonfirmasi pendaftaran kegiatan melalui website. Berikut adalah data pendaftaran saya:

📝 *DATA PENDAFTARAN KEGIATAN*
• *Nama:* ${name.trim()}
• *Kegiatan:* ${agendaTitle}
• *No. WhatsApp:* ${phone.trim()}
${institution.trim() ? `• *Asal Instansi/Sekolah:* ${institution.trim()}\n` : ""}${notes.trim() ? `• *Catatan:* ${notes.trim()}\n` : ""}
Mohon informasi selanjutnya terkait kegiatan ini. Terima kasih!`;
    return buildWaUrl(adminPhone, msg);
  }, [isLomba, name, phone, age, institution, notes, agendaTitle, adminPhone]);

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const combinedNotes = isLomba
      ? `Umur: ${age.trim()} | Sekolah/TPA: ${institution.trim()}${notes.trim() ? ` | Catatan: ${notes.trim()}` : ""}`
      : [
          institution.trim() ? `Instansi/Sekolah: ${institution.trim()}` : null,
          notes.trim() ? `Catatan: ${notes.trim()}` : null,
        ]
          .filter(Boolean)
          .join(" | ") || null;

    try {
      const res = await fetch("/api/agenda/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agendaId,
          name: name.trim(),
          phone: phone.trim(),
          email: null,
          notes: combinedNotes,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal mengirim pendaftaran.");
      }

      setSuccess(
        `Pendaftaran untuk “${agendaTitle}” berhasil disimpan. Silakan klik tombol di bawah untuk konfirmasi ke WhatsApp Admin.`,
      );
      setIsSubmitted(true);
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm text-center">
        {isLomba
          ? "Pendaftaran ditutup karena perlombaan dibatalkan."
          : "Pendaftaran ditutup karena kegiatan dibatalkan."}
      </div>
    );
  }

  if (closed) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm text-center">
        Pendaftaran sudah ditutup.
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50/50 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Pendaftaran Berhasil!</h3>
            <p className="text-sm text-slate-600">{success ?? "Data Anda telah tersimpan di sistem kami."}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 space-y-3.5 text-sm shadow-inner">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ringkasan Pendaftaran</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-slate-500 text-xs">{isLomba ? "Nama Lengkap" : "Nama"}</p>
              <p className="font-semibold text-slate-900">{name}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">No. WhatsApp</p>
              <p className="font-semibold text-slate-900">{phone}</p>
            </div>
            {isLomba && (
              <div>
                <p className="text-slate-500 text-xs">Umur</p>
                <p className="font-semibold text-slate-900">{age} Tahun</p>
              </div>
            )}
            {(isLomba || institution.trim()) && (
              <div>
                <p className="text-slate-500 text-xs">
                  {isLomba ? "Asal Sekolah/TPA" : "Asal Instansi / Sekolah"}
                </p>
                <p className="font-semibold text-slate-900">{institution || "—"}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-xs leading-5 text-amber-800">
            <p className="font-semibold flex items-center gap-1.5 mb-1 text-amber-900">
              <MessageSquare size={14} /> Langkah Terakhir:
            </p>
            {isLomba
              ? "Harap lakukan konfirmasi ke WhatsApp Panitia untuk memverifikasi pendaftaran Anda dan mendapatkan info nomor urut peserta serta jadwal technical meeting."
              : "Harap lakukan konfirmasi ke WhatsApp Panitia untuk memverifikasi pendaftaran Anda."}
          </div>

          <Button
            asChild
            className="w-full rounded-2xl bg-green-600 hover:bg-green-700 py-6 text-base font-semibold shadow-md flex items-center justify-center gap-2 group transition-all"
          >
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              Hubungi Admin via WhatsApp
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">
        {isLomba ? "Formulir Pendaftaran Perlombaan" : "Formulir Pendaftaran Kegiatan"}
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        {isLomba
          ? "Lengkapi formulir di bawah ini dengan data peserta yang valid untuk mengikuti perlombaan."
          : "Lengkapi formulir di bawah ini untuk mendaftar kegiatan RIMBA."}
      </p>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <User size={15} className="text-slate-400" />
            {isLomba ? "Nama Lengkap Peserta" : "Nama Lengkap"}
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isLomba ? "Contoh: Muhammad Rizky" : "Contoh: Ahmad Fauzi"}
            className="rounded-xl border-slate-200 focus:border-green-600 focus:ring-green-600/10"
          />
        </div>

        <div className={isLomba ? "grid gap-4 sm:grid-cols-2" : "space-y-2"}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Phone size={15} className="text-slate-400" />
              {isLomba ? "No. WhatsApp Pendamping/Ortu" : "No. WhatsApp"}
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="rounded-xl border-slate-200 focus:border-green-600"
            />
          </div>

          {isLomba && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar size={15} className="text-slate-400" />
                Umur Peserta (Tahun)
              </label>
              <Input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Contoh: 10"
                className="rounded-xl border-slate-200 focus:border-green-600"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <School size={15} className="text-slate-400" />
            {isLomba ? "Asal Sekolah / TPA" : "Asal Instansi / Sekolah (Opsional)"}
          </label>
          <Input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder={
              isLomba
                ? "Contoh: SD IT Al-Barokah / TPA Baiturrahman"
                : "Contoh: SMAN 1, Universitas X, atau lembaga lain"
            }
            className="rounded-xl border-slate-200 focus:border-green-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <MessageSquare size={15} className="text-slate-400" />
            Catatan Tambahan (Opsional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Masukkan catatan khusus atau keterangan tambahan jika ada..."
            rows={3}
            className="rounded-xl border-slate-200 focus:border-green-600"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="pt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400 leading-normal max-w-sm">
            Dengan menekan tombol Daftar, data Anda akan disimpan secara aman oleh panitia RIMBA.
          </p>
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={!canSubmit || loading}
            className="rounded-xl bg-green-600 hover:bg-green-700 px-6 py-5 font-semibold text-sm transition-all"
          >
            {loading ? "Mengirim..." : isLomba ? "Daftar Lomba" : "Daftar Kegiatan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
