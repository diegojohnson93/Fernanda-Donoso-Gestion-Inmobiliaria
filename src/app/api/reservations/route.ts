import { connection } from "next/server";
import { errorResponse } from "@/lib/http";
import { cleanText, parseStay } from "@/lib/reservation-input";
import { createReservation, overlapsPaid } from "@/lib/reservations";
import { getStore } from "@/lib/store";

export async function GET() {
  await connection();
  try {
    return Response.json(await getStore().listReservations());
  } catch (e) {
    return errorResponse(e);
  }
}

/** Reserva ingresada por Fernanda (p. ej. acordada por WhatsApp). */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const stay = await parseStay(body, { requireContact: false, requirePublished: false, allowPast: true });
    const paid = body.paid === true;
    if (paid && (await overlapsPaid(stay.property.id, stay.check_in, stay.check_out))) {
      throw new Error("Esas fechas chocan con otra reserva pagada de la misma propiedad.");
    }
    const result = await createReservation({
      property_id: stay.property.id,
      property_code: stay.property.code,
      property_title: stay.property.title,
      check_in: stay.check_in,
      check_out: stay.check_out,
      guests: stay.guests,
      name: stay.name,
      phone: stay.phone,
      email: stay.email,
      message: stay.message,
      status: paid ? "pagada" : "pendiente",
      source: "manual",
      amount: paid ? cleanText(body.amount, 60) : "",
      guest_note: paid ? cleanText(body.guest_note, 1500) : "",
      paid_at: paid ? new Date().toISOString() : null,
      reminder_sent_at: null,
    });
    return Response.json(result);
  } catch (e) {
    return errorResponse(e, 400);
  }
}
