import AdminSidebar from "@/components/admin/sidebar";
import AdminTopbar from "@/components/admin/topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <AdminTopbar />
          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </main>
  );
}