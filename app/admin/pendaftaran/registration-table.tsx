"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Trash2, Loader2, Phone, Mail, Calendar } from "lucide-react";
import { deleteRegistration } from "./actions";
import { toast } from "sonner";
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

export interface Registration {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  createdAt: Date;
  agenda: {
    title: string;
  };
}

export default function RegistrationTable({ registrations }: { registrations: Registration[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteRegistration(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Pendaftaran berhasil dihapus");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsDeleting(null);
    }
  };

  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <Calendar size={48} className="mb-4 opacity-20" />
        <p>Belum ada pendaftaran masuk.</p>
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-y border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <tr>
          <th className="px-6 py-4">Peserta</th>
          <th className="px-6 py-4">Kontak</th>
          <th className="px-6 py-4">Agenda</th>
          <th className="px-6 py-4">Tanggal Daftar</th>
          <th className="px-6 py-4">Catatan</th>
          <th className="px-6 py-4 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {registrations.map((reg) => (
          <tr key={reg.id} className="group transition hover:bg-slate-50/50">
            <td className="px-6 py-4">
              <p className="font-bold text-slate-900">{reg.name}</p>
              <p className="text-xs text-slate-500">ID: {reg.id.slice(-8)}</p>
            </td>
            <td className="px-6 py-4">
              <div className="space-y-1">
                <a
                  href={`https://wa.me/${reg.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-green-700 hover:underline"
                >
                  <Phone size={14} />
                  {reg.phone}
                </a>
                {reg.email && (
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Mail size={14} />
                    {reg.email}
                  </div>
                )}
              </div>
            </td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {reg.agenda.title}
              </span>
            </td>
            <td className="px-6 py-4 text-slate-600">
              {format(new Date(reg.createdAt), "dd MMM yyyy, HH:mm", { locale: idLocale })}
            </td>
            <td className="max-w-[200px] px-6 py-4 text-slate-500 italic">
              {reg.notes || "-"}
            </td>
            <td className="px-6 py-4 text-right">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    disabled={isDeleting === reg.id}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {isDeleting === reg.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Pendaftaran?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Data pendaftaran {reg.name} akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(reg.id)}
                      className="rounded-xl bg-red-600 hover:bg-red-700"
                    >
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
