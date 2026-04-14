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
import { Loader2, Save, X, Calendar as CalendarIcon, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AgendaFormProps {
  initialData?: AgendaInput;
  id?: string;
}

export default function AgendaForm({ initialData, id }: AgendaFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgendaInput>({
    resolver: zodResolver(agendaSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      date: new Date(),
    },
  });

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
    } catch (error) {
      if ((error as Error).message === "NEXT_REDIRECT") {
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
              <CardTitle>Informasi Utama Agenda</CardTitle>
              <CardDescription>Detail kegiatan atau program kerja.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
