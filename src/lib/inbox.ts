import { generateDraft } from "./ai";
import { sendToChannel } from "./meta";
import { getStore } from "./store";
import type { Conversation, IncomingMessage } from "./types";

/** Guarda un mensaje entrante y devuelve la conversación. */
export async function ingestIncoming(msg: IncomingMessage): Promise<Conversation> {
  const store = getStore();
  const at = msg.timestamp ?? new Date().toISOString();

  let convo = await store.findConversation(msg.channel, msg.external_id);
  if (!convo) {
    convo = await store.createConversation({
      channel: msg.channel,
      external_id: msg.external_id,
      contact_name: msg.contact_name || defaultName(msg),
      ...(msg.contact_phone ? { contact_phone: msg.contact_phone } : {}),
      ...(msg.contact_email ? { contact_email: msg.contact_email } : {}),
      property_id: null,
      property_source: null,
      property_confidence: null,
      status: "nuevo",
      referral_ad_id: msg.referral_ad_id ?? null,
      referral_text: msg.referral_text ?? null,
      draft: null,
      notes: "",
      last_customer_message_at: at,
    });
  }

  await store.addMessage({
    conversation_id: convo.id,
    direction: "in",
    text: msg.text,
    created_at: at,
    send_status: null,
    send_error: null,
  });

  const patch: Partial<Conversation> = {
    last_customer_message_at: at,
    status: convo.status === "descartado" || convo.status === "cerrado" ? convo.status : "nuevo",
  };
  // Un aviso nuevo actualiza la referencia (el cliente pudo llegar desde otro aviso).
  if (msg.referral_ad_id) {
    patch.referral_ad_id = msg.referral_ad_id;
    patch.referral_text = msg.referral_text ?? null;
    if (convo.property_source !== "manual") patch.property_source = null;
  }
  if (msg.contact_name && convo.contact_name !== msg.contact_name) {
    patch.contact_name = msg.contact_name;
  }
  if (msg.contact_phone) patch.contact_phone = msg.contact_phone;
  if (msg.contact_email) patch.contact_email = msg.contact_email;
  return store.updateConversation(convo.id, patch);
}

/** Genera (o regenera) el borrador de IA de una conversación. */
export async function refreshDraft(conversationId: string) {
  const store = getStore();
  const convo = await store.getConversation(conversationId);
  if (!convo) throw new Error("Conversación no encontrada");
  const properties = await store.listProperties();
  const { draft, detection } = await generateDraft(convo, properties);

  const patch: Partial<Conversation> = { draft };
  if (convo.property_source !== "manual") {
    patch.property_id = detection.property?.id ?? null;
    patch.property_source = detection.source;
    patch.property_confidence = detection.property ? detection.confidence : "baja";
  }
  return store.updateConversation(conversationId, patch);
}

/** Envía la respuesta aprobada por Fernanda. */
export async function approveAndSend(conversationId: string, text: string) {
  const store = getStore();
  const convo = await store.getConversation(conversationId);
  if (!convo) throw new Error("Conversación no encontrada");

  const result = await sendToChannel(convo, text);
  const message = await store.addMessage({
    conversation_id: convo.id,
    direction: "out",
    text,
    created_at: new Date().toISOString(),
    send_status: result.status,
    send_error: result.error ?? null,
  });

  if (result.status !== "error") {
    await store.updateConversation(convo.id, {
      draft: null,
      status: convo.status === "nuevo" ? "respondido" : convo.status,
    });
  }
  return { message, result };
}

function defaultName(msg: IncomingMessage) {
  if (msg.channel === "whatsapp") return `+${msg.external_id.replace(/^\+/, "")}`;
  if (msg.channel === "web") return "Contacto web";
  const tail = msg.external_id.slice(-4);
  return msg.channel === "instagram" ? `Usuario Instagram …${tail}` : `Usuario Facebook …${tail}`;
}
