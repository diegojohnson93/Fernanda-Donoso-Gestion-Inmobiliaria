"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { whatsappLink } from "@/lib/site";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MAX_MONTHS_AHEAD = 11;

const pad = (n: number) => String(n).padStart(2, "0");
const key = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
function addDays(day: string, n: number) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function nightsBetween(a: string, b: string) {
  return Math.round(
    (Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000,
  );
}
function pretty(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return `${d} de ${MONTHS[m - 1].toLowerCase()}${y !== new Date().getFullYear() ? ` de ${y}` : ""}`;
}
function todayKey() {
  const t = new Date();
  return key(t.getFullYear(), t.getMonth(), t.getDate());
}
const noopSubscribe = () => () => {};

/**
 * Calendario de disponibilidad (leído desde Airbnb) para elegir llegada y
 * salida, y reservar directo por WhatsApp.
 */
export function AvailabilityCalendar({
  busy,
  synced,
  code,
  title,
  minNights,
  requestEnabled = false,
}: {
  busy: string[];
  /** true si las fechas ocupadas vienen del calendario de Airbnb */
  synced: boolean;
  code: string;
  title: string;
  minNights?: string;
  /** Muestra "Solicitar por correo" (requiere los correos configurados). */
  requestEnabled?: boolean;
}) {
  const busySet = useMemo(() => new Set(busy), [busy]);
  // "Hoy" depende de la zona horaria del visitante: se calcula solo en el navegador.
  const today = useSyncExternalStore(noopSubscribe, todayKey, () => null);
  const [offset, setOffset] = useState(0);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submitRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    const fd = new FormData(e.currentTarget);
    setSending(true);
    setFormError(null);
    try {
      const res = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_code: code,
          check_in: checkIn,
          check_out: checkOut,
          name: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          guests: fd.get("guests"),
          message: fd.get("message"),
          website: fd.get("website"),
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? "No pudimos enviar la solicitud.");
      setSent(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  }

  /** ¿Están libres todas las noches entre a (incluida) y b (excluida)? */
  const rangeFree = (a: string, b: string) => {
    for (let d = a; d < b; d = addDays(d, 1)) if (busySet.has(d)) return false;
    return true;
  };

  function pick(day: string) {
    setNotice(null);
    setSent(false);
    if (!checkIn || checkOut || day <= checkIn) {
      if (busySet.has(day))
        return setNotice(
          "Esa noche ya está ocupada. Elige otro día de llegada.",
        );
      setCheckIn(day);
      setCheckOut(null);
      return;
    }
    if (!rangeFree(checkIn, day)) {
      setNotice(
        "Hay noches ocupadas entre esas fechas. Elige otra salida o cambia la llegada.",
      );
      return;
    }
    setCheckOut(day);
  }

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const previewEnd =
    checkIn &&
    !checkOut &&
    hover &&
    hover > checkIn &&
    rangeFree(checkIn, hover)
      ? hover
      : null;

  const message =
    checkIn && checkOut
      ? `Hola Fernanda, quiero reservar ${code} — ${title}, llegando el ${pretty(checkIn)} y saliendo el ${pretty(checkOut)} (${nights} ${nights === 1 ? "noche" : "noches"}). ¿Está disponible?`
      : `Hola Fernanda, quiero consultar disponibilidad para reservar ${code} — ${title}.`;

  const [ty, tm] = (today ?? "2000-01").split("-").map(Number);
  const months = [0, 1].map((i) => {
    const d = new Date(ty, tm - 1 + offset + i, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  return (
    <div className="border border-charcoal/15 bg-white">
      <div className="border-b border-charcoal/10 p-6 md:p-8">
        <h2 className="font-serif text-3xl md:text-4xl">
          Reserva directo por WhatsApp
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-graphite">
          Elige tus fechas y escríbenos: reservas directamente con nosotros, con
          atención personal y sin pagar las comisiones de la plataforma.
        </p>
      </div>

      <div className="p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
            aria-label="Mes anterior"
            className="grid h-9 w-9 place-items-center border border-charcoal/20 transition hover:bg-cream disabled:opacity-30"
          >
            ←
          </button>
          <div className="flex items-center gap-4 text-xs text-stone">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 border border-charcoal/25 bg-white" />{" "}
              Libre
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 bg-charcoal/10" /> Ocupado
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              setOffset((o) => Math.min(MAX_MONTHS_AHEAD - 1, o + 1))
            }
            disabled={offset >= MAX_MONTHS_AHEAD - 1}
            aria-label="Mes siguiente"
            className="grid h-9 w-9 place-items-center border border-charcoal/20 transition hover:bg-cream disabled:opacity-30"
          >
            →
          </button>
        </div>

        {!today ? (
          <div className="h-[330px] animate-pulse bg-cream/60" />
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {months.map(({ y, m }, idx) => {
              const first = (new Date(y, m, 1).getDay() + 6) % 7; // lunes = 0
              const total = new Date(y, m + 1, 0).getDate();
              return (
                <div
                  key={`${y}-${m}`}
                  className={idx === 1 ? "hidden md:block" : ""}
                >
                  <p className="mb-3 text-center font-serif text-xl">
                    {MONTHS[m]} {y}
                  </p>
                  <div className="grid grid-cols-7 text-center text-[11px] text-stone">
                    {DAYS.map((d, i) => (
                      <span key={i} className="pb-2">
                        {d}
                      </span>
                    ))}
                  </div>
                  <div
                    className="grid grid-cols-7 gap-y-1 text-center text-sm"
                    onMouseLeave={() => setHover(null)}
                  >
                    {Array.from({ length: first }, (_, i) => (
                      <span key={`e${i}`} />
                    ))}
                    {Array.from({ length: total }, (_, i) => {
                      const day = key(y, m, i + 1);
                      const past = day < (today ?? "");
                      const taken = busySet.has(day);
                      const end = checkOut ?? previewEnd;
                      const isStart = day === checkIn;
                      const isEnd = day === end;
                      const inRange =
                        checkIn && end && day > checkIn && day < end;
                      // Se puede elegir como salida un día ocupado si la noche anterior está libre.
                      const canCheckout = Boolean(
                        checkIn &&
                        !checkOut &&
                        day > checkIn &&
                        rangeFree(checkIn, day),
                      );
                      const disabled = past || (taken && !canCheckout);
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={disabled}
                          onClick={() => pick(day)}
                          onMouseEnter={() => setHover(day)}
                          aria-label={`${pretty(day)}${taken ? ", ocupado" : ""}`}
                          className={[
                            "mx-auto grid h-9 w-full place-items-center transition-colors",
                            past ? "text-charcoal/20" : "",
                            taken && !past
                              ? "bg-charcoal/10 text-charcoal/35 line-through"
                              : "",
                            inRange ? "bg-cream" : "",
                            isStart || isEnd
                              ? "bg-charcoal text-cream no-underline"
                              : "",
                            !disabled && !isStart && !isEnd
                              ? "hover:bg-cream"
                              : "",
                            disabled ? "cursor-not-allowed" : "",
                          ].join(" ")}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 border-t border-charcoal/10 pt-6">
          <p className="min-h-[1.5em] text-sm">
            {checkIn && checkOut ? (
              <>
                <strong className="font-medium">{pretty(checkIn)}</strong> →{" "}
                <strong className="font-medium">{pretty(checkOut)}</strong> ·{" "}
                {nights} {nights === 1 ? "noche" : "noches"}
              </>
            ) : checkIn ? (
              <span className="text-stone">
                Llegada el {pretty(checkIn)}. Ahora elige el día de salida.
              </span>
            ) : (
              <span className="text-stone">
                Toca el día de llegada y luego el de salida.
              </span>
            )}
          </p>
          {notice && <p className="mt-2 text-sm text-[#b4423a]">{notice}</p>}
          {minNights && (
            <p className="mt-1 text-xs text-stone">
              Mínimo de noches: {minNights}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={whatsappLink(message)}
              target="_blank"
              rel="noreferrer"
              className="eyebrow inline-flex h-12 items-center bg-charcoal px-7 text-cream transition hover:bg-graphite"
            >
              {checkIn && checkOut
                ? "Reservar por WhatsApp"
                : "Consultar por WhatsApp"}
            </a>
            {requestEnabled && checkIn && checkOut && !sent && (
              <button
                type="button"
                onClick={() => setRequesting((v) => !v)}
                className="eyebrow inline-flex h-12 items-center border border-charcoal px-6 transition hover:bg-cream"
              >
                Solicitar por correo
              </button>
            )}
            {(checkIn || checkOut) && (
              <button
                type="button"
                onClick={() => {
                  setCheckIn(null);
                  setCheckOut(null);
                  setNotice(null);
                }}
                className="text-xs text-stone underline underline-offset-4 hover:text-charcoal"
              >
                Borrar fechas
              </button>
            )}
          </div>
          {requestEnabled && checkIn && checkOut && sent && (
            <div className="mt-6 bg-cream p-5 text-sm leading-relaxed">
              <p className="font-serif text-2xl">¡Solicitud enviada!</p>
              <p className="mt-2 text-graphite">
                Te enviamos un correo con los pasos para confirmar tu reserva.
                Fernanda te escribirá por WhatsApp a la brevedad.
              </p>
            </div>
          )}
          {requestEnabled && checkIn && checkOut && requesting && !sent && (
            <form
              onSubmit={submitRequest}
              className="mt-6 grid gap-4 border-t border-charcoal/10 pt-6 sm:grid-cols-2"
            >
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden
              />
              {[
                {
                  name: "name",
                  label: "Nombre",
                  type: "text",
                  auto: "name",
                  span: true,
                },
                {
                  name: "phone",
                  label: "Teléfono",
                  type: "tel",
                  auto: "tel",
                  span: false,
                },
                {
                  name: "email",
                  label: "Correo",
                  type: "email",
                  auto: "email",
                  span: false,
                },
              ].map((f) => (
                <label
                  key={f.name}
                  className={`block ${f.span ? "sm:col-span-2" : ""}`}
                >
                  <span className="eyebrow !text-[9.5px] text-stone">
                    {f.label}
                  </span>
                  <input
                    name={f.name}
                    type={f.type}
                    required
                    autoComplete={f.auto}
                    className="mt-1 w-full border-b border-charcoal/25 bg-transparent py-2 text-[15px] outline-none focus:border-charcoal"
                  />
                </label>
              ))}
              <label className="block">
                <span className="eyebrow !text-[9.5px] text-stone">
                  Huéspedes
                </span>
                <input
                  name="guests"
                  type="number"
                  min={1}
                  max={50}
                  className="mt-1 w-full border-b border-charcoal/25 bg-transparent py-2 text-[15px] outline-none focus:border-charcoal"
                />
              </label>
              <label className="block">
                <span className="eyebrow !text-[9.5px] text-stone">
                  Mensaje (opcional)
                </span>
                <input
                  name="message"
                  className="mt-1 w-full border-b border-charcoal/25 bg-transparent py-2 text-[15px] outline-none focus:border-charcoal"
                />
              </label>
              {formError && (
                <p className="text-sm text-[#b4423a] sm:col-span-2">
                  {formError}
                </p>
              )}
              <div className="sm:col-span-2">
                <button
                  disabled={sending}
                  className="eyebrow inline-flex h-12 items-center bg-charcoal px-7 text-cream transition hover:bg-graphite disabled:opacity-50"
                >
                  {sending ? "Enviando…" : "Enviar solicitud"}
                </button>
                <p className="mt-3 text-xs text-stone">
                  Te llegará un correo con los datos de pago. La reserva queda
                  confirmada al recibir el pago.
                </p>
              </div>
            </form>
          )}

          <p className="mt-4 text-xs leading-relaxed text-stone">
            {synced
              ? "Disponibilidad sincronizada con nuestro calendario; puede tardar unas horas en actualizarse. Confirmamos cada reserva por WhatsApp."
              : "Elige tus fechas y te confirmamos la disponibilidad por WhatsApp."}
          </p>
        </div>
      </div>
    </div>
  );
}
