import { airbnbBusyNights } from "@/lib/airbnb-calendar";
import { errorResponse } from "@/lib/http";
import { ingestIncoming } from "@/lib/inbox";
import { parseStay } from "@/lib/reservation-input";
import { addDays, createReservation, longDate, nightsOf, overlapsPaid } from "@/lib/reservations";
import { getStore } from "@/lib/store";

export const maxDuration = 30;

/**
 * Solicitud de reserva desde el calendario de una propiedad Airbnb (público).
 * Guarda la reserva como "pendiente", avisa a Fernanda por correo, le manda
 * al huésped los datos de pago y deja el mensaje en la bandeja del CRM.
 */

const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 4;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (String(body.website ?? "").trim()) return Response.json({ ok: true }); // trampa para bots

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    if (rateLimited(ip)) {
      return errorResponse(new Error("Recibimos varias solicitudes seguidas. Intenta en unos minutos."), 429);
    }

    let stay;
    try {
      stay = await parseStay(body, { requireContact: true, requirePublished: true, allowPast: false });
    } catch (e) {
      return errorResponse(e, 400);
    }
    const { property } = stay;

    // No aceptar fechas que ya sabemos ocupadas (Airbnb o reservas pagadas).
    const ical = typeof property.details?.ical_airbnb === "string" ? property.details.ical_airbnb.trim() : "";
    const busy = new Set(ical ? ((await airbnbBusyNights(ical))?.busy ?? []) : []);
    let taken = await overlapsPaid(property.id, stay.check_in, stay.check_out);
    for (let d = stay.check_in; !taken && d < stay.check_out; d = addDays(d, 1)) taken = busy.has(d);
    if (taken) {
      return errorResponse(new Error("Algunas de esas noches ya están ocupadas. Elige otras fechas."), 409);
    }

    const { reservation, emails } = await createReservation({
      property_id: property.id,
      property_code: property.code,
      property_title: property.title,
      check_in: stay.check_in,
      check_out: stay.check_out,
      guests: stay.guests,
      name: stay.name,
      phone: stay.phone,
      email: stay.email,
      message: stay.message,
      status: "pendiente",
      source: "web",
      amount: "",
      guest_note: "",
      paid_at: null,
      reminder_sent_at: null,
    });

    // También queda en la bandeja, para responder desde el CRM.
    try {
      const n = nightsOf(reservation);
      const text = [
        `Solicitud de reserva: ${longDate(reservation.check_in)} → ${longDate(reservation.check_out)} (${n} ${n === 1 ? "noche" : "noches"})`,
        reservation.guests ? `Huéspedes: ${reservation.guests}` : "",
        reservation.message,
      ]
        .filter(Boolean)
        .join("\n");
      const convo = await ingestIncoming({
        channel: "web",
        external_id: `web:${stay.phone.replace(/\D/g, "")}`,
        contact_name: stay.name,
        contact_phone: stay.phone,
        contact_email: stay.email,
        text,
        referral_text: `Reserva web · ${property.code} ${property.title}`,
      });
      await getStore().updateConversation(convo.id, {
        referral_text: `Reserva web · ${property.code} ${property.title}`,
        property_id: property.id,
        property_source: "web",
        property_confidence: "alta",
      });
    } catch (e) {
      console.error("No se pudo dejar la reserva en la bandeja", e);
    }

    return Response.json({ ok: true, guestEmailSent: emails.find((e) => e.to === stay.email)?.sent ?? false });
  } catch (e) {
    return errorResponse(e);
  }
}
