"use client";

import { Bell, Search, LogOut, ExternalLink } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminTopbar() {
  return (
    <div className="flex flex-col gap-4 bg-white lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
          Admin Panel
        </p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">
          Dashboard RIMBA
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 md:flex">
          <Search size={16} className="text-slate-400" />
          <span className="text-sm text-slate-400">Cari menu atau data...</span>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 lg:h-11 lg:w-11"
        >
          <Bell size={18} />
        </button>

        <Button
          variant="outline"
          size="icon"
          asChild
          className="flex xl:hidden h-10 w-10 items-center justify-center rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-100 lg:h-11 lg:w-11"
        >
          <Link href="/public" target="_blank">
            <ExternalLink size={18} />
          </Link>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/public" })}
          className="flex xl:hidden h-10 w-10 items-center justify-center rounded-2xl border-slate-200 text-red-600 hover:bg-red-50 hover:text-red-700 lg:h-11 lg:w-11"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </div>
  );
}