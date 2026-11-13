import { layout, nl2br, notifyEmail, plain, sendMail, type MailResult, type MailRow } from "./mail";
import { SITE, whatsappLink } from "./site";
import { getStore } from "./store";
import type { Property, Reservation, ReservationInput } from "./types";

/* ------------------------------------------------------------------------ */
/* Fechas                                                                    */
/* ------------------------------------------------------------------------ */

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export const isDay = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function nightsOf(r: { check_in: string; check_out: string }): number {
  return Math.round((Date.parse(`${r.check_out}T12:00:00Z`) - Date.parse(`${r.check_in}T12:00:00Z`)) / 86_400_000);
}

/** "viernes 4 de diciembre de 2026" */
export function longDate(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

/** Hoy en Chile, AAAA-MM-DD. */
export function todayChile(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date());
}

/** Noches ocupadas por reservas pagadas de una propiedad (bloquean el calendario de la web). */
export async function paidNights(propertyId: string): Promise<string[]> {
  const all = await getStore().listReservations();
  const nights: string[] = [];
  for (const r of all) {
    if (r.property_id !== propertyId || r.status !== "pagada") continue;
    for (let d = r.check_in; d < r.check_out; d = addDays(d, 1)) nights.push(d);
  }
  return nights;
}

/* ------------------------------------------------------------------------ */
/* Correos                                                                   */
/* ------------------------------------------------------------------------ */

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function siteUrl(): string {
  const raw = process.env.SITE_URL?.trim() || process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || "";
  if (!raw) return "";
  return (raw.startsWith("http") ? raw : `https://${raw}`).replace(/\/$/, "");
}

function stayRows(r: Reservation): MailRow[] {
  const n = nightsOf(r);
  return [
    { label: "Propiedad", value: `${r.property_title} (${r.property_code})` },
    { label: "Llegada", value: longDate(r.check_in) },
    { label: "Salida", value: longDate(r.check_out) },
    { label: "Noches", value: String(n) },
    { label: "Huéspedes", value: r.guests ? String(r.guests) : "" },
  ];
}

const footer = () =>
  `¿Dudas? Escríbenos por WhatsApp al ${SITE.whatsappDisplay} o responde este correo.`;

function guestWhatsapp(r: Reservation) {
  return {
    label: "Escribir por WhatsApp",
    href: whatsappLink(`Hola Fernanda, te escribo por mi reserva en ${r.property_code} (${longDate(r.check_in)}).`),
  };
}

/** Bloques con la información de la estadía (para la confirmación y el recordatorio). */
function stayInfo(p: Property | null, opts: { address: boolean }) {
  const d = p?.details ?? {};
  const html: { title: string; html: string }[] = [];
  const text: { title: string; text: string }[] = [];
  const add = (title: string, value: string) => {
    if (!value) return;
    html.push({ title, html: nl2br(value) });
    text.push({ title, text: value });
  };
  if (opts.address) add("Dirección", [p?.address, p?.sector].filter(Boolean).join(", "));
  add(
    "Llegada y salida",
    [str(d.checkin) && `Check-in: ${str(d.checkin)}`, str(d.checkout) && `Check-out: ${str(d.checkout)}`]
      .filter(Boolean)
      .join("\n"),
  );
  add("Reglas de la casa", str(d.reglas));
  return { html, text };
}

/** 1a. Al huésped: recibimos tu solicitud (con datos de transferencia). */
export async function mailRequestToGuest(r: Reservation): Promise<MailResult> {
  const transfer = process.env.TRANSFER_INFO?.trim();
  const title = "Recibimos tu solicitud de reserva";
  const intro = `Hola ${r.name.split(" ")[0]}, gracias por escribirnos. Revisamos la disponibilidad y te contactamos por WhatsApp a la brevedad.\nTu reserva queda confirmada cuando recibamos el pago; en ese momento te llegará un correo de confirmación.`;
  const payTitle = "Datos para transferir";
  const payText = transfer
    ? `${transfer}\n\nEn el comentario de la transferencia indica: ${r.property_code} ${r.check_in}.`
    : "Te enviaremos los datos de pago por WhatsApp.";
  return sendMail({
    to: r.email,
    replyTo: notifyEmail(),
    subject: `Solicitud de reserva · ${r.property_title}`,
    html: layout({
      title,
      intro,
      rows: stayRows(r),
      blocks: [{ title: payTitle, html: nl2br(payText) }],
      cta: guestWhatsapp(r),
      footer: footer(),
    }),
    text: plain({ title, intro, rows: stayRows(r), blocks: [{ title: payTitle, text: payText }], footer: footer() }),
  });
}

/** 1b. A Fernanda: llegó una solicitud desde la web. */
export async function mailRequestToOwner(r: Reservation): Promise<MailResult> {
  const to = notifyEmail();
  if (!to) return { sent: false, error: "Falta NOTIFY_EMAIL" };
  const title = "Nueva solicitud de reserva";
  const intro = `${r.name} quiere reservar desde la web. Revisa la disponibilidad, confírmale por WhatsApp y, cuando pague, márcala como pagada en el CRM.`;
  const rows: MailRow[] = [
    ...stayRows(r),
    { label: "Nombre", value: r.name },
    { label: "Teléfono", value: r.phone },
    { label: "Correo", value: r.email },
    { label: "Mensaje", value: r.message },
  ];
  const admin = siteUrl() ? { label: "Ver en el CRM", href: `${siteUrl()}/admin/reservas` } : undefined;
  return sendMail({
    to,
    replyTo: r.email,
    subject: `Nueva reserva: ${r.property_code} · ${r.check_in} → ${r.check_out} · ${r.name}`,
    html: layout({
      title,
      intro,
      rows,
      cta: admin,
      footer: `Responder por WhatsApp: ${whatsappContact(r.phone)}`,
    }),
    text: plain({ title, intro, rows, cta: admin }),
  });
}

