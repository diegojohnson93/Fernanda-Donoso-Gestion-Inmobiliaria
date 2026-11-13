"use client";

import { useEffect, useMemo, useState } from "react";
import type { Property, Reservation, ReservationStatus } from "@/lib/types";
import { Button, Pill, inputClass } from "./ui";

const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
const short = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}${y !== new Date().getFullYear() ? ` ${y}` : ""}`;
};
const nights = (r: { check_in: string; check_out: string }) =>
  Math.round(
    (Date.parse(`${r.check_out}T12:00:00Z`) -
      Date.parse(`${r.check_in}T12:00:00Z`)) /
      86_400_000,
  );
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(
    new Date(),
  );

const clp = (v: string) => {
  const d = (v ?? "").replace(/[^\d]/g, "");
  return d ? Number(d) : null;
};
const fmt = (n: number) => `$${n.toLocaleString("es-CL")}`;
/** Saldo pendiente (total − recibido), o null si falta alguno. */
const balance = (amount: string, total: string) => {
  const t = clp(total);
  const a = clp(amount);
  return t === null || a === null ? null : Math.max(0, t - a);
};

const STATUS: Record<ReservationStatus, { label: string; className: string }> =
  {
    pendiente: {
      label: "Pendiente de pago",
      className: "bg-[#fbf0dc] text-[#8a5a12]",
    },
    pagada: { label: "Pagada", className: "bg-[#e3f1e6] text-[#2f6b3d]" },
    cancelada: { label: "Cancelada", className: "bg-[#eeeeee] text-[#666]" },
  };

type Emails = { to: string; sent: boolean; error?: string }[];

function emailNotice(emails: Emails): string {
  if (!emails.length) return "";
  const ok = emails.filter((e) => e.sent).map((e) => e.to);
  const bad = emails.filter((e) => !e.sent);
  return [
    ok.length ? `Correo enviado a ${ok.join(", ")}.` : "",
    bad.length ? `No se envió el correo (${bad[0].error ?? "error"}).` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Reservations() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const load = async () => {
    const res = await fetch("/api/reservations");
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.error ?? "No se pudieron cargar las reservas");
    setItems(data);
    setError(null);
  };
  useEffect(() => {
    const t = setTimeout(
      () =>
        load()
          .catch((e) => setError(e instanceof Error ? e.message : String(e)))
          .finally(() => setLoading(false)),
      0,
    );
    return () => clearTimeout(t);
  }, []);

  const replace = (r: Reservation) =>
    setItems((xs) => xs.map((x) => (x.id === r.id ? r : x)));

  const t = today();
  const groups = useMemo(() => {
    const active = items.filter(
      (r) => r.status !== "cancelada" && r.check_out >= t,
    );
    return {
      pendientes: active.filter((r) => r.status === "pendiente"),
      pagadas: active.filter((r) => r.status === "pagada"),
      pasadas: items
        .filter((r) => r.status === "cancelada" || r.check_out < t)
        .sort((a, b) => b.check_in.localeCompare(a.check_in)),
    };
  }, [items, t]);

  return (
    <div className="mx-auto h-full max-w-5xl overflow-y-auto p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Reservas</h1>
          <p className="max-w-2xl text-sm text-muted">
            Estadías cortas cobradas directo. Al marcar una reserva como pagada,
            el huésped recibe un correo de confirmación (con copia para ti) y,
            dos días antes de llegar, otro con la dirección y el check-in.
            Recuerda bloquear las fechas en Airbnb.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          + Nueva reserva
        </Button>
      </div>

      {notice && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-line bg-brand-soft px-4 py-3 text-sm text-brand">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-[#f8e5e3] px-4 py-3 text-sm text-bad">
          {error}
        </p>
      )}

      {creating && (
        <NewReservation
          onClose={() => setCreating(false)}
          onCreated={(r, emails) => {
            setItems((xs) => [...xs, r]);
            setCreating(false);
            setNotice(`Reserva guardada. ${emailNotice(emails)}`);
          }}
        />
      )}

      {loading ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : (
        <div className="space-y-8">
          <Group
            title="Pendientes de pago"
            empty="No hay solicitudes pendientes."
          >
            {groups.pendientes.map((r) => (
              <Card key={r.id} r={r} onChange={replace} onNotice={setNotice} />
            ))}
          </Group>
          <Group
            title="Próximas (pagadas)"
            empty="No hay estadías pagadas por venir."
          >
            {groups.pagadas.map((r) => (
              <Card key={r.id} r={r} onChange={replace} onNotice={setNotice} />
            ))}
          </Group>
          {groups.pasadas.length > 0 && (
            <div>
              <button
                className="text-sm font-medium text-brand"
                onClick={() => setShowPast((v) => !v)}
              >
                {showPast ? "Ocultar" : "Ver"} pasadas y canceladas (
                {groups.pasadas.length})
              </button>
              {showPast && (
                <div className="mt-3 space-y-3">
                  {groups.pasadas.map((r) => (
                    <Card
                      key={r.id}
                      r={r}
                      onChange={replace}
                      onNotice={setNotice}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Group({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">
        {title}{" "}
        <span className="font-normal text-muted">({children.length})</span>
      </h2>
      {children.length ? (
        <div className="space-y-3">{children}</div>
      ) : (
        <p className="text-sm text-muted">{empty}</p>
      )}
    </section>
  );
}

function Card({
  r,
  onChange,
  onNotice,
}: {
  r: Reservation;
  onChange: (r: Reservation) => void;
  onNotice: (s: string) => void;
}) {
  const [paying, setPaying] = useState(false);
  const [amount, setAmount] = useState(r.amount);
  const [total, setTotal] = useState(r.total);
  const preview = balance(amount, total);
  const bal = balance(r.amount, r.total);
  const [note, setNote] = useState(r.guest_note);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const n = nights(r);

  async function act(
    action: string,
    extra: Record<string, unknown> = {},
    confirmText?: string,
  ) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/reservations/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      onChange(data.reservation);
      setPaying(false);
      const msg = emailNotice(data.emails ?? []);
      if (msg) onNotice(msg);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-brand px-1.5 py-0.5 text-[11px] font-semibold text-white">
              {r.property_code}
            </span>
            <Pill className={STATUS[r.status].className}>
              {r.status === "pagada" && bal
                ? "Abono pagado"
                : STATUS[r.status].label}
            </Pill>
            {r.source === "web" && (
              <Pill className="bg-[#eef1f6] text-[#4b5b78]">Desde la web</Pill>
            )}
          </div>
          <p className="mt-2 font-semibold">
            {short(r.check_in)} → {short(r.check_out)}{" "}
            <span className="font-normal text-muted">
              · {n} {n === 1 ? "noche" : "noches"}
              {r.guests ? ` · ${r.guests} huéspedes` : ""}
            </span>
          </p>
          <p className="text-sm text-muted">{r.property_title}</p>
          <p className="mt-2 text-sm">
            <span className="font-medium">{r.name}</span>
            {r.phone && (
              <>
                {" · "}
                <a
                  className="text-brand underline"
                  href={`https://wa.me/${r.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {r.phone}
                </a>
              </>
            )}
            {r.email && (
              <>
                {" · "}
                <a className="text-brand underline" href={`mailto:${r.email}`}>
                  {r.email}
                </a>
              </>
            )}
          </p>
          {r.message && (
            <p className="mt-1 whitespace-pre-line text-sm text-muted">
              “{r.message}”
            </p>
          )}
          {r.status === "pagada" && (
            <p className="mt-2 text-xs text-muted">
              {r.amount
                ? bal
                  ? `Abonó ${r.amount} de ${r.total}. Saldo al llegar: ${fmt(bal)}. `
                  : `Pagó ${r.amount}${r.total && r.total !== r.amount ? ` (total ${r.total})` : ""}. `
                : ""}
              {r.reminder_sent_at
                ? "Recordatorio de llegada enviado."
                : "El recordatorio se envía solo 2 días antes."}
            </p>
          )}
          {!r.email && r.status !== "cancelada" && (
            <p className="mt-2 text-xs text-bad">
              Sin correo: no se le pueden enviar confirmaciones.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {r.status === "pendiente" && (
            <Button
              variant="primary"
              disabled={busy}
              onClick={() => setPaying((v) => !v)}
            >
              Marcar como pagada
            </Button>
          )}
          {r.status === "pagada" && r.email && (
            <Button
              disabled={busy}
              onClick={() =>
                act(
                  "recordatorio",
                  {},
                  "¿Enviar ahora el correo con la dirección y el check-in?",
                )
              }
            >
              Enviar recordatorio
            </Button>
          )}
          {r.status === "cancelada" ? (
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => act("pendiente")}
            >
              Reactivar
            </Button>
          ) : (
            <Button
              variant="danger"
              disabled={busy}
              onClick={() =>
                act(
                  "cancelar",
                  {},
                  "¿Cancelar esta reserva? No se envía ningún correo.",
                )
              }
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {paying && (
        <div className="mt-4 grid gap-3 rounded-lg bg-[#f6f7f9] p-3 sm:grid-cols-[150px_150px_1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
              Total de la estadía
            </span>
            <input
              className={inputClass}
              value={total}
              placeholder="$180.000"
              onChange={(e) => setTotal(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
              Monto recibido
            </span>
            <input
              className={inputClass}
              value={amount}
              placeholder="$60.000"
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">
              Nota para el huésped (opcional)
            </span>
            <input
              className={inputClass}
              value={note}
              placeholder="Te espero con el depto listo. La clave de la caja de llaves te la envío el día de llegada."
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <Button
            variant="primary"
            disabled={busy}
            onClick={() => act("pagada", { amount, total, guest_note: note })}
          >
            {busy ? "Enviando…" : "Confirmar y enviar correo"}
          </Button>
          <p className="text-xs text-muted sm:col-span-4">
            {preview
              ? `Es un abono: el correo le indicará que paga el saldo de ${fmt(preview)} al llegar.`
              : "Si cobras solo la reserva, anota el total y lo recibido: el correo le indicará el saldo a pagar al llegar."}
          </p>
        </div>
      )}
      {err && <p className="mt-3 text-sm text-bad">{err}</p>}
    </div>
  );
}

function NewReservation({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (r: Reservation, emails: Emails) => void;
}) {
  const [props, setProps] = useState<Property[]>([]);
  const [f, setF] = useState({
    property_code: "",
    check_in: "",
    check_out: "",
    guests: "",
    name: "",
    phone: "",
    email: "",
    message: "",
    paid: true,
    total: "",
    amount: "",
    guest_note: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((ps: Property[]) => {
        const list = ps.filter(
          (p) => p.active && p.modalities?.includes("airbnb"),
        );
        setProps(list);
        if (list.length === 1)
          setF((x) => ({ ...x, property_code: list[0].code }));
      })
      .catch(() => {});
  }, []);

  const set = (k: keyof typeof f, v: string | boolean) =>
    setF((x) => ({ ...x, [k]: v }));
  const field = (
    label: string,
    k: keyof typeof f,
    type = "text",
    placeholder?: string,
  ) => (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input
        className={inputClass}
        type={type}
        value={f[k] as string}
        placeholder={placeholder}
        onChange={(e) => set(k, e.target.value)}
      />
    </label>
  );

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      onCreated(data.reservation, data.emails ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-brand/30 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Nueva reserva</h2>
        <button
          className="text-muted hover:text-ink"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
      <p className="mb-4 text-sm text-muted">
        Para reservas acordadas por WhatsApp. Si ya pagó, el huésped recibe la
        confirmación por correo; si no, le llegan los datos de transferencia.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block sm:col-span-3">
          <span className="mb-1 block text-xs font-medium text-muted">
            Propiedad
          </span>
          <select
            className={inputClass}
            value={f.property_code}
            onChange={(e) => set("property_code", e.target.value)}
          >
            <option value="">—</option>
            {props.map((p) => (
              <option key={p.id} value={p.code}>
                {p.code} · {p.title}
              </option>
            ))}
          </select>
          {!props.length && (
            <span className="mt-1 block text-xs text-muted">
              No hay propiedades activas con modalidad Airbnb.
            </span>
          )}
        </label>
        {field("Llegada", "check_in", "date")}
        {field("Salida", "check_out", "date")}
        {field("Huéspedes", "guests", "number")}
        {field("Nombre", "name")}
        {field("Teléfono", "phone", "tel", "+56 9")}
        {field("Correo", "email", "email")}
        <label className="flex items-center gap-2 text-sm sm:col-span-3">
          <input
            type="checkbox"
            checked={f.paid}
            onChange={(e) => set("paid", e.target.checked)}
          />
          Ya pagó (enviar confirmación)
        </label>
        {f.paid && (
          <>
            {field("Total de la estadía", "total", "text", "$180.000")}
            {field("Monto recibido", "amount", "text", "$60.000")}
            {field("Nota para el huésped (opcional)", "guest_note")}
          </>
        )}
      </div>
      {err && <p className="mt-3 text-sm text-bad">{err}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="primary" disabled={busy} onClick={save}>
          {busy ? "Guardando…" : "Guardar reserva"}
        </Button>
      </div>
    </div>
  );
}
