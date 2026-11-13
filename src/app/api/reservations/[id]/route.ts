import { errorResponse } from "@/lib/http";
import { cleanText } from "@/lib/reservation-input";
import { markPaid, overlapsPaid, sendReminder } from "@/lib/reservations";
import { getStore } from "@/lib/store";

/**
 * Acciones sobre una reserva:
 *  - "pagada": registra el pago (abono o total) y envía la confirmación al huésped (copia a Fernanda).
 *  - "recordatorio": envía ahora el correo con las instrucciones de llegada.
 *  - "cancelar" / "pendiente": cambia el estado (sin correo).
 */
export async function PATCH(request: Request, ctx: RouteContext<"/api/reservations/[id]">) {
  const { id } = await ctx.params;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const current = await getStore().getReservation(id);
    if (!current) throw new Error("Reserva no encontrada");

    switch (body.action) {
      case "pagada": {
        if (current.property_id && (await overlapsPaid(current.property_id, current.check_in, current.check_out, id))) {
          throw new Error("Esas fechas chocan con otra reserva pagada de la misma propiedad.");
        }
        return Response.json(await markPaid(id, cleanText(body.amount, 60), cleanText(body.total, 60), cleanText(body.guest_note, 1500)));
      }
      case "recordatorio":
        if (current.status !== "pagada") throw new Error("Solo se envía a reservas pagadas.");
        return Response.json(await sendReminder(id));
      case "cancelar":
        return Response.json({ reservation: await getStore().updateReservation(id, { status: "cancelada" }), emails: [] });
      case "pendiente":
        return Response.json({
          reservation: await getStore().updateReservation(id, { status: "pendiente", paid_at: null }),
          emails: [],
        });
      default:
        throw new Error("Acción desconocida");
    }
  } catch (e) {
    return errorResponse(e, 400);
  }
}
