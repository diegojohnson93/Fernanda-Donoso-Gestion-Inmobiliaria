"use client";

import { useState, type FormEvent, type ReactNode } from "react";

const field =
  "w-full border-0 border-b border-current/25 bg-transparent px-0 py-2.5 text-[15px] outline-none placeholder:text-current/45 focus:border-current";

function Label({ children }: { children: ReactNode }) {
  return <span className="eyebrow mb-1 block !text-[9.5px] opacity-70">{children}</span>;
}

async function submit(payload: Record<string, unknown>) {
  const res = await fetch("/api/public/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "No pudimos enviar tu mensaje. Intenta nuevamente.");
}

function useForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const onSubmit = (build: (fd: FormData) => Record<string, unknown>) => async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");
    setError(null);
    try {
      await submit(build(new FormData(e.currentTarget)));
      setState("sent");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  };
  return { state, error, onSubmit };
}

/** Campo oculto para bots: las personas no lo ven ni lo llenan. */
const Honeypot = () => (
  <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
);

function Sent({ title, text }: { title: string; text: string }) {
  return (
    <div className="py-6">
      <p className="font-serif text-3xl">{title}</p>
      <p className="mt-2 text-sm opacity-75">{text}</p>
    </div>
  );
}

export function ContactForm({
  propertyCode,
  placeholder = "¿En qué te podemos ayudar?",
  submitLabel = "Enviar mensaje",
}: {
  propertyCode?: string;
  placeholder?: string;
  submitLabel?: string;
}) {
  const { state, error, onSubmit } = useForm();
  if (state === "sent") {
    return <Sent title="¡Gracias por escribir!" text="Te responderemos a la brevedad por WhatsApp o correo." />;
  }
  return (
    <form
      onSubmit={onSubmit((fd) => ({
        kind: "consulta",
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        message: fd.get("message"),
        property_code: propertyCode,
        website: fd.get("website"),
      }))}
      className="space-y-5"
    >
      <Honeypot />
      <label className="block">
        <Label>Nombre</Label>
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <Label>Teléfono</Label>
          <input name="phone" type="tel" autoComplete="tel" placeholder="+56 9" className={field} />
        </label>
        <label className="block">
          <Label>Correo</Label>
          <input name="email" type="email" autoComplete="email" className={field} />
        </label>
      </div>
      <label className="block">
        <Label>Mensaje</Label>
        <textarea name="message" rows={3} placeholder={placeholder} className={`${field} resize-none`} />
      </label>
      {error && <p className="text-sm text-[#b4423a]">{error}</p>}
      <button
        disabled={state === "sending"}
        className="eyebrow inline-flex h-12 items-center border border-current px-7 transition hover:bg-current/10 disabled:opacity-50"
      >
        {state === "sending" ? "Enviando…" : submitLabel}
      </button>
      <p className="text-xs opacity-60">Déjanos al menos un teléfono o un correo para responderte.</p>
    </form>
  );
}

export function OwnerForm() {
  const { state, error, onSubmit } = useForm();
  if (state === "sent") {
    return (
      <Sent
        title="¡Gracias! Ya recibimos tus datos."
        text="Fernanda te contactará pronto para conocer tu propiedad y conversar los próximos pasos."
      />
    );
  }
  const select = `${field} appearance-none bg-[length:12px] bg-[right_center] bg-no-repeat`;
  return (
    <form
      onSubmit={onSubmit((fd) => ({
        kind: "propietario",
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        operation: fd.get("operation"),
        property_type: fd.get("property_type"),
        sector: fd.get("sector"),
        message: fd.get("message"),
        website: fd.get("website"),
      }))}
      className="space-y-5"
    >
      <Honeypot />
      <label className="block">
        <Label>Nombre</Label>
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <Label>Teléfono</Label>
          <input name="phone" type="tel" autoComplete="tel" placeholder="+56 9" className={field} />
        </label>
        <label className="block">
          <Label>Correo</Label>
          <input name="email" type="email" autoComplete="email" className={field} />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block">
          <Label>Quiero</Label>
          <select name="operation" className={select} defaultValue="">
            <option value="">Elegir…</option>
            <option>Arrendar en Airbnb</option>
            <option>Arrendar de marzo a diciembre</option>
            <option>Arrendar año corrido</option>
            <option>Vender</option>
            <option>Aún no lo decido</option>
          </select>
        </label>
        <label className="block">
          <Label>Tipo</Label>
          <select name="property_type" className={select} defaultValue="">
            <option value="">Elegir…</option>
            <option>Departamento</option>
            <option>Casa</option>
            <option>Casa en condominio</option>
            <option>Oficina o local</option>
            <option>Terreno o parcela</option>
          </select>
        </label>
        <label className="block">
          <Label>Sector</Label>
          <input name="sector" placeholder="Reñaca, Concón…" className={field} />
        </label>
      </div>
      <label className="block">
        <Label>Cuéntanos de tu propiedad</Label>
        <textarea
          name="message"
          rows={3}
          placeholder="Dormitorios, si está amoblada, desde cuándo está disponible…"
          className={`${field} resize-none`}
        />
      </label>
      {error && <p className="text-sm text-[#b4423a]">{error}</p>}
      <button
        disabled={state === "sending"}
        className="eyebrow inline-flex h-12 items-center border border-current px-7 transition hover:bg-current/10 disabled:opacity-50"
      >
        {state === "sending" ? "Enviando…" : "Quiero que me contacten"}
      </button>
    </form>
  );
}
