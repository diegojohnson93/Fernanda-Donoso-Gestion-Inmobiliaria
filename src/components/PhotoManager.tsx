/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import type { Photo } from "@/lib/types";
import { Button } from "./ui";

const MAX_SIDE = 2000;
const QUALITY = 0.82;
const MAX_PHOTOS = 40;

/** Achica la foto en el navegador antes de subirla (las del celular pesan mucho). */
async function compress(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      `No se pudo leer "${file.name}". Si es una foto HEIC de iPhone, compártela o expórtala como JPG.`,
    );
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", QUALITY));
  if (!blob) throw new Error(`No se pudo procesar "${file.name}".`);
  return { blob, width, height };
}

export function PhotoManager({
  photos,
  onChange,
  onBusy,
}: {
  photos: Photo[];
  onChange: (updater: (prev: Photo[]) => Photo[]) => void;
  onBusy: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropOver, setDropOver] = useState(false);

  const upload = async (files: File[]) => {
    const images = files.filter(
      (f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name),
    );
    if (!images.length) return;
    const room = MAX_PHOTOS - photos.length;
    const batch = images.slice(0, Math.max(0, room));
    const errs: string[] = [];
    if (images.length > batch.length) errs.push(`Máximo ${MAX_PHOTOS} fotos por propiedad.`);

    onBusy(true);
    setProgress({ done: 0, total: batch.length });
    for (const [i, file] of batch.entries()) {
      try {
        const { blob, width, height } = await compress(file);
        const fd = new FormData();
        fd.append("file", new File([blob], "foto.jpg", { type: "image/jpeg" }));
        fd.append("width", String(width));
        fd.append("height", String(height));
        const res = await fetch("/api/photos", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error al subir");
        onChange((prev) => [...prev, data as Photo]);
      } catch (e) {
        errs.push((e as Error).message);
      }
      setProgress({ done: i + 1, total: batch.length });
    }
    setProgress(null);
    setErrors(errs);
    onBusy(false);
  };

  const move = (from: number, to: number) =>
    onChange((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });

  const remove = (i: number) => onChange((prev) => prev.filter((_, j) => j !== i));

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (dragFrom !== null) return;
          e.preventDefault();
          setDropOver(true);
        }}
        onDragLeave={() => setDropOver(false)}
        onDrop={(e) => {
          if (dragFrom !== null) return;
          e.preventDefault();
          setDropOver(false);
          upload(Array.from(e.dataTransfer.files));
        }}
        className={`rounded-xl border border-dashed p-3 transition ${
          dropOver ? "border-brand bg-brand-soft" : "border-line"
        }`}
      >
        {photos.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((p, i) => (
              <div
                key={p.path}
                draggable
                onDragStart={() => setDragFrom(i)}
                onDragEnd={() => setDragFrom(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dragFrom !== null) move(dragFrom, i);
                  setDragFrom(null);
                }}
                className={`group relative aspect-[4/3] cursor-grab overflow-hidden rounded-lg bg-[#eceef0] ${
                  dragFrom === i ? "opacity-40" : ""
                } ${i === 0 ? "ring-2 ring-accent" : ""}`}
              >
                <img
                  src={p.url}
                  alt={`Foto ${i + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Portada
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                  <div className="flex gap-1">
                    <IconBtn
                      label="Mover a la izquierda"
                      disabled={i === 0}
                      onClick={() => move(i, i - 1)}
                    >
                      ←
                    </IconBtn>
                    <IconBtn
                      label="Mover a la derecha"
                      disabled={i === photos.length - 1}
                      onClick={() => move(i, i + 1)}
                    >
                      →
                    </IconBtn>
                  </div>
                  <div className="flex gap-1">
                    {i !== 0 && (
                      <IconBtn label="Usar como portada" onClick={() => move(i, 0)}>
                        ★
                      </IconBtn>
                    )}
                    <IconBtn label="Quitar foto" onClick={() => remove(i)}>
                      ✕
                    </IconBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={progress !== null} onClick={() => inputRef.current?.click()}>
            {progress
              ? `Subiendo ${Math.min(progress.done + 1, progress.total)} de ${progress.total}…`
              : photos.length
                ? "+ Agregar fotos"
                : "Subir fotos"}
          </Button>
          <span className="text-xs text-muted">
            {photos.length
              ? `${photos.length} foto${photos.length > 1 ? "s" : ""}. Arrástralas para ordenarlas; ★ elige la portada.`
              : "Arrastra aquí varias fotos a la vez, o elígelas desde el computador o el celular."}
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            upload(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>
      {errors.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-bad">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconBtn({
  label,
  children,
  onClick,
  disabled,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-6 w-6 place-items-center rounded bg-white/90 text-xs font-bold text-ink hover:bg-white disabled:opacity-30"
    >
      {children}
    </button>
  );
}
