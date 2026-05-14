"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agendaSchema, type AgendaInput } from "@/lib/validations";
import { createAgenda, updateAgenda } from "@/app/admin/agenda/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, X, Calendar as CalendarIcon, MapPin, Sparkles, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AgendaFormProps {
  initialData?: AgendaInput;
  id?: string;
}

export default function AgendaForm({ initialData, id }: AgendaFormProps) {
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AgendaInput>({
    resolver: zodResolver(agendaSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      date: new Date(),
      status: "SCHEDULED",
    },
  });

  const title = watch("title");
  const description = watch("description");

  const generateAICaption = async () => {
    if (!title || !description) {
      toast.error("Mohon isi judul dan deskripsi agenda terlebih dahulu");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: description, type: "agenda" }),
      });

      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setGeneratedCaption(data.caption);
      }
    } catch (error) {
      toast.error("Gagal terhubung ke layanan AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCaption);
    setIsCopied(true);
    toast.success("Caption berhasil disalin!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const onSubmit = async (data: AgendaInput) => {
    setLoading(true);
    try {
      let result;
      if (id) {
        result = await updateAgenda(id, data);
      } else {
        result = await createAgenda(data);
      }

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      } else {
        toast.success(id ? "Agenda diperbarui!" : "Agenda berhasil dibuat!");
        router.push("/admin/agenda");
        router.refresh();
      }
    } catch (e) {
      if ((e as Error).message === "NEXT_REDIRECT") {
        return;
      }
      toast.error("Terjadi kesalahan yang tidak terduga.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informasi Utama Agenda</CardTitle>
                  <CardDescription>Detail kegiatan atau program kerja.</CardDescription>
                </div>
                
                <div className="flex gap-2">
                  {generatedCaption && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="rounded-full border-green-200 text-green-700 hover:bg-green-50"
                    >
                      {isCopied ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                      {isCopied ? "Tersalin" : "Salin Caption AI"}
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateAICaption}
                    disabled={isGenerating}
                    className="rounded-full border-green-700 text-green-700 hover:bg-green-700 hover:text-white"
                  >
                    {isGenerating ? (
                      <Loader2 size={14} className="mr-2 animate-spin" />
                    ) : (
                      <Sparkles size={14} className="mr-2" />
                    )}
                    {isGenerating ? "Menganalisis..." : "Generate Caption AI"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {generatedCaption && (
                <div className="mb-6 rounded-2xl bg-green-50/50 p-4 border border-green-100">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-green-700">Hasil AI Caption:</p>
                  <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{generatedCaption}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Judul Agenda</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Masukkan judul kegiatan"
                  className="rounded-xl border-slate-300 py-6"
                />
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Lengkap</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Tulis deskripsi kegiatan secara lengkap..."
                  className="rounded-xl border-slate-300 min-h-[200px] leading-relaxed"
                />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Syarat Pendaftaran (Opsional)</Label>
                <Textarea
                  id="requirements"
                  {...register("requirements")}
                  placeholder="Contoh: membawa alat tulis, berpakaian sopan, usia minimal 12 tahun, dll"
                  className="rounded-xl border-slate-300 min-h-[120px] leading-relaxed"
                />
                {errors.requirements && (
                  <p className="text-xs text-red-500">{errors.requirements.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusNote">Catatan Perubahan (Opsional)</Label>
                <Textarea
                  id="statusNote"
                  {...register("statusNote")}
                  placeholder="Contoh: jadwal diundur karena cuaca, lokasi pindah, dll"
                  className="rounded-xl border-slate-300 min-h-[120px] leading-relaxed"
                />
                {errors.statusNote && (
                  <p className="text-xs text-red-500">{errors.statusNote.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Waktu & Lokasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <CalendarIcon size={16} />
                  Tanggal Pelaksanaan
                </Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date", { valueAsDate: true })}
                  className="rounded-xl border-slate-300"
                />
                {errors.date && (
                  <p className="text-xs text-red-500">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationDeadline" className="flex items-center gap-2">
                  <CalendarIcon size={16} />
                  Batas Pendaftaran (Opsional)
                </Label>
                <Input
                  id="registrationDeadline"
                  type="date"
                  {...register("registrationDeadline", { valueAsDate: true })}
                  className="rounded-xl border-slate-300"
                />
                {errors.registrationDeadline && (
                  <p className="text-xs text-red-500">
                    {errors.registrationDeadline.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin size={16} />
                  Lokasi / Tempat
                </Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="Contoh: Aula Masjid Al-Barkah"
                  className="rounded-xl border-slate-300"
                />
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  {...register("category")}
                  placeholder="Contoh: Lomba, Kajian, Sosial"
                  className="rounded-xl border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status Agenda</Label>
                <select
                  id="status"
                  {...register("status")}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900"
                >
                  <option value="SCHEDULED">Terjadwal</option>
                  <option value="CHANGED">Diubah</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-6 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Agenda
                  </>
                )}
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-xl py-6 border-slate-200"
              >
                <Link href="/admin/agenda">
                  <X className="mr-2 h-4 w-4" />
                  Batal
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
}
