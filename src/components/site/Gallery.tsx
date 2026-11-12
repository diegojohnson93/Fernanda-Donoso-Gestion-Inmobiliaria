/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/lib/types";

/** Galería de la ficha: foto grande + mosaico, y visor a pantalla completa. */
export function Gallery({ photos, title }: { photos: Photo[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const go = useCallback(
    (d: number) => setOpen((i) => (i === null ? null : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  if (!photos.length) {
    return (
      <div className="grid aspect-[16/9] place-items-center bg-beige text-cream">
        <svg viewBox="0 0 48 60" className="h-24 w-20" fill="none" aria-hidden>
          <path d="M5 58V25a19 19 0 0 1 38 0v33" stroke="currentColor" strokeWidth="0.8" />
          <path d="M1 58h46" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      </div>
    );
  }

  const rest = photos.slice(1, 5);
  return (
    <>
      <div className={`grid gap-2 ${rest.length ? "md:grid-cols-[1.6fr_1fr]" : ""}`}>
        <button onClick={() => setOpen(0)} className="group relative aspect-[4/3] overflow-hidden bg-beige md:aspect-auto md:h-[72vh]">
          <img src={photos[0].url} alt={title} className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]" />
        </button>
        {rest.length > 0 && (
          <div className="hidden grid-cols-2 gap-2 md:grid">
            {rest.map((p, i) => (
              <button
                key={p.path}
                onClick={() => setOpen(i + 1)}
                className="group relative overflow-hidden bg-beige"
              >
                <img src={p.url} alt={`${title}, foto ${i + 2}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" />
                {i === rest.length - 1 && photos.length > 5 && (
                  <span className="absolute inset-0 grid place-items-center bg-charcoal/45 font-serif text-3xl text-cream">
                    +{photos.length - 5}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {photos.length > 1 && (
        <button onClick={() => setOpen(0)} className="eyebrow mt-3 text-stone underline-offset-4 hover:underline">
          Ver las {photos.length} fotos
        </button>
      )}

      {open !== null && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-charcoal/97 text-cream" role="dialog" aria-label="Fotos">
          <div className="flex items-center justify-between px-5 py-4 text-sm">
            <span>
              {open + 1} / {photos.length}
            </span>
            <button onClick={() => setOpen(null)} className="eyebrow">
              Cerrar ×
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6 md:px-16">
            <img src={photos[open].url} alt={`${title}, foto ${open + 1}`} className="max-h-full max-w-full object-contain" />
            {photos.length > 1 && (
              <>
                <button onClick={() => go(-1)} aria-label="Anterior" className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-3xl md:left-6">
                  ‹
                </button>
                <button onClick={() => go(1)} aria-label="Siguiente" className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-3xl md:right-6">
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
