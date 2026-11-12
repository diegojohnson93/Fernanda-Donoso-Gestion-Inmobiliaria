/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  MODALITIES,
  MODALITY_KEYS,
  priceLines,
  sectionsFor,
  type Details,
  type FieldDef,
  type Modality,
} from "@/lib/ficha";
import type { Photo, Property } from "@/lib/types";
import { PhotoManager } from "./PhotoManager";
import { Button, ModalityPills, Pill, inputClass } from "./ui";

type FormState = {
  code: string;
  title: string;
  modalities: Modality[];
  sector: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  area_m2: string;
  details: Details;
  brief: string;
  private_notes: string;
  photos: Photo[];
  published: boolean;
  featured: boolean;
  show_address: boolean;
  web_description: string;
  ad_ids: string;
  links: string;
  active: boolean;
};

const empty: FormState = {
  code: "",
  title: "",
  modalities: [],
  sector: "",
  address: "",
  bedrooms: "",
  bathrooms: "",
  area_m2: "",
  details: {},
  brief: "",
  private_notes: "",
  photos: [],
  published: false,
  featured: false,
  show_address: false,
  web_description: "",
  ad_ids: "",
  links: "",
  active: true,
};

const toForm = (p: Property): FormState => ({
  code: p.code,
  title: p.title,
  modalities: p.modalities ?? [],
  sector: p.sector,
  address: p.address,
  bedrooms: p.bedrooms?.toString() ?? "",
  bathrooms: p.bathrooms?.toString() ?? "",
  area_m2: p.area_m2?.toString() ?? "",
  details: p.details ?? {},
  brief: p.brief,
  private_notes: p.private_notes ?? "",
  photos: p.photos ?? [],
  published: Boolean(p.published),
  featured: Boolean(p.featured),
  show_address: Boolean(p.show_address),
  web_description: p.web_description ?? "",
  ad_ids: p.ad_ids.join(", "),
  links: p.links,
  active: p.active,
});

export function Properties() {
  const [items, setItems] = useState<Property[]>([]);
  const [editing, setEditing] = useState<{ id: string | null; form: FormState } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Modality | "todas">("todas");

  const load = async () => {
    const res = await fetch("/api/properties");
    setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    const t = setTimeout(() => load().catch(() => setLoading(false)), 0);
    return () => clearTimeout(t);
  }, []);

  const [showInactive, setShowInactive] = useState(false);
  const inactiveCount = items.filter((p) => !p.active).length;
  const visible = items
    .filter((p) => showInactive || p.active)
    .filter((p) => filter === "todas" || p.modalities?.includes(filter));

  return (
    <div className="mx-auto h-full max-w-6xl overflow-y-auto p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Propiedades</h1>
          <p className="max-w-2xl text-sm text-muted">
            Cada ficha se llena una sola vez y es lo que la IA usa para responder. Usa el{" "}
            <b>código</b> en tus avisos (“Consulta por REN-01”) y vincula los IDs de los avisos de
            Meta para que la propiedad se detecte sola.
          </p>
        </div>
        <Button variant="primary" onClick={() => setEditing({ id: null, form: empty })}>
          + Nueva propiedad
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {(["todas", ...MODALITY_KEYS] as const).map((m) => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === m ? "bg-brand text-white" : "bg-white text-muted hover:text-ink"
            }`}
          >
            {m === "todas" ? `Todas (${items.length - inactiveCount})` : MODALITIES[m].label}
          </button>
        ))}
        {inactiveCount > 0 && (
          <label className="ml-auto flex items-center gap-1.5 text-xs text-muted">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Mostrar no disponibles ({inactiveCount})
          </label>
        )}
      </div>

      {loading && <p className="text-sm text-muted">Cargando…</p>}
      {!loading && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">
          Aún no hay propiedades. Crea la primera o sube su ficha en PDF.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => {
          const filled = Object.keys(p.details ?? {}).length;
          return (
            <button
              key={p.id}
              onClick={() => setEditing({ id: p.id, form: toForm(p) })}
              className={`flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm transition hover:border-brand ${
                p.active ? "" : "opacity-60"
              }`}
            >
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-[#eceef0]">
                {p.photos?.[0] ? (
                  <img
                    src={p.photos[0].url}
                    alt={p.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-muted">Sin fotos</div>
                )}
                {(p.photos?.length ?? 0) > 1 && (
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
                    {p.photos.length} fotos
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-brand px-2 py-0.5 text-xs font-bold text-white">
                    {p.code}
                  </span>
                  <ModalityPills modalities={p.modalities ?? []} />
                  {!p.active && <Pill className="bg-[#f8e5e3] text-bad">No disponible</Pill>}
                {p.active && p.published && (
                  <Pill className="bg-[#e7f3ec] text-ok">En la web{p.featured ? " ★" : ""}</Pill>
                )}
                </div>
                <div className="mt-2 font-semibold leading-snug">{p.title}</div>
                <div className="mt-1 space-y-0.5 text-sm text-muted">
                  {priceLines(p.modalities ?? [], p.details ?? {}).map((l) => (
                    <div key={l.modality}>
                      <span className="text-ink/70">{MODALITIES[l.modality].short}:</span> {l.text}
                    </div>
                  ))}
                </div>
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
                  <span>{filled} campos completos</span>
                  <span>
                    {p.ad_ids.length
                      ? `${p.ad_ids.length} aviso${p.ad_ids.length > 1 ? "s" : ""} vinculado${p.ad_ids.length > 1 ? "s" : ""}`
                      : "Sin avisos vinculados"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
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

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-start gap-2.5 rounded-lg border p-3 text-left ${
        checked ? "border-brand bg-brand-soft" : "border-line"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${
          checked ? "bg-brand" : "bg-[#cfd4d9]"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow transition ${checked ? "translate-x-4" : ""}`}
        />
      </span>
      <span>
        <span className="block text-sm font-medium leading-tight">{label}</span>
        <span className="block text-[11px] text-muted">{hint}</span>
      </span>
    </button>
  );
}

