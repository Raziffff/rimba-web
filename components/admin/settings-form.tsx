"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteSettingSchema, type SiteSettingInput } from "@/lib/validations";
import { updateSiteSettings } from "@/app/admin/pengaturan/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, Globe, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";

interface SettingsFormProps {
  initialData?: SiteSettingInput;
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteSettingInput>({
    resolver: zodResolver(siteSettingSchema),
    defaultValues: initialData || {
      organizationName: "Organisasi RIMBA",
    },
  });

  const onSubmit = async (data: SiteSettingInput) => {
    setLoading(true);
    try {
      const result = await updateSiteSettings(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Pengaturan berhasil disimpan!");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} className="text-green-700" />
                Profil Organisasi
              </CardTitle>
              <CardDescription>Informasi umum tentang organisasi Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Nama Organisasi</Label>
                <Input
                  id="organizationName"
                  {...register("organizationName")}
                  placeholder="Masukkan nama organisasi"
                  className="rounded-xl border-slate-300 py-6"
                />
                {errors.organizationName && (
                  <p className="text-xs text-red-500">{errors.organizationName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Singkat</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Ceritakan tentang organisasi Anda..."
                  className="rounded-xl border-slate-300 min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin size={16} />
                  Alamat Kantor
                </Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Alamat lengkap organisasi"
                  className="rounded-xl border-slate-300 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} className="text-green-700" />
                Media Sosial
              </CardTitle>
              <CardDescription>Link akun media sosial organisasi.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram size={16} />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  {...register("instagram")}
                  placeholder="username_ig"
                  className="rounded-xl border-slate-300 py-6"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube" className="flex items-center gap-2">
                  <Youtube size={16} />
                  YouTube
                </Label>
                <Input
                  id="youtube"
                  {...register("youtube")}
                  placeholder="Channel Name / Link"
                  className="rounded-xl border-slate-300 py-6"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Kontak & Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone size={16} />
                  Nomor Telepon / WA
                </Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="0812xxxx"
                  className="rounded-xl border-slate-300 py-6"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail size={16} />
                  Email Resmi
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="org@example.com"
                  className="rounded-xl border-slate-300 py-6"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <Label htmlFor="logoUrl">URL Logo Organisasi</Label>
                <Input
                  id="logoUrl"
                  {...register("logoUrl")}
                  placeholder="https://example.com/logo.png"
                  className="rounded-xl border-slate-300"
                />
              </div>
            </CardContent>
            <CardFooter className="pt-6">
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
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
}
