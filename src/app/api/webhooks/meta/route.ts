import { after } from "next/server";
import { ingestIncoming, refreshDraft } from "@/lib/inbox";
import { parseWebhook, verifySignature } from "@/lib/meta";

export const maxDuration = 60;

/** Verificación del webhook (Meta llama con hub.challenge al configurarlo). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

/** Mensajes entrantes de WhatsApp, Messenger e Instagram. */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!(await verifySignature(raw, request.headers.get("x-hub-signature-256")))) {
    return new Response("Firma inválida", { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }

  const incoming = parseWebhook(body);
  const touched = new Set<string>();
  for (const msg of incoming) {
    try {
      const convo = await ingestIncoming(msg);
      touched.add(convo.id);
    } catch (e) {
      console.error("Error guardando mensaje entrante", e);
    }
  }

  // Meta exige responder rápido: el borrador se genera después de responder.
  after(async () => {
    for (const id of touched) {
      try {
        await refreshDraft(id);
      } catch (e) {
        console.error("Error generando borrador", e);
      }
    }
  });

  return new Response("EVENT_RECEIVED", { status: 200 });
}
