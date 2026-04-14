"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberSchema, type MemberInput } from "@/lib/validations";
import { createMember, updateMember } from "@/app/admin/anggota/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, User, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface MemberFormProps {
  initialData?: MemberInput & { id: string };
  onSuccess?: () => void;
}

export default function MemberForm({ initialData, onSuccess }: MemberFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MemberInput>({
    resolver: zodResolver(memberSchema),
    defaultValues: initialData || {
      name: "",
      position: "",
      category: "",
      imageUrl: "",
      order: 0,
    },
  });

  const imageUrl = watch("imageUrl");

  const onSubmit = async (data: MemberInput) => {
    setLoading(true);
    try {
      let result;
      if (initialData?.id) {
        result = await updateMember(initialData.id, data);
      } else {
        result = await createMember(data);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(initialData ? "Anggota diperbarui!" : "Anggota berhasil ditambahkan!");
        if (!initialData) reset();
        if (onSuccess) onSuccess();
        router.refresh();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {initialData ? <User size={20} /> : <UserPlus size={20} />}
          {initialData ? "Edit Anggota" : "Tambah Anggota Baru"}
        </CardTitle>
        <CardDescription>
          Kelola informasi anggota dan jabatan mereka di organisasi.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Contoh: Ahmad Fauzi"
              className="rounded-xl border-slate-300 py-6"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Jabatan</Label>
            <Input
              id="position"
              {...register("position")}
              placeholder="Contoh: Ketua Umum, Sekretaris"
              className="rounded-xl border-slate-300 py-6"
            />
            {errors.position && (
              <p className="text-xs text-red-500">{errors.position.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori / Divisi</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="Contoh: Pengurus Inti, Divisi Dakwah"
              className="rounded-xl border-slate-300 py-6"
            />
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL Foto (Optional)</Label>
            <Input
              id="imageUrl"
              {...register("imageUrl")}
              placeholder="https://example.com/photo.jpg"
              className="rounded-xl border-slate-300 py-6"
            />
            {imageUrl && (
              <div className="mt-2 relative h-20 w-20 overflow-hidden rounded-full border border-slate-200">
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Urutan Tampil (Optional)</Label>
            <Input
              id="order"
              type="number"
              {...register("order", { valueAsNumber: true })}
              className="rounded-xl border-slate-300 py-6"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-6 font-semibold"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {initialData ? "Simpan Perubahan" : "Tambah Anggota"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
