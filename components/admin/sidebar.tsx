"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  ImageIcon,
  Users,
  WalletCards,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import Logo from "@/components/shared/logo";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/berita", label: "Berita", icon: Newspaper },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/galeri", label: "Galeri", icon: ImageIcon },
  { href: "/admin/anggota", label: "Anggota", icon: Users },
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

        <div className="border-t border-slate-200 p-4 space-y-2">
          <Button
            variant="ghost"
            asChild
            className="w-full justify-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <Link href="/public" target="_blank">
              <ExternalLink size={18} />
              Lihat Situs
            </Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/public" })}
            className="w-full justify-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} />
            Keluar
          </Button>
        </div>
      </div>
    </aside>
  );
}