"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Edit2, Trash2, MapPin, Calendar, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { deleteAgenda } from "@/app/admin/agenda/actions";
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
import Link from "next/link";

interface Agenda {
  id: string;
  title: string;
  description: string;
  category: string | null;
  date: Date;
  location: string | null;
}

interface AgendaTableProps {
  agendas: Agenda[];
}

export default function AgendaTable({ agendas }: AgendaTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteAgenda(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Agenda berhasil dihapus");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Agenda
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Waktu & Tempat
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kategori
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {agendas.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                  {item.description}
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Calendar size={14} className="text-green-600" />
                    {format(new Date(item.date), "dd MMM yyyy", { locale: idLocale })}
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin size={14} className="text-slate-400" />
                      {item.location}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                {item.category ? (
                  <Badge variant="secondary" className="font-normal">
                    {item.category}
                  </Badge>
                ) : (
                  <span className="text-xs text-slate-400 italic">Umum</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/agendaedit/${item.id}`}
                    className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        disabled={isDeleting === item.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Hapus"
                      >
                        {isDeleting === item.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl border-slate-200">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Agenda?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Agenda <strong>{item.title}</strong> akan dihapus permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item.id)}
                          className="rounded-xl bg-red-600 hover:bg-red-700"
                        >
                          Hapus Permanen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            </tr>
          ))}
          {agendas.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                Belum ada agenda terdaftar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
