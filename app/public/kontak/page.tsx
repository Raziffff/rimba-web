import prisma from "@/lib/prisma";
import FeedbackForm from "@/components/public/feedback-form";
import { Mail, MapPin, Phone } from "lucide-react";

export default async function KontakPage() {
  const siteSetting = await prisma.siteSetting.findFirst();

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
          Kontak
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
          Hubungi RIMBA
        </h1>
        <p className="mt-6 leading-8 text-slate-600">
          Informasi kontak resmi dan form masukan/pengaduan untuk pengurus.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xl font-bold text-slate-900">Kontak Resmi</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Gunakan kontak berikut untuk komunikasi terkait kegiatan atau
            informasi lebih lanjut.
          </p>

          <div className="mt-6 space-y-4 text-sm text-slate-700">
            {siteSetting?.address && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-green-700" />
                <p className="leading-7">{siteSetting.address}</p>
              </div>
            )}
            {siteSetting?.phone && (
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-green-700" />
                <p className="leading-7">{siteSetting.phone}</p>
              </div>
            )}
            {siteSetting?.email && (
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-green-700" />
                <p className="leading-7">{siteSetting.email}</p>
              </div>
            )}

            {!siteSetting?.address && !siteSetting?.phone && !siteSetting?.email && (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
                Informasi kontak belum tersedia.
              </p>
            )}
          </div>
        </div>

        <FeedbackForm />
      </div>
    </section>
  );
}
