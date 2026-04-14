"use client";

import { useState } from "react";
import { Trash2, Edit2, Loader2, User } from "lucide-react";
import { deleteMember } from "@/app/admin/anggota/actions";
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

interface Member {
  id: string;
  name: string;
  position: string;
  category: string | null;
  imageUrl: string | null;
  order: number;
}

interface MemberTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
}

export default function MemberTable({ members, onEdit }: MemberTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteMember(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Anggota berhasil dihapus");
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
              Foto
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Nama
            </th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Jabatan
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
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <User size={20} />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {member.name}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {member.position}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {member.category || "N/A"}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  onClick={() => onEdit(member)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isDeleting === member.id}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      {isDeleting === member.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl border-slate-200">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Anggota?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Data anggota <strong>{member.name}</strong> akan dihapus permanen dari sistem.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(member.id)}
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
          {members.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                Belum ada anggota tercatat.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
