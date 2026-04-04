"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  ImageIcon,
  WalletCards,
  Settings,
} from "lucide-react";
import Logo from "@/components/shared/logo";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/berita", label: "Berita", icon: Newspaper },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/galeri", label: "Galeri", icon: ImageIcon },
  { href: "/admin/keuangan", label: "Keuangan", icon: WalletCards },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 border-r border-slate-200 bg-white xl:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-6 py-6">
          <div className="flex items-center gap-3">
            <Logo size={48} className="shadow-lg shadow-green-700/10" />
            <div>
              <p className="text-sm font-semibold tracking-wide text-green-700">
                RIMBA Admin
              </p>
              <p className="text-xs text-slate-500">
                Dashboard Pengelolaan
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-green-700 text-white shadow-lg shadow-green-700/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              Website Organisasi
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              Kelola berita, agenda, galeri, dan pengaturan website RIMBA dari
              satu dashboard.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}