import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              Website Resmi Organisasi RIMBA
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Membangun generasi remaja masjid yang aktif, berakhlak, dan
              berdampak.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              RIMBA adalah wadah pembinaan, kolaborasi, dan pengembangan potensi
              remaja Islam Masjid Albarkah melalui program keislaman, sosial,
              edukasi, dan dakwah kreatif.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/public/program"
                className="inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Lihat Program
              </Link>

              <Link
                href="/public/berita"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-green-700 hover:text-green-700"
              >
                Baca Berita
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-slate-900">120+</p>
                <p className="mt-1 text-sm text-slate-500">Anggota Aktif</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-slate-900">35+</p>
                <p className="mt-1 text-sm text-slate-500">Kegiatan Tahunan</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-slate-900">10+</p>
                <p className="mt-1 text-sm text-slate-500">Program Unggulan</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/60">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-green-800 via-green-700 to-emerald-500 p-8 text-white">
                <p className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  Organisasi Remaja Masjid
                </p>
                <h2 className="text-3xl font-bold leading-tight">
                  Bersama RIMBA, tumbuh dalam iman, ilmu, dan aksi nyata.
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/85">
                  Menjadi ruang berkarya bagi generasi muda Islam untuk belajar,
                  melayani, dan memberi manfaat luas bagi masyarakat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            Program Unggulan
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Ruang tumbuh dan kontribusi bagi remaja masjid
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Program RIMBA dirancang untuk memperkuat karakter islami, kemampuan
            organisasi, dan kepedulian sosial.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">
              Kajian Remaja
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Program pembinaan rutin untuk memperkuat akidah, akhlak, dan
              semangat belajar Islam.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Aksi Sosial</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Kegiatan berbagi, bakti sosial, dan kepedulian terhadap masyarakat
              sekitar.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">
              Media Dakwah
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Publikasi konten islami, dokumentasi kegiatan, dan dakwah digital
              yang kreatif.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}