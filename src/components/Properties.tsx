"use client";

import { useEffect, useRef, useState } from "react";
import type { Property } from "@/lib/types";
import { Button, Pill, inputClass } from "./ui";

type FormState = {
  code: string;
  title: string;
  operation: "venta" | "arriendo";
  price: string;
  sector: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  area_m2: string;
  brief: string;
  ad_ids: string;
  links: string;
  active: boolean;
};

const empty: FormState = {
  code: "",
  title: "",
  operation: "arriendo",
  price: "",
  sector: "",
  address: "",
  bedrooms: "",
  bathrooms: "",
  area_m2: "",
  brief: "",
  ad_ids: "",
  links: "",
  active: true,
};

const toForm = (p: Property): FormState => ({
  code: p.code,
  title: p.title,
  operation: p.operation,
  price: p.price,
  sector: p.sector,
  address: p.address,
  bedrooms: p.bedrooms?.toString() ?? "",
  bathrooms: p.bathrooms?.toString() ?? "",
  area_m2: p.area_m2?.toString() ?? "",
  brief: p.brief,
  ad_ids: p.ad_ids.join(", "),
  links: p.links,
  active: p.active,
});

export function Properties() {
  const [items, setItems] = useState<Property[]>([]);
  const [editing, setEditing] = useState<{ id: string | null; form: FormState } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/properties");
    setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    const t = setTimeout(() => load().catch(() => setLoading(false)), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mx-auto h-full max-w-6xl overflow-y-auto p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Propiedades</h1>
          <p className="max-w-2xl text-sm text-muted">
            Cada ficha es lo que la IA usa para responder. Usa el <b>código</b> en tus avisos y
            publicaciones (por ejemplo “Consulta por REN-01”) y vincula los IDs de los avisos de
            Meta para que la propiedad se detecte sola.
          </p>
        </div>
        <Button variant="primary" onClick={() => setEditing({ id: null, form: empty })}>
          + Nueva propiedad
        </Button>
      </div>

      {loading && <p className="text-sm text-muted">Cargando…</p>}
      {!loading && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">
          Aún no hay propiedades. Crea la primera o sube su ficha en PDF.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <button
            key={p.id}
            onClick={() => setEditing({ id: p.id, form: toForm(p) })}
            className={`rounded-2xl border border-line bg-white p-4 text-left shadow-sm transition hover:border-brand ${
              p.active ? "" : "opacity-60"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand px-2 py-0.5 text-xs font-bold text-white">
                {p.code}
              </span>
              <Pill className="bg-[#eef0f2] text-muted">
                {p.operation === "venta" ? "Venta" : "Arriendo"}
              </Pill>
              {!p.active && <Pill className="bg-[#eceef0] text-muted">Inactiva</Pill>}
            </div>
            <div className="mt-2 font-semibold leading-snug">{p.title}</div>
            <div className="text-sm text-muted">{p.price}</div>
            <div className="mt-1 text-xs text-muted">
              {[
                p.bedrooms && `${p.bedrooms}D`,
                p.bathrooms && `${p.bathrooms}B`,
                p.area_m2 && `${p.area_m2} m²`,
                p.sector,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
            <div className="mt-3 flex gap-3 text-[11px] text-muted">
              <span>{p.brief ? `${p.brief.split("\n").length} líneas de ficha` : "Ficha vacía"}</span>
              <span>
                {p.ad_ids.length
                  ? `${p.ad_ids.length} aviso${p.ad_ids.length > 1 ? "s" : ""} vinculado${p.ad_ids.length > 1 ? "s" : ""}`
                  : "Sin avisos vinculados"}
              </span>
            </div>
          </button>
        ))}
      </div>

      {editing && (
        <PropertyEditor
          id={editing.id}
          initial={editing.form}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function PropertyEditor({
  id,
  initial,
  onClose,
  onSaved,
}: {
  id: string | null;
  initial: FormState;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [busy, setBusy] = useState<null | "save" | "pdf" | "delete">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setBusy("save");
    setError(null);
    try {
      const res = await fetch(id ? `/api/properties/${id}` : "/api/properties", {
        method: id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!id || !confirm(`¿Eliminar ${form.code}? Las conversaciones quedarán sin propiedad asignada.`)) return;
    setBusy("delete");
    await fetch(`/api/properties/${id}`, { method: "DELETE" });
    onSaved();
  };

  const upload = async (file: File) => {
    setError(null);
    setNotice(null);
    if (file.type === "application/pdf") {
      setBusy("pdf");
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/properties/extract", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setForm((f) => ({
          ...f,
          title: data.title || f.title,
          operation: data.operation === "venta" ? "venta" : data.operation === "arriendo" ? "arriendo" : f.operation,
          price: data.price || f.price,
          sector: data.sector || f.sector,
          address: data.address || f.address,
          bedrooms: data.bedrooms?.toString() ?? f.bedrooms,
          bathrooms: data.bathrooms?.toString() ?? f.bathrooms,
          area_m2: data.area_m2?.toString() ?? f.area_m2,
          brief: [f.brief, data.brief].filter(Boolean).join("\n"),
        }));
        setNotice("La IA leyó el PDF y completó la ficha. Revísala antes de guardar.");
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(null);
      }
    } else {
      const text = await file.text();
      setForm((f) => ({ ...f, brief: [f.brief, text.trim()].filter(Boolean).join("\n") }));
      setNotice("Texto agregado a la ficha.");
    }
  };

  const field = (label: string, k: keyof FormState, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input
        className={inputClass}
        value={form[k] as string}
        onChange={(e) => set(k, e.target.value as never)}
        {...props}
      />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-2xl flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-semibold">{id ? `Editar ${initial.code}` : "Nueva propiedad"}</h2>
          <button className="text-muted hover:text-ink" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div
            className="rounded-xl border border-dashed border-brand/40 bg-brand-soft/50 p-4 text-sm"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) upload(f);
            }}
          >
            <div className="font-medium text-brand">Subir brief de la propiedad</div>
            <p className="text-xs text-muted">
              Arrastra un PDF (la IA lo lee y completa los campos) o un archivo de texto (.txt, .md).
            </p>
            <Button
              className="mt-2"
              disabled={busy !== null}
              onClick={() => fileRef.current?.click()}
            >
              {busy === "pdf" ? "Leyendo PDF…" : "Elegir archivo"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.txt,.md,text/plain"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
            {field("Código *", "code", { placeholder: "REN-01" })}
            {field("Título *", "title", { placeholder: "Depto 2D2B vista al mar, Reñaca" })}
          </div>
          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Operación</span>
              <select
                className={inputClass}
                value={form.operation}
                onChange={(e) => set("operation", e.target.value as FormState["operation"])}
              >
                <option value="arriendo">Arriendo</option>
                <option value="venta">Venta</option>
              </select>
            </label>
            {field("Precio", "price", { placeholder: "$750.000 + GC  /  UF 9.800" })}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {field("Sector / comuna", "sector")}
            {field("Dirección o referencia", "address")}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {field("Dormitorios", "bedrooms", { inputMode: "numeric" })}
            {field("Baños", "bathrooms", { inputMode: "numeric" })}
            {field("m²", "area_m2", { inputMode: "decimal" })}
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
              Ficha para la IA: todo lo que pueda preguntar un cliente
            </span>
            <textarea
              className={`${inputClass} min-h-[220px] font-mono text-[13px] leading-relaxed`}
              value={form.brief}
              placeholder={"Gastos comunes aprox. $120.000\nIncluye estacionamiento y bodega\nSe aceptan mascotas pequeñas\nRequisitos: …\nDisponible desde …\nVisitas: …"}
              onChange={(e) => set("brief", e.target.value)}
            />
          </label>
          {field("IDs de avisos de Meta vinculados (separados por coma)", "ad_ids", {
            placeholder: "120210000000000001, 120210000000000002",
          })}
          {field("Links (portal, fotos, tour 360)", "links")}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
            />
            Activa (la IA la considera al responder)
          </label>
        </div>

        <div className="flex items-center gap-2 border-t border-line px-5 py-3">
          {error && <p className="text-xs text-bad">{error}</p>}
          {notice && !error && <p className="text-xs text-ok">{notice}</p>}
          <div className="ml-auto flex gap-2">
            {id && (
              <Button variant="danger" disabled={busy !== null} onClick={remove}>
                Eliminar
              </Button>
            )}
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="primary" disabled={busy !== null} onClick={save}>
              {busy === "save" ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