const SPAN = {
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  6: "sm:col-span-6",
} as const;

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  const span = SPAN[field.span ?? 3];
  const label = <span className="mb-1 block text-xs font-medium text-muted">{field.label}</span>;

  if (field.type === "multi") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className={`col-span-6 ${span}`}>
        {label}
        <div className="flex flex-wrap gap-1.5">
          {field.options!.map((opt) => {
            const on = selected.includes(opt);
            return (
              <button
                type="button"
                key={opt}
                onClick={() =>
                  onChange(on ? selected.filter((x) => x !== opt) : [...selected, opt])
                }
                className={`rounded-full border px-2.5 py-1 text-xs ${
                  on
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-line text-muted hover:text-ink"
                }`}
              >
                {on ? "✓ " : ""}
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const str = typeof value === "string" ? value : "";
  return (
    <label className={`col-span-6 block ${span}`}>
      {label}
      {field.type === "select" ? (
        <select className={inputClass} value={str} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options!.map((o) => (
            <option key={o}>{o}</option>
          ))}
          {str && !field.options!.includes(str) && <option>{str}</option>}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          className={`${inputClass} min-h-[72px]`}
          value={str}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={inputClass}
          value={str}
          placeholder={field.placeholder}
          inputMode={field.type === "number" ? "decimal" : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
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
  const [busy, setBusy] = useState<null | "save" | "pdf" | "delete" | "photos" | "describe">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setDetail = (k: string, v: string | string[]) =>
    setForm((f) => ({ ...f, details: { ...f.details, [k]: v } }));
  const toggleModality = (m: Modality) =>
    setForm((f) => ({
      ...f,
      modalities: f.modalities.includes(m)
        ? f.modalities.filter((x) => x !== m)
        : MODALITY_KEYS.filter((x) => x === m || f.modalities.includes(x)),
    }));

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

  const describe = async () => {
    if (
      form.web_description.trim() &&
      !confirm("¿Reemplazar la descripción actual por una nueva redactada por la IA?")
    )
      return;
    setBusy("describe");
    setError(null);
    try {
      const res = await fetch("/api/properties/describe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      set("web_description", data.text);
      setNotice("Descripción redactada. Revísala y ajústala antes de guardar.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (
      !id ||
      !confirm(
        `¿Eliminar ${form.code} para siempre?\n\nSi solo se arrendó o vendió, es mejor desmarcar "Disponible": así se conserva la ficha y la IA puede avisar que ya no está.`,
      )
    )
      return;
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
          title: f.title || data.title || "",
          sector: f.sector || data.sector || "",
          address: f.address || data.address || "",
          bedrooms: f.bedrooms || (data.bedrooms?.toString() ?? ""),
          bathrooms: f.bathrooms || (data.bathrooms?.toString() ?? ""),
          area_m2: f.area_m2 || (data.area_m2?.toString() ?? ""),
          modalities: MODALITY_KEYS.filter(
            (m) => f.modalities.includes(m) || (data.modalities ?? []).includes(m),
          ),
          // Lo que ya escribió Fernanda tiene prioridad sobre lo leído del PDF.
          details: { ...(data.details ?? {}), ...f.details },
          brief: [f.brief, data.brief].filter(Boolean).join("\n"),
        }));
        setNotice(
          "La IA leyó el PDF y completó lo que encontró. Revisa la ficha antes de guardar.",
        );
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(null);
      }
    } else {
      const text = await file.text();
      setForm((f) => ({ ...f, brief: [f.brief, text.trim()].filter(Boolean).join("\n") }));
      setNotice("Texto agregado a la información adicional.");
    }
  };

  const basic = (
    label: string,
    k: "code" | "title" | "sector" | "address" | "bedrooms" | "bathrooms" | "area_m2",
    span: 2 | 3 | 4 | 6,
    placeholder?: string,
  ) => (
    <label className={`col-span-6 block ${SPAN[span]}`}>
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input
        className={inputClass}
        value={form[k]}
        placeholder={placeholder}
        onChange={(e) => set(k, e.target.value)}
      />
    </label>
  );

  const sections = sectionsFor(form.modalities);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-3xl flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-semibold">{id ? `Ficha ${initial.code}` : "Nueva propiedad"}</h2>
          <button className="text-muted hover:text-ink" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          <div
            className="rounded-xl border border-dashed border-brand/40 bg-brand-soft/50 p-4 text-sm"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) upload(f);
            }}
          >
            <div className="font-medium text-brand">¿Tienes el brief en PDF?</div>
            <p className="text-xs text-muted">
              Arrástralo aquí y la IA completa la ficha por ti (solo los campos que estén vacíos).
              También acepta .txt o .md.
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

          <section>
            <h3 className="mb-2 text-sm font-semibold">1. Identificación</h3>
            <div className="grid grid-cols-6 gap-3">
              {basic("Código *", "code", 2, "REN-01")}
              <div className="hidden sm:col-span-4 sm:block" />
              {basic("Título *", "title", 6, "Depto 2D2B vista al mar, Reñaca")}
              {basic("Sector / comuna", "sector", 3, "Reñaca")}
              {basic("Dirección o referencia", "address", 3, "Av. Borgoño altura 15.000")}
              {basic("Dormitorios", "bedrooms", 2)}
              {basic("Baños", "bathrooms", 2)}
              {basic("m² útiles", "area_m2", 2)}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold">2. Fotos</h3>
            <PhotoManager
              photos={form.photos}
              onChange={(updater) => setForm((f) => ({ ...f, photos: updater(f.photos) }))}
              onBusy={(b) => setBusy(b ? "photos" : null)}
            />
          </section>

          <section>
            <h3 className="text-sm font-semibold">3. Modalidades *</h3>
            <p className="mb-2 text-xs text-muted">
              Marca todas las que apliquen. Se abre una sección por cada una.
            </p>
            <div className="grid gap-2 sm:grid-cols-4">
              {MODALITY_KEYS.map((m) => {
                const on = form.modalities.includes(m);
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => toggleModality(m)}
                    className={`rounded-xl border p-3 text-left transition ${
                      on ? "border-brand bg-brand-soft" : "border-line hover:border-brand/50"
                    }`}
                  >
                    <div className="flex items-start gap-2 text-sm font-semibold leading-tight">
                      <span
                        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ${
                          on ? "border-brand bg-brand text-white" : "border-line"
                        }`}
                      >
                        {on ? "✓" : ""}
                      </span>
                      {MODALITIES[m].label}
                    </div>
                    <div className="mt-1 pl-6 text-[11px] text-muted">{MODALITIES[m].hint}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {sections.map((section, i) => {
            const total = section.fields.length;
            const done = section.fields.filter((f) => {
              const v = form.details[f.key];
              return Array.isArray(v) ? v.length > 0 : Boolean(v);
            }).length;
            return (
              <section
                key={section.id}
                className={section.modality ? "rounded-xl border border-line p-4" : ""}
              >
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-sm font-semibold">
                    {i + 4}. {section.title}
                  </h3>
                  {section.modality && <ModalityPills modalities={[section.modality]} />}
                  <span className="ml-auto text-[11px] text-muted">
                    {done} de {total}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {section.fields.map((f) => (
                    <FieldInput
                      key={f.key}
                      field={f}
                      value={form.details[f.key]}
                      onChange={(v) => setDetail(f.key, v)}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">{sections.length + 4}. Información adicional</h3>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">
                Todo lo que no calce arriba y preguntas frecuentes (la IA lo usa)
              </span>
              <textarea
                className={`${inputClass} min-h-[110px]`}
                value={form.brief}
                placeholder={
                  "¿Se puede pintar? Sí, con autorización.\n¿Hay ruido? Calle tranquila, sin locales nocturnos."
                }
                onChange={(e) => set("brief", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">
                IDs de avisos de Meta vinculados (separados por coma)
              </span>
              <input
                className={inputClass}
                value={form.ad_ids}
                placeholder="120210000000000001, 120210000000000002"
                onChange={(e) => set("ad_ids", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">
                Links para compartir (portal, fotos, tour 360)
              </span>
              <input
                className={inputClass}
                value={form.links}
                onChange={(e) => set("links", e.target.value)}
              />
            </label>
          </section>

          <section className="rounded-xl border border-line p-4">
            <h3 className="text-sm font-semibold">{sections.length + 5}. Web pública</h3>
            <p className="mb-3 text-xs text-muted">
              Cómo aparece esta propiedad en la web. Las notas privadas nunca se publican.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Toggle
                checked={form.published}
                onChange={(v) => set("published", v)}
                label="Publicar en la web"
                hint={form.active ? "Visible para cualquiera" : "No se verá mientras no esté disponible"}
              />
              <Toggle
                checked={form.featured}
                onChange={(v) => set("featured", v)}
                label="Destacada"
                hint="Aparece en la portada"
              />
              <Toggle
                checked={form.show_address}
                onChange={(v) => set("show_address", v)}
                label="Mostrar dirección exacta"
                hint="Si no, solo se muestra el sector"
              />
            </div>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted">Descripción para la web</span>
                <Button
                  variant="ghost"
                  className="!px-2 !py-1 text-xs"
                  disabled={busy !== null}
                  onClick={describe}
                >
                  {busy === "describe" ? "Redactando…" : "✦ Redactar con IA"}
                </Button>
              </div>
              <textarea
                className={`${inputClass} min-h-[120px]`}
                value={form.web_description}
                placeholder="Un texto atractivo de 2 o 3 párrafos. Llena la ficha y usa “Redactar con IA” para un primer borrador."
                onChange={(e) => set("web_description", e.target.value)}
              />
            </div>
          </section>

          <section className="rounded-xl bg-[#f4f4f2] p-4">
            <h3 className="text-sm font-semibold">Notas privadas</h3>
            <p className="mb-2 text-xs text-muted">
              Solo para ti: la IA nunca las ve. Por ejemplo, el precio mínimo del propietario, la
              comisión o el contacto del dueño.
            </p>
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={form.private_notes}
              onChange={(e) => set("private_notes", e.target.value)}
            />
          </section>

          <label
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
              form.active ? "border-line" : "border-bad/40 bg-[#fbf3f2]"
            }`}
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
            />
            <span>
              <span className="font-semibold">Disponible</span>
              <span className="block text-xs text-muted">
                Desmárcala cuando se arriende, se venda o el dueño la retire. La ficha se guarda
                para el historial y la IA les dirá a quienes pregunten que ya no está disponible,
                ofreciendo alternativas parecidas.
              </span>
            </span>
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
              {busy === "save" ? "Guardando…" : busy === "photos" ? "Subiendo fotos…" : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
