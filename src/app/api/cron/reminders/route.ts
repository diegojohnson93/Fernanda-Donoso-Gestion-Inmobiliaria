import { connection } from "next/server";
import { errorResponse } from "@/lib/http";
import { runReminders } from "@/lib/reservations";

/**
 * Tarea diaria (Vercel Cron, ver vercel.json): envía el recordatorio de llegada
 * a las reservas pagadas que llegan en los próximos 2 días.
 * Vercel la llama con "Authorization: Bearer CRON_SECRET".
 */
export async function GET(request: Request) {
  await connection();
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    return Response.json(await runReminders(2));
  } catch (e) {
    return errorResponse(e);
  }
}