function whatsappContact(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

/** 2. Al huésped (y copia a Fernanda): pago recibido, reserva confirmada. */
export async function mailConfirmation(r: Reservation, p: Property | null): Promise<MailResult> {
  const title = "¡Tu reserva está confirmada!";
  const intro = `Hola ${r.name.split(" ")[0]}, recibimos tu pago. Te dejamos el detalle de tu estadía; guarda este correo como comprobante.`;
  const rows: MailRow[] = [...stayRows(r), { label: "Monto recibido", value: r.amount }];
  const info = stayInfo(p, { address: true });
  if (r.guest_note.trim()) {
    info.html.push({ title: "Nota de Fernanda", html: nl2br(r.guest_note.trim()) });
    info.text.push({ title: "Nota de Fernanda", text: r.guest_note.trim() });
  }
  const html = layout({ title, intro, rows, blocks: info.html, cta: guestWhatsapp(r), footer: footer() });
  const text = plain({ title, intro, rows, blocks: info.text, footer: footer() });
  const subject = `Reserva confirmada · ${r.property_title} · ${longDate(r.check_in)}`;
  const result = await sendMail({ to: r.email, replyTo: notifyEmail(), subject, html, text });
  const owner = notifyEmail();
  if (owner) await sendMail({ to: owner, subject: `Copia: ${subject} · ${r.name}`, html, text });
  return result;
}

/** 3. Al huésped: recordatorio antes de la llegada. */
export async function mailReminder(r: Reservation, p: Property | null): Promise<MailResult> {
  const days = nightsOf({ check_in: todayChile(), check_out: r.check_in });
  const when = days <= 0 ? "hoy" : days === 1 ? "mañana" : `el ${longDate(r.check_in)}`;
  const title = `Te esperamos ${when}`;
  const intro = `Hola ${r.name.split(" ")[0]}, ya falta poco para tu estadía en ${r.property_title}. Aquí tienes todo lo necesario para llegar.`;
  const info = stayInfo(p, { address: true });
  return sendMail({
    to: r.email,
    replyTo: notifyEmail(),
    subject: `Tu llegada ${when} · ${r.property_title}`,
    html: layout({ title, intro, rows: stayRows(r), blocks: info.html, cta: guestWhatsapp(r), footer: footer() }),
    text: plain({ title, intro, rows: stayRows(r), blocks: info.text, footer: footer() }),
  });
}

/* ------------------------------------------------------------------------ */
/* Acciones                                                                  */
/* ------------------------------------------------------------------------ */

export interface ActionResult {
  reservation: Reservation;
  emails: { to: string; sent: boolean; error?: string }[];
}

async function propertyFor(r: Reservation): Promise<Property | null> {
  return r.property_id ? getStore().getProperty(r.property_id) : null;
}

/** ¿Choca con una reserva pagada? */
export async function overlapsPaid(propertyId: string, checkIn: string, checkOut: string, ignoreId?: string) {
  const all = await getStore().listReservations();
  return all.some(
    (r) =>
      r.id !== ignoreId &&
      r.property_id === propertyId &&
      r.status === "pagada" &&
      r.check_in < checkOut &&
      checkIn < r.check_out,
  );
}

export async function createReservation(input: ReservationInput): Promise<ActionResult> {
  const r = await getStore().createReservation(input);
  const emails: ActionResult["emails"] = [];
  if (r.status === "pagada") {
    const res = await mailConfirmation(r, await propertyFor(r));
    emails.push({ to: r.email, ...res });
  } else {
    if (r.email) emails.push({ to: r.email, ...(await mailRequestToGuest(r)) });
    if (r.source === "web") emails.push({ to: notifyEmail() ?? "Fernanda", ...(await mailRequestToOwner(r)) });
  }
  return { reservation: r, emails };
}

export async function markPaid(id: string, amount: string, note: string): Promise<ActionResult> {
  const r = await getStore().updateReservation(id, {
    status: "pagada",
    amount: amount.trim(),
    guest_note: note.trim(),
    paid_at: new Date().toISOString(),
  });
  const emails = r.email ? [{ to: r.email, ...(await mailConfirmation(r, await propertyFor(r))) }] : [];
  return { reservation: r, emails };
}

export async function sendReminder(id: string): Promise<ActionResult> {
  const r0 = await getStore().getReservation(id);
  if (!r0) throw new Error("Reserva no encontrada");
  const res = await mailReminder(r0, await propertyFor(r0));
  const r = res.sent ? await getStore().updateReservation(id, { reminder_sent_at: new Date().toISOString() }) : r0;
  return { reservation: r, emails: [{ to: r.email, ...res }] };
}

/** Tarea diaria: recordatorio a las reservas pagadas que llegan hoy, mañana o pasado. */
export async function runReminders(daysBefore = 2) {
  const today = todayChile();
  const limit = addDays(today, daysBefore);
  const due = (await getStore().listReservations()).filter(
    (r) => r.status === "pagada" && !r.reminder_sent_at && r.email && r.check_in >= today && r.check_in <= limit,
  );
  const results = [];
  for (const r of due) {
    const { emails } = await sendReminder(r.id);
    results.push({ id: r.id, code: r.property_code, check_in: r.check_in, ...emails[0] });
  }
  return { today, checked: due.length, results };
}
