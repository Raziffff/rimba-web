import Link from "next/link";
import Logo from "@/components/shared/logo";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Logo size={44} className="shadow-lg shadow-green-700/5" />
            <div>
              <p className="font-semibold text-slate-900">RIMBA</p>
              <p className="text-sm text-slate-500">
                Remaja Islam Masjid Albarkah
              </p>
            </div>
          </div>

          <p className="text-sm leading-7 text-slate-600">
            Website resmi organisasi remaja masjid untuk informasi kegiatan,
            berita, program, galeri, dan komunikasi dengan masyarakat.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900">
            Navigasi
          </h3>
          <div className="flex flex-col gap-3 text-sm text-slate-600">
            <Link href="/" className="hover:text-green-700">
              Beranda
            </Link>
            <Link href="/public/tentang" className="hover:text-green-700">
              Tentang
            </Link>
            <Link href="/public/program" className="hover:text-green-700">
              Program
            </Link>
            <Link href="/public/berita" className="hover:text-green-700">
              Berita
            </Link>
            <Link href="/public/galeri" className="hover:text-green-700">
              Galeri
            </Link>
            <Link href="/public/kontak" className="hover:text-green-700">
              Kontak
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900">
            Kontak
          </h3>
          <div className="space-y-3 text-sm text-slate-600">
            <p>Masjid Albarkah, Indonesia</p>
            <p>08xx-xxxx-xxxx</p>
            <p>rimba@albarkah.org</p>
            <p>@rimba.albarkah</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">
          © 2026 RIMBA. Website organisasi Remaja Islam Masjid Albarkah.
        </div>
      </div>
    </footer>
  );
}