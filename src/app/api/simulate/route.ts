import { errorResponse } from "@/lib/http";
import { ingestIncoming, refreshDraft } from "@/lib/inbox";
import { getStore } from "@/lib/store";
import type { Channel } from "@/lib/types";

export const maxDuration = 60;

/** Simula un mensaje entrante (para probar sin conectar Meta). */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      channel: Channel;
      contact_name: string;
      text: string;
      conversation_id?: string;
      ad_id?: string;
    };
    if (!body.text?.trim()) return errorResponse(new Error("Escribe un mensaje"), 400);

    let externalId: string;
    let channel = body.channel;
    let name = body.contact_name?.trim() || "Cliente de prueba";
    if (body.conversation_id) {
      const c = await getStore().getConversation(body.conversation_id);
      if (!c) return errorResponse(new Error("Conversación no encontrada"), 404);
      externalId = c.external_id;
      channel = c.channel;
      name = c.contact_name;
    } else {
      externalId = `sim-${crypto.randomUUID().slice(0, 8)}`;
    }

    const property = body.ad_id
      ? (await getStore().listProperties()).find((p) => p.ad_ids.includes(body.ad_id!))
      : undefined;

    const convo = await ingestIncoming({
      channel,
      external_id: externalId,
      contact_name: name,
      text: body.text.trim(),
      referral_ad_id: body.ad_id || null,
      referral_text: body.ad_id ? `Aviso: ${property?.title ?? body.ad_id}` : null,
    });
    await refreshDraft(convo.id);
    return Response.json(await getStore().getConversation(convo.id));
  } catch (e) {
    return errorResponse(e);
  }
}
