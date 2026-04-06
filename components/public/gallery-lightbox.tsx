"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type GalleryItem = {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
  category: string | null;
  createdAt: string;
};

type GalleryLightboxProps = {
  items: GalleryItem[];
};

export default function GalleryLightbox({ items }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const active = useMemo(() => {
    if (activeIndex === null) return null;
    return items[activeIndex] ?? null;
  }, [activeIndex, items]);

  const close = () => setActiveIndex(null);
  const prev = () =>
    setActiveIndex((curr) => {
      if (curr === null) return null;
      return (curr - 1 + items.length) % items.length;
    });
  const next = () =>
    setActiveIndex((curr) => {
      if (curr === null) return null;
      return (curr + 1) % items.length;
    });

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-56 w-full bg-slate-100">
              <Image
                src={item.imageUrl}
                alt={item.title ?? "Galeri RIMBA"}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.title ?? "Dokumentasi Kegiatan"}
                  </p>
                  {item.caption && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {item.caption}
                    </p>
                  )}
                </div>
                {item.category && (
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-[60] bg-black/70 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-5xl flex-col">
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {active.title ?? "Dokumentasi Kegiatan"}
                </p>
                {active.caption && (
                  <p className="truncate text-xs text-white/75">{active.caption}</p>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white hover:bg-white/15"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-[2rem] bg-black">
              <Image
                src={active.imageUrl}
                alt={active.title ?? "Galeri RIMBA"}
                fill
                className="object-contain"
              />
            </div>

            {items.length > 1 && (
              <div className="flex items-center justify-center gap-3 py-4">
                <button
                  type="button"
                  onClick={prev}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
                >
                  <ChevronLeft size={18} />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
                >
                  Berikutnya
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

