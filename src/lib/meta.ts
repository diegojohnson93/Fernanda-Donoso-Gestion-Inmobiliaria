import type { Conversation, IncomingMessage } from "./types";

/**
 * Integración con la plataforma de Meta:
 *  - WhatsApp Cloud API
 *  - Messenger Platform (Facebook)
 *  - Instagram Messaging (a través de la página de Facebook vinculada)
 */

const GRAPH = () => `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v23.0"}`;

export interface SendResult {
  status: "enviado" | "simulado" | "manual" | "error";
  error?: string;
}

export function channelConfigured(channel: Conversation["channel"]): boolean {
  if (channel === "web") return false;
  if (channel === "whatsapp") {
    return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  }
  return Boolean(process.env.META_PAGE_ACCESS_TOKEN);
}

export async function sendToChannel(convo: Conversation, text: string): Promise<SendResult> {
  // Formularios web: Fernanda responde desde su WhatsApp o correo; aquí solo se registra.
  if (convo.channel === "web") return { status: "manual" };
  // Conversaciones de prueba (simulador / datos demo) o canal sin credenciales.
  if (convo.external_id.startsWith("sim-") || !channelConfigured(convo.channel)) {
    return { status: "simulado" };
  }

  try {
    let res: Response;
    if (convo.channel === "whatsapp") {
      res = await fetch(`${GRAPH()}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: convo.external_id,
          type: "text",
          text: { preview_url: true, body: text },
        }),
      });
    } else {
      // Messenger e Instagram usan el mismo endpoint con el token de la página.
      res = await fetch(
        `${GRAPH()}/me/messages?access_token=${encodeURIComponent(process.env.META_PAGE_ACCESS_TOKEN!)}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            recipient: { id: convo.external_id },
            messaging_type: "RESPONSE",
            message: { text },
          }),
        },
      );
    }
    if (!res.ok) {
      const body = await res.text();
      return { status: "error", error: friendlyError(body) };
    }
    return { status: "enviado" };
  } catch (e) {
    return { status: "error", error: (e as Error).message };
  }
}

function friendlyError(body: string): string {
  try {
    const err = JSON.parse(body).error;
    const msg: string = err?.message ?? body;
    if (err?.code === 131047 || /24 hours|re-engagement/i.test(msg)) {
      return "Pasaron más de 24 horas desde el último mensaje del cliente. Para escribirle hay que usar una plantilla aprobada de WhatsApp.";
    }
    return msg;
  } catch {
    return body.slice(0, 300);
  }
}

/* ------------------------------------------------------------------------ */
/* Webhook                                                                   */
/* ------------------------------------------------------------------------ */

export async function verifySignature(rawBody: string, header: string | null): Promise<boolean> {
  const secret = process.env.META_APP_SECRET;
  if (!secret) return true; // Sin secreto configurado no se valida (solo para pruebas).
  if (!header?.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return timingSafeEqual(hex, header.slice(7));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

const tsToIso = (ts: number | string | undefined) => {
  if (ts === undefined) return new Date().toISOString();
  const n = Number(ts);
  return new Date(n < 1e12 ? n * 1000 : n).toISOString();
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseWebhook(body: any): IncomingMessage[] {
  const out: IncomingMessage[] = [];

  // WhatsApp Cloud API
  if (body?.object === "whatsapp_business_account") {
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {};
        const names = new Map<string, string>(
          (value.contacts ?? []).map((c: any) => [c.wa_id, c.profile?.name]),
        );
        for (const m of value.messages ?? []) {
          out.push({
            channel: "whatsapp",
            external_id: m.from,
            contact_name: names.get(m.from) ?? null,
            text: whatsappText(m),
            referral_ad_id: m.referral?.source_id ?? null,
            referral_text: m.referral
              ? `${m.referral.source_type === "ad" ? "Aviso" : "Publicación"}: ${m.referral.headline ?? m.referral.body ?? m.referral.source_url ?? ""}`.trim()
              : null,
            timestamp: tsToIso(m.timestamp),
          });
        }
      }
    }
  }

  // Messenger (object: "page") e Instagram (object: "instagram")
  if (body?.object === "page" || body?.object === "instagram") {
    const channel = body.object === "page" ? "messenger" : "instagram";
    for (const entry of body.entry ?? []) {
      for (const ev of entry.messaging ?? []) {
        if (ev.message?.is_echo) continue; // Mensajes enviados por la propia página.
        const referral = ev.message?.referral ?? ev.referral ?? ev.postback?.referral;
        const text =
          ev.message?.text ??
          ev.postback?.title ??
          (ev.message?.attachments?.length ? "[Adjunto]" : null);
        if (!text) continue;
        out.push({
          channel,
          external_id: ev.sender?.id,
          contact_name: null,
          text,
          referral_ad_id: referral?.ad_id ?? referral?.ads_context_data?.post_id ?? null,
          referral_text: referral
            ? `Aviso: ${referral.ads_context_data?.ad_title ?? referral.ref ?? referral.ad_id ?? ""}`.trim()
            : null,
          timestamp: tsToIso(ev.timestamp),
        });
      }
    }
  }

  return out.filter((m) => m.external_id);
}

function whatsappText(m: any): string {
  switch (m.type) {
    case "text":
      return m.text?.body ?? "";
    case "button":
      return m.button?.text ?? "";
    case "interactive":
      return m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? "";
    case "image":
      return m.image?.caption ? `[Imagen] ${m.image.caption}` : "[Imagen]";
    case "audio":
      return "[Audio — escuchar en WhatsApp]";
    case "location":
      return "[Ubicación compartida]";
    default:
      return `[${m.type}]`;
  }
}
