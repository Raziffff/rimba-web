"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import AdminTopbar from "@/components/admin/topbar";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen relative">
        {/* Desktop Sidebar */}
        <div className="hidden xl:block">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm xl:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <div 
          className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white transition-transform duration-300 ease-in-out xl:hidden ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="absolute right-4 top-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <X size={24} />
            </Button>
          </div>
          <AdminSidebar isMobile onClose={() => setIsSidebarOpen(false)} />
        </div>

        <div className="flex min-h-screen flex-1 flex-col w-full">
          {/* Topbar with Hamburger Menu for Mobile */}
          <div className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="xl:hidden rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu size={24} />
            </Button>
            <div className="flex-1">
              <AdminTopbar />
            </div>
          </div>
          
          <div className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</div>
        </div>
      </div>
    </main>
  );
}
