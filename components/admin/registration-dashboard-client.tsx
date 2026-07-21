'use client';

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search, Eye, CheckCircle, XCircle, Clock, ArrowLeft, Phone, Mail, Calendar, User, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getRegistrations,
  getAgendas,
  updateRegistrationStatus,
} from "@/app/admin/pendaftaran/actions";

interface Agenda {
  id: string;
  title: string;
}

interface Registration {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  status: "MENUNGGU" | "DIKONFIRMASI" | "DITOLAK";
  createdAt: Date;
  agenda: { title: string };
}

interface Stats {
  total: number;
  menunggu: number;
  dikonfirmasi: number;
  ditolak: number;
}

export default function RegistrationDashboardClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    menunggu: 0,
    dikonfirmasi: 0,
    ditolak: 0,
  });
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"DIKONFIRMASI" | "DITOLAK" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedAgendaId]);

  async function loadData() {
    try {
      const [data, agendaList] = await Promise.all([
        getRegistrations(searchQuery, selectedAgendaId),
        getAgendas(),
      ]);
      setRegistrations(data.registrations as Registration[]);
      setStats(data.stats);
      setAgendas(agendaList);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(newStatus: "MENUNGGU" | "DIKONFIRMASI" | "DITOLAK") {
    if (!selectedRegistration) return;

    try {
      const result = await updateRegistrationStatus(selectedRegistration.id, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Status berhasil diperbarui!");
        loadData();
        setIsDetailOpen(false);
      }
    } catch (error) {
      toast.error("Gagal memperbarui status");
    }
  }

  function handleConfirmChangeStatus(newStatus: "DIKONFIRMASI" | "DITOLAK") {
    setPendingStatus(newStatus);
    setIsConfirmOpen(true);
  }

  function confirmChangeStatus() {
    if (pendingStatus) {
      handleUpdateStatus(pendingStatus);
      setIsConfirmOpen(false);
      setPendingStatus(null);
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig: Record<string, { variant: "warning" | "success" | "destructive"; icon: React.ReactNode }> = {
      MENUNGGU: { variant: "warning", icon: <Clock size={14} /> },
      DIKONFIRMASI: { variant: "success", icon: <CheckCircle size={14} /> },
      DITOLAK: { variant: "destructive", icon: <XCircle size={14} /> },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.MENUNGGU;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <section className="space-y-8 pb-20">
      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Pendaftar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-2">
              <Clock size={18} /> Menunggu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{stats.menunggu}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <CheckCircle size={18} /> Dikonfirmasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{stats.dikonfirmasi}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
              <XCircle size={18} /> Ditolak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{stats.ditolak}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Cari peserta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={selectedAgendaId}
          onChange={(e) => setSelectedAgendaId(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-slate-200 rounded-lg bg-white"
        >
          <option value="">Semua Agenda</option>
          {agendas.map((agenda) => (
            <option key={agenda.id} value={agenda.id}>{agenda.title}</option>
          ))}
        </select>
      </div>

      {/* Tabel Pendaftaran */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Nama Peserta
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Kontak
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Agenda
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tanggal Daftar
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">
                    Belum ada pendaftar
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{reg.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {reg.email && <div className="text-slate-600">{reg.email}</div>}
                        <div className="text-slate-500">{reg.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {reg.agenda.title}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {format(new Date(reg.createdAt), "dd MMM yyyy", { locale: id })}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(reg.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRegistration(reg);
                          setIsDetailOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                      >
                        <Eye size={16} className="mr-1" /> Detail
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Detail */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl border-slate-200 p-6 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors -ml-2"
              >
                <ArrowLeft size={16} /> Kembali
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-lg border border-emerald-100">
                {selectedRegistration?.name?.charAt(0).toUpperCase() || "P"}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">Detail Pendaftaran</DialogTitle>
                <DialogDescription className="text-slate-500 text-xs mt-0.5">
                  Informasi lengkap peserta & kelola status pendaftaran
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-5 pt-2">
              {/* Grid Informasi Utama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <User size={14} className="text-slate-500" /> Nama Peserta
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">{selectedRegistration.name}</p>
                </div>

                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <Mail size={14} className="text-slate-500" /> Email
                  </div>
                  <p className="text-slate-800 text-sm font-medium">{selectedRegistration.email || "-"}</p>
                </div>

                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <Phone size={14} className="text-slate-500" /> Nomor HP / WhatsApp
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-800 text-sm font-medium">{selectedRegistration.phone}</p>
                    {selectedRegistration.phone && (
                      <a
                        href={`https://wa.me/${selectedRegistration.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
                      >
                        Chat WA <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <Calendar size={14} className="text-slate-500" /> Tanggal Mendaftar
                  </div>
                  <p className="text-slate-800 text-sm font-medium">
                    {format(new Date(selectedRegistration.createdAt), "dd MMMM yyyy, HH:mm", { locale: id })}
                  </p>
                </div>

                <div className="col-span-1 md:col-span-2 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <FileText size={14} className="text-slate-500" /> Agenda Dimaksud
                  </div>
                  <p className="font-semibold text-emerald-800 text-sm">{selectedRegistration.agenda.title}</p>
                </div>

                <div className="col-span-1 md:col-span-2 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <FileText size={14} className="text-slate-500" /> Catatan Tambahan
                  </div>
                  <p className="text-slate-700 text-sm bg-white p-2.5 rounded-xl border border-slate-200/60 min-h-[44px]">
                    {selectedRegistration.notes || <span className="text-slate-400 italic">Tidak ada catatan</span>}
                  </p>
                </div>
              </div>

              {/* Status Section */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Ubah Status Pendaftaran
                  </label>
                  <div>{getStatusBadge(selectedRegistration.status)}</div>
                </div>
                <select
                  value={selectedRegistration.status}
                  onChange={(e) => {
                    const value = e.target.value as Registration["status"];
                    if (selectedRegistration.status === "MENUNGGU" && (value === "DIKONFIRMASI" || value === "DITOLAK")) {
                      handleConfirmChangeStatus(value);
                    } else {
                      handleUpdateStatus(value);
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="MENUNGGU">⏳ Menunggu Konfirmasi</option>
                  <option value="DIKONFIRMASI">✅ Dikonfirmasi</option>
                  <option value="DITOLAK">❌ Ditolak</option>
                </select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Konfirmasi */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-3xl border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan Status</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah status pendaftaran menjadi {pendingStatus === "DIKONFIRMASI" ? "Dikonfirmasi" : "Ditolak"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatus(null)} className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmChangeStatus} className="rounded-xl bg-green-600 hover:bg-green-700">
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
