"use client";

import { useState } from "react";
import { deleteGalleryItem } from "@/app/admin/galeri/actions";
import { toast } from "sonner";
import { Trash2, Loader2, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
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

interface GalleryItem {
  id: string;
  title: string | null;
  imageUrl: string;
  category: string | null;
}

interface GalleryListProps {
  items: GalleryItem[];
}

export default function GalleryList({ items }: GalleryListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteGalleryItem(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Foto berhasil dihapus");
        router.refresh();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
          <div className="aspect-[4/3] overflow-hidden bg-slate-100">
            <img 
              src={item.imageUrl} 
              alt={item.title || "Gallery Image"} 
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
          </div>
          
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {item.title || "Tanpa Judul"}
                </p>
                {item.category && (
                  <Badge variant="secondary" className="mt-1 font-normal text-[10px]">
                    {item.category}
                  </Badge>
                )}
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    disabled={isDeleting === item.id}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 opacity-0 transition group-hover:opacity-100 hover:bg-red-100 disabled:opacity-50"
                  >
                    {isDeleting === item.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl border-slate-200">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Foto?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Foto ini akan dihapus permanen dari galeri.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(item.id)}
                      className="rounded-xl bg-red-600 hover:bg-red-700"
                    >
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-slate-400">
          <p className="italic">Belum ada foto di galeri.</p>
        </div>
      )}
    </div>
  );
}
