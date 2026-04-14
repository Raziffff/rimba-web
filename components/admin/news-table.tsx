'use client';

import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { Edit2, Trash2, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { deleteNews } from "@/app/admin/berita/actions";
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

interface News {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

interface NewsTableProps {
  news: News[];
}

export default function NewsTable({ news }: NewsTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteNews(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Berita berhasil dihapus");
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
              Judul Berita
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Status
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tanggal Dibuat
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {news.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-slate-900 line-clamp-1">
                  {item.title}
                </p>
                <p className="text-xs text-slate-400">/{item.slug}</p>
              </td>
              <td className="px-6 py-4">
                <Badge variant={item.isPublished ? "success" : "warning"}>
                  {item.isPublished ? "Published" : "Draft"}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                {format(new Date(item.createdAt), "dd MMM yyyy", { locale: id })}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/public/berita/${item.slug}`}
                    target="_blank"
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Lihat"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    href={`/admin/beritaedit/${item.id}`}
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
                        <AlertDialogTitle>Hapus Berita?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Berita <strong>{item.title}</strong> akan dihapus permanen dari sistem.
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
          {news.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                Belum ada berita yang dibuat.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
