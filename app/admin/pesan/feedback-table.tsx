"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Trash2, Loader2, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { deleteFeedback, updateFeedbackStatus } from "./actions";
import { toast } from "sonner";
import { FeedbackStatus, FeedbackCategory } from "@prisma/client";
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

export interface Feedback {
  id: string;
  category: FeedbackCategory;
  name: string | null;
  contact: string | null;
  message: string;
  status: FeedbackStatus;
  createdAt: Date;
}

const statusConfig = {
  NEW: { label: "Baru", color: "bg-blue-50 text-blue-700", icon: AlertCircle },
  IN_PROGRESS: { label: "Diproses", color: "bg-yellow-50 text-yellow-700", icon: Clock },
  DONE: { label: "Selesai", color: "bg-green-50 text-green-700", icon: CheckCircle },
};

const categoryLabels = {
  SUGGESTION: "Masukan",
  COMPLAINT: "Pengaduan",
  QUESTION: "Pertanyaan",
};

export default function FeedbackTable({ messages }: { messages: Feedback[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteFeedback(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Pesan berhasil dihapus");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleStatusUpdate = async (id: string, status: FeedbackStatus) => {
    setIsUpdating(id);
    try {
      const result = await updateFeedbackStatus(id, status);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status diperbarui menjadi ${statusConfig[status].label}`);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsUpdating(null);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <MessageSquare size={48} className="mb-4 opacity-20" />
        <p>Belum ada pesan masuk.</p>
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-y border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <tr>
          <th className="px-6 py-4">Pengirim</th>
          <th className="px-6 py-4">Kategori</th>
          <th className="px-6 py-4">Isi Pesan</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4">Tanggal</th>
          <th className="px-6 py-4 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {messages.map((msg) => {
          const status = statusConfig[msg.status];
          const StatusIcon = status.icon;

          return (
            <tr key={msg.id} className="group transition hover:bg-slate-50/50">
              <td className="px-6 py-4">
                <p className="font-bold text-slate-900">{msg.name || "Anonim"}</p>
                <p className="text-xs text-slate-500">{msg.contact || "-"}</p>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-medium text-slate-600">
                  {categoryLabels[msg.category]}
                </span>
              </td>
              <td className="max-w-[300px] px-6 py-4">
                <p className="line-clamp-2 text-slate-700" title={msg.message}>
                  {msg.message}
                </p>
              </td>
              <td className="px-6 py-4">
                <select
                  value={msg.status}
                  onChange={(e) => handleStatusUpdate(msg.id, e.target.value as FeedbackStatus)}
                  disabled={isUpdating === msg.id}
                  className={`rounded-full px-3 py-1 text-xs font-semibold outline-none transition ${status.color}`}
                >
                  <option value="NEW">Baru</option>
                  <option value="IN_PROGRESS">Diproses</option>
                  <option value="DONE">Selesai</option>
                </select>
              </td>
              <td className="px-6 py-4 text-slate-500">
                {format(new Date(msg.createdAt), "dd MMM yyyy", { locale: idLocale })}
              </td>
              <td className="px-6 py-4 text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isDeleting === msg.id}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {isDeleting === msg.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[2rem]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Pesan?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Pesan dari {msg.name || "Anonim"} akan dihapus permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(msg.id)}
                        className="rounded-xl bg-red-600 hover:bg-red-700"
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
