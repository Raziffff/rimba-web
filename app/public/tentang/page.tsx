import Logo from "@/components/shared/logo";
import { CheckCircle2, Flag, Target, Users } from "lucide-react";

const values = [
  {
    title: "Berakhlak",
    description:
      "Menjunjung adab, saling menghormati, dan menjaga nilai-nilai islami dalam setiap aktivitas.",
    icon: CheckCircle2,
  },
  {
    title: "Berkarya",
    description:
      "Mendorong kreativitas remaja masjid dalam program, media dakwah, dan kegiatan sosial yang bermanfaat.",
    icon: Flag,
  },
  {
    title: "Berdampak",
    description:
      "Memberi kontribusi nyata bagi masjid dan masyarakat melalui aksi kolaboratif dan pembinaan berkelanjutan.",
    icon: Target,
  },
];

const structure = [
  { role: "Pembina", name: "Ustadz / Pengurus Masjid" },
  { role: "Ketua", name: "Ketua RIMBA" },
  { role: "Wakil Ketua", name: "Wakil Ketua RIMBA" },
  { role: "Sekretaris", name: "Sekretaris" },
  { role: "Bendahara", name: "Bendahara" },
  { role: "Divisi Dakwah", name: "Koordinator Divisi" },
  { role: "Divisi Sosial", name: "Koordinator Divisi" },
  { role: "Divisi Media", name: "Koordinator Divisi" },
];

export default function TentangPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            Tentang RIMBA
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Remaja Islam Masjid Albarkah
          </h1>
          <p className="mt-6 leading-8 text-slate-600">
            RIMBA adalah wadah pembinaan dan kolaborasi remaja masjid untuk
            tumbuh dalam iman, ilmu, dan aksi nyata. Kami membangun kultur
            organisasi yang sehat, program yang terarah, dan kegiatan sosial
            yang bermanfaat bagi masyarakat.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Target size={18} className="text-green-700" />
                Visi
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Membangun generasi remaja masjid yang aktif, berakhlak, dan
                berdampak.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Users size={18} className="text-green-700" />
                Misi
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Pembinaan, dakwah kreatif, kegiatan sosial, serta penguatan
                kepemimpinan dan kolaborasi remaja masjid.
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/60">
            <div className="flex items-center gap-4">
              <Logo size={56} className="shadow-none" />
              <div>
                <p className="text-sm font-semibold tracking-wide text-green-700">
                  RIMBA
                </p>
                <p className="text-sm text-slate-500">
                  Remaja Islam Masjid Albarkah
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {values.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                        <Icon size={20} />
                      </div>
                      <p className="text-lg font-semibold text-slate-900">
                        {item.title}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            Struktur Organisasi
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Kepengurusan Inti
          </h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            Struktur ini dapat disesuaikan sesuai kebutuhan organisasi.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {structure.map((item) => (
            <div
              key={item.role}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">{item.role}</p>
              <p className="mt-2 text-sm text-slate-500">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
