"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { MODALITIES, type Modality } from "@/lib/ficha";
import type { Channel, Confidence, ConversationStatus } from "@/lib/types";

export const CHANNELS: Record<Channel, { label: string; short: string; className: string }> = {
  whatsapp: { label: "WhatsApp", short: "WA", className: "bg-[#e3f4ea] text-[#1f7a46]" },
  instagram: { label: "Instagram", short: "IG", className: "bg-[#f9e6ef] text-[#a8326b]" },
  messenger: { label: "Messenger", short: "FB", className: "bg-[#e5eefb] text-[#2b5ea8]" },
  web: { label: "Web", short: "WEB", className: "bg-[#eef0f2] text-ink" },
};

export const STATUSES: Record<ConversationStatus, { label: string; className: string }> = {
  nuevo: { label: "Nuevo", className: "bg-accent-soft text-accent" },
  respondido: { label: "Respondido", className: "bg-brand-soft text-brand" },
  visita: { label: "Visita agendada", className: "bg-[#e7f3ec] text-ok" },
  cerrado: { label: "Cerrado", className: "bg-[#eceef0] text-muted" },
  descartado: { label: "Descartado", className: "bg-[#eceef0] text-muted" },
};

export const CONFIDENCE: Record<Confidence, { label: string; className: string }> = {
  alta: { label: "Seguridad alta", className: "bg-[#e7f3ec] text-ok" },
  media: { label: "Seguridad media", className: "bg-[#fbf1df] text-warn" },
  baja: { label: "Sin identificar", className: "bg-[#f8e5e3] text-bad" },
};

export function ChannelBadge({ channel, full = false }: { channel: Channel; full?: boolean }) {
  const c = CHANNELS[channel];
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold tracking-wide ${c.className}`}
      title={c.label}
    >
      {full ? c.label : c.short}
    </span>
  );
}

export function Pill({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export const MODALITY_STYLE: Record<Modality, string> = {
  airbnb: "bg-[#fdeceb] text-[#b23a3a]",
  anual: "bg-brand-soft text-brand",
  temporada: "bg-[#efe9f8] text-[#5b3f99]",
  venta: "bg-accent-soft text-accent",
};

export function ModalityPills({ modalities }: { modalities: Modality[] }) {
  return (
    <>
      {modalities.map((m) => (
        <Pill key={m} className={MODALITY_STYLE[m]}>
          {MODALITIES[m].short}
        </Pill>
      ))}
    </>
  );
}

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary: "bg-brand text-white hover:bg-[#173d4b] disabled:bg-[#9db3bb]",
    secondary: "bg-white text-ink border border-line hover:bg-[#f1f2f4] disabled:text-muted",
    ghost: "text-brand hover:bg-brand-soft disabled:text-muted",
    danger: "bg-white text-bad border border-line hover:bg-[#f8e5e3]",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${styles} ${className}`}
    />
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft";

export interface AppStatus {
  store: "memoria" | "supabase";
  ai: boolean;
  auth: boolean;
  channels: Record<Channel, boolean>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<AppStatus | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  const nav = [
    { href: "/admin", label: "Bandeja" },
    { href: "/admin/propiedades", label: "Propiedades" },
    { href: "/admin/reservas", label: "Reservas" },
  ];

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line bg-white px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
            FD
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Fernanda Donoso</div>
            <div className="text-[11px] text-muted">Gestión Inmobiliaria</div>
          </div>
        </div>
        <nav className="flex gap-1">
          {nav.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  active ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden flex-wrap items-center gap-2 text-xs sm:flex">
          {status && (
            <>
              {status.store === "memoria" && (
                <Pill className="bg-[#fbf1df] text-warn">
                  Modo demo: los datos se reinician
                </Pill>
              )}
              <Pill className={status.ai ? "bg-[#e7f3ec] text-ok" : "bg-[#eceef0] text-muted"}>
                {status.ai ? "IA conectada" : "IA sin configurar (borradores de plantilla)"}
              </Pill>
              {(["whatsapp", "messenger", "instagram"] as Channel[]).map((ch) => (
                <span
                  key={ch}
                  title={status.channels[ch] ? `${CHANNELS[ch].label} conectado` : `${CHANNELS[ch].label} sin conectar: envíos simulados`}
                  className={status.channels[ch] ? "" : "opacity-40"}
                >
                  <ChannelBadge channel={ch} />
                </span>
              ))}
              {status.auth && (
                <button
                  className="ml-1 text-muted underline-offset-2 hover:underline"
                  onClick={async () => {
                    await fetch("/api/logout", { method: "POST" });
                    router.push("/login");
                  }}
                >
                  Salir
                </button>
              )}
            </>
          )}
        </div>
      </header>
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 60_000;
  if (diff < 1) return "ahora";
  if (diff < 60) return `hace ${Math.round(diff)} min`;
  if (diff < 60 * 24) return `hace ${Math.round(diff / 60)} h`;
  const d = Math.round(diff / 60 / 24);
  return d === 1 ? "ayer" : `hace ${d} días`;
}

export function clock(iso: string): string {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return d.toLocaleString("es-CL", today
    ? { hour: "2-digit", minute: "2-digit" }
    : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** Horas restantes de la ventana de 24 h para responder con mensaje libre. */
export function windowLeft(lastCustomerAt: string | null): number | null {
  if (!lastCustomerAt) return null;
  return 24 - (Date.now() - new Date(lastCustomerAt).getTime()) / 3_600_000;
}
