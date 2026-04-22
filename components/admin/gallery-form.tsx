"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gallerySchema, type GalleryInput } from "@/lib/validations";
import { addGalleryItem, uploadGalleryImage } from "@/app/admin/galeri/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GalleryForm() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GalleryInput>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      imageUrl: "",
    },
  });

  const imageUrl = watch("imageUrl");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadGalleryImage(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (!result?.publicUrl) {
        toast.error("Gagal mendapatkan URL gambar.");
        return;
      }

      setValue("imageUrl", result.publicUrl);
      toast.success("Gambar berhasil diunggah!");
    } catch (error) {
      const err = error as Error;
      console.error("Error uploading image:", err);
      toast.error("Gagal mengunggah gambar: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: GalleryInput) => {
    setLoading(true);
    try {
      const result = await addGalleryItem(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Foto berhasil ditambahkan!");
        reset();
        router.refresh();
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Tambah Foto Baru</CardTitle>
        <CardDescription>Pilih foto dari perangkat Anda untuk diunggah.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Unggah Gambar</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-colors hover:border-green-500 hover:bg-green-50/30"
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              ) : (
                <Upload className="h-8 w-8 text-slate-400" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">Klik untuk pilih foto</p>
                <p className="text-xs text-slate-500">Maksimal 5MB (JPG, PNG, WEBP)</p>
              </div>
            </div>
            {errors.imageUrl && (
              <p className="text-xs text-red-500">{errors.imageUrl.message}</p>
            )}
            <input type="hidden" {...register("imageUrl")} />
          </div>

          {imageUrl && (
            <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200">
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Judul Foto (Optional)</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Contoh: Rapat Kerja 2024"
              className="rounded-xl border-slate-300 py-6"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori (Optional)</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="Contoh: Kegiatan, Sarana"
              className="rounded-xl border-slate-300 py-6"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={loading || uploading || !imageUrl} 
            className="w-full rounded-xl bg-green-600 py-6 text-white hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Tambah ke Galeri
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
