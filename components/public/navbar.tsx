"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "@/components/shared/logo";

const navItems = [
  { href: "/public", label: "Beranda" },
  { href: "/public/agenda", label: "Agenda" },
  { href: "/public/tentang", label: "Tentang" },
  { href: "/public/program", label: "Program" },
  { href: "/public/berita", label: "Berita" },
  { href: "/public/galeri", label: "Galeri" },
  { href: "/public/kontak", label: "Kontak" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/public" className="flex items-center gap-3">
          <Logo size={44} className="shadow-lg shadow-green-700/10" />
          <div>
            <p className="text-sm font-semibold tracking-wide text-green-700">
              RIMBA
            </p>
            <p className="text-xs text-slate-500">
              Remaja Islam Masjid Albarkah
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-green-700"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/login"
            className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Login Admin
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className="inline-flex rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-green-700"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/login"
              className="mt-2 rounded-xl bg-green-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-800"
              onClick={() => setOpen(false)}
            >
              Login Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
