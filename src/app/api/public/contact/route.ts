import { after } from "next/server";
import { OWNER_LEAD } from "@/lib/ai";
import { errorResponse } from "@/lib/http";
import { ingestIncoming, refreshDraft } from "@/lib/inbox";
import { getStore } from "@/lib/store";

export const maxDuration = 60;

/**
 * Formularios de la web pública (sin contraseña):
 *  - kind "consulta": alguien pregunta por una propiedad (o en general).
 *  - kind "propietario": un dueño quiere arrendar o vender con Fernanda.
 * Cada envío llega a la bandeja como canal "Web" con su borrador de IA.
 */

const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const clean = (v: unknown, max: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u0008\u000B-\u001F]/g, "")
    .trim()
    .slice(0, max);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Trampa para bots: campo oculto que una persona nunca llena.
    if (clean(body.website, 200)) return Response.json({ ok: true });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    if (rateLimited(ip)) {
      return errorResponse(new Error("Recibimos varios mensajes seguidos. Intenta en unos minutos."), 429);
    }

    const kind = body.kind === "propietario" ? "propietario" : "consulta";
    const name = clean(body.name, 80);
    const phone = clean(body.phone, 30).replace(/[^\d+]/g, "");
    const email = clean(body.email, 120).toLowerCase();
    const message = clean(body.message, 2000);
    const code = clean(body.property_code, 20).toUpperCase();

    if (!name) return errorResponse(new Error("Cuéntanos tu nombre."), 400);
    if (!phone) return errorResponse(new Error("Déjanos tu teléfono."), 400);
    if (!email) return errorResponse(new Error("Déjanos tu correo."), 400);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse(new Error("El correo no parece válido."), 400);
    }
    if (phone && phone.replace(/\D/g, "").length < 8) {
      return errorResponse(new Error("El teléfono no parece válido."), 400);
    }

    let text = message;
    let referral: string;
    let property = null;
    if (kind === "propietario") {
      const parts = [
        body.operation ? `Quiere: ${clean(body.operation, 60)}` : "",
        body.property_type ? `Tipo: ${clean(body.property_type, 60)}` : "",
        body.sector ? `Sector: ${clean(body.sector, 80)}` : "",
        message,
      ].filter(Boolean);
      text = parts.join("\n");
      referral = `${OWNER_LEAD} (formulario web)`;
    } else {
      property = code
        ? ((await getStore().listProperties()).find((p) => p.code.toUpperCase() === code) ?? null)
        : null;
      referral = property ? `Formulario web · ${property.code} ${property.title}` : "Formulario web";
    }
    if (!text) text = property ? `Quiero más información sobre ${property.code}.` : "Quiero más información.";

    const contactKey = phone ? phone.replace(/\D/g, "") : email;
    const convo = await ingestIncoming({
      channel: "web",
      external_id: `web:${contactKey}`,
      contact_name: name,
      contact_phone: phone || null,
      contact_email: email || null,
      text,
      referral_text: referral,
    });
    // ingestIncoming solo actualiza la referencia cuando viene un ID de aviso.
    await getStore().updateConversation(convo.id, {
      referral_text: referral,
      ...(property
        ? { property_id: property.id, property_source: "web" as const, property_confidence: "alta" as const }
        : {}),
    });

    after(async () => {
      try {
        await refreshDraft(convo.id);
      } catch (e) {
        console.error("Error generando borrador de formulario web", e);
      }
    });

    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
