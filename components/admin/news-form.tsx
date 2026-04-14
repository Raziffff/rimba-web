"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsSchema, type NewsInput } from "@/lib/validations";
import { createNews, updateNews } from "@/app/admin/berita/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import slugify from "slugify";
import { Loader2, Save, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NewsFormProps {
  initialData?: NewsInput;
  id?: string;
}

export default function NewsForm({ initialData, id }: NewsFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewsInput>({
    resolver: zodResolver(newsSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      content: "",
      isPublished: false,
    },
  });

  const title = watch("title");
  const coverImage = watch("coverImage");
  const isPublished = watch("isPublished");

  const generateSlug = () => {
    if (title) {
      const slug = slugify(title, { lower: true, strict: true });
      setValue("slug", slug, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: NewsInput) => {
    setLoading(true);
    try {
      let result;
      if (id) {
        result = await updateNews(id, data);
      } else {
        result = await createNews(data);
      }

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      } else {
        toast.success(id ? "Berita diperbarui!" : "Berita berhasil dibuat!");
        router.push("/admin/berita");
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
              <CardTitle>Konten Berita</CardTitle>
              <CardDescription>Tulis isi berita Anda di sini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Berita</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Masukkan judul berita"
                  className="rounded-xl border-slate-300 py-6"
                />
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug">Slug / URL</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateSlug}
                    className="text-xs text-green-700 hover:bg-green-50"
                  >
                    Generate dari Judul
                  </Button>
                </div>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="contoh: informasi-lomba-ramadhan"
                  className="rounded-xl border-slate-300 py-6 font-mono text-xs"
                />
                {errors.slug && (
                  <p className="text-xs text-red-500">{errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Ringkasan Singkat (Optional)</Label>
                <Textarea
                  id="excerpt"
                  {...register("excerpt")}
                  placeholder="Tulis ringkasan berita maksimal 300 karakter..."
                  className="rounded-xl border-slate-300 min-h-[100px]"
                />
                {errors.excerpt && (
                  <p className="text-xs text-red-500">{errors.excerpt.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Isi Berita Lengkap</Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  placeholder="Tulis isi berita secara lengkap..."
                  className="rounded-xl border-slate-300 min-h-[400px] leading-relaxed"
                />
                {errors.content && (
                  <p className="text-xs text-red-500">{errors.content.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Pengaturan Publikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="isPublished" className="flex flex-col gap-1">
                  <span>Publikasikan Langsung?</span>
                  <span className="text-xs font-normal text-slate-500">
                    Jika tidak, berita akan disimpan sebagai draft.
                  </span>
                </Label>
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={(checked) => setValue("isPublished", checked)}
                />
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <Label htmlFor="coverImage">URL Gambar Sampul (Optional)</Label>
                <div className="space-y-4">
                  <Input
                    id="coverImage"
                    {...register("coverImage")}
                    placeholder="https://example.com/image.jpg"
                    className="rounded-xl border-slate-300"
                  />
                  
                  {coverImage && (
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200">
                      <img 
                        src={coverImage} 
                        alt="Preview" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {!coverImage && (
                    <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                      <ImageIcon size={32} strokeWidth={1.5} />
                      <p className="mt-2 text-xs">Belum ada gambar</p>
                    </div>
                  )}
                </div>
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
                    Simpan Berita
                  </>
                )}
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-xl py-6 border-slate-200"
              >
                <Link href="/admin/berita">
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
