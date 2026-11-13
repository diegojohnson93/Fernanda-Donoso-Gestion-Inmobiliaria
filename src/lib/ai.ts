import { MODALITIES, detailsToText, extractionSchema, priceLines, surfaceText } from "./ficha";
import type {
  Confidence,
  ConversationWithMessages,
  Draft,
  Property,
  PropertyInput,
  PropertySource,
} from "./types";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = () => process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const BUSINESS = () => process.env.BUSINESS_NAME || "Fernanda Donoso Gestión Inmobiliaria";
const AGENT = () => process.env.AGENT_NAME || "Fernanda";

export const aiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

async function callClaude(body: Record<string, unknown>): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: MODEL(), ...body }),
  });
  if (!res.ok) {
    throw new Error(`Error de la IA (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as { content: { type: string; text?: string }[] };
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/```(?:json)?/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

/* ------------------------------------------------------------------------ */
/* Detección determinística de la propiedad (antes de llamar a la IA)       */
/* ------------------------------------------------------------------------ */

export interface Detection {
  property: Property | null;
  source: PropertySource | null;
  confidence: Confidence | null;
}

export function detectProperty(
  convo: ConversationWithMessages,
  properties: Property[],
): Detection {
  // Se buscan también las no disponibles: si alguien pregunta por una que ya se
  // arrendó o vendió, la IA debe saberlo para avisarle y ofrecer alternativas.
  const active = properties;

  // 1. Selección manual de Fernanda, o propiedad desde la que se envió el formulario web.
  if ((convo.property_source === "manual" || convo.property_source === "web") && convo.property_id) {
    const p = properties.find((x) => x.id === convo.property_id) ?? null;
    if (p) return { property: p, source: convo.property_source, confidence: "alta" };
  }

  // 2. Llegó desde un aviso o publicación vinculada.
  if (convo.referral_ad_id) {
    const p = active.find((x) => x.ad_ids.includes(convo.referral_ad_id!));
    if (p) return { property: p, source: "aviso", confidence: "alta" };
  }

  // 3. El cliente escribió un código (el más reciente gana).
  const inbound = convo.messages.filter((m) => m.direction === "in").reverse();
  for (const m of inbound) {
    const text = m.text.toUpperCase().replace(/\s+/g, "");
    const hit = active.find((p) => {
      const code = p.code.toUpperCase();
      return text.includes(code) || text.includes(code.replace("-", ""));
    });
    if (hit) return { property: hit, source: "codigo", confidence: "alta" };
  }

  return { property: null, source: null, confidence: null };
}

/* ------------------------------------------------------------------------ */
/* Borrador de respuesta                                                     */
/* ------------------------------------------------------------------------ */

/** Ficha tal como la recibe la IA. Las notas privadas NUNCA se incluyen. */
function propertyCard(p: Property, opts: { hideAddress?: boolean } = {}): string {
  return [
    `### ${p.code} — ${p.title}`,
    `Modalidades: ${p.modalities.map((m) => MODALITIES[m].label).join(", ")}`,
    `Precios: ${priceLines(p.modalities, p.details).map((l) => `${MODALITIES[l.modality].short}: ${l.text}`).join(" | ")}`,
    opts.hideAddress
      ? `Sector: ${p.sector || "?"}`
      : `Sector: ${p.sector || "?"} | Dirección: ${p.address || "?"}`,
    `Dormitorios: ${p.bedrooms ?? "?"} | Baños: ${p.bathrooms ?? "?"} | Superficie: ${surfaceText(p.area_m2, p.details) || "?"}`,
    detailsToText(p.modalities, p.details),
    p.brief ? `[Información adicional]\n${p.brief}` : "",
    p.links ? `Links: ${p.links}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const CHANNEL_LABEL = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  messenger: "Facebook Messenger",
  web: "formulario de la web (Fernanda responderá por WhatsApp o correo)",
};

/** Formulario "¿Tienes una propiedad?": un dueño que quiere arrendar o vender con Fernanda. */
export const OWNER_LEAD = "Captación de propietario";
const isOwnerLead = (c: { referral_text: string | null }) =>
  Boolean(c.referral_text?.startsWith(OWNER_LEAD));

export async function generateDraft(
  convo: ConversationWithMessages,
  properties: Property[],
): Promise<{ draft: Draft; detection: Detection }> {
  const detection = detectProperty(convo, properties);

  if (isOwnerLead(convo)) {
    // Un propietario no pregunta por las propiedades publicadas.
    return { draft: await ownerLeadDraft(convo), detection: { property: null, source: null, confidence: null } };
  }

  if (!aiEnabled()) {
    return { draft: templateDraft(convo, detection, properties), detection };
  }

  const active = properties.filter((p) => p.active);
  const history = convo.messages
    .slice(-20)
    .map((m) => `${m.direction === "in" ? "CLIENTE" : AGENT().toUpperCase()}: ${m.text}`)
    .join("\n");

  const system = `Eres el asistente de ${BUSINESS()}, una corredora de propiedades en Chile. Redactas BORRADORES de respuesta que ${AGENT()} revisará y aprobará antes de enviarlos.

Reglas:
- Escribe en español de Chile, cordial, cercano y profesional. Mensajes breves, propios de ${CHANNEL_LABEL[convo.channel]}: 2 a 5 frases, sin listas largas. Puedes usar 1 emoji como máximo.
- Usa SOLO la información de las fichas. Nunca inventes precios, disponibilidad, requisitos ni características.
- Si el cliente pregunta algo que la ficha no dice, no lo supongas: di que lo confirmarás a la brevedad y agrégalo a "missing_info".
- Identifica de qué propiedad habla el cliente. Si no puedes saberlo con seguridad, NO elijas una: pregunta amablemente por cuál consulta (código del aviso, sector o tipo de propiedad) y deja "property_code" en null.
- Una propiedad puede ofrecerse en varias modalidades (Airbnb por noches, arriendo año corrido, arriendo marzo a diciembre, venta). Responde con los datos de la modalidad que le interesa al cliente. Si no queda claro cuál busca y la propiedad tiene más de una, pregúntaselo en una frase o resume brevemente las opciones.
- Para Airbnb: si la ficha dice que se reserva solo por Airbnb y hay link, invita a reservar por ahí.
- Si un campo de la ficha no aparece, ese dato NO se conoce.
- Si el cliente pregunta por una propiedad que ya no está disponible, díselo con amabilidad y, si hay alguna disponible parecida (sector, tamaño o modalidad), ofrécela brevemente.
- Cuando tenga sentido, propone el siguiente paso (agendar visita, enviar requisitos, reservar).
- No firmes el mensaje ni pongas saludos de despedida largos.

Responde ÚNICAMENTE con un objeto JSON:
{"property_code": string | null, "confidence": "alta" | "media" | "baja", "reasoning": "una frase explicando por qué es esa propiedad", "reply": "texto del borrador", "missing_info": ["datos que faltan en la ficha"]}`;

  const fixed = detection.property
    ? `\nLa propiedad de esta conversación YA ESTÁ IDENTIFICADA (${detection.source}): ${detection.property.code}. Usa esa ficha.\n`
    : "";

  const inactive = properties.filter((p) => !p.active);
  const user = `Fichas de propiedades disponibles:
${active.map((p) => propertyCard(p)).join("\n\n") || "(no hay fichas cargadas)"}
${
  inactive.length
    ? `\nPropiedades que YA NO ESTÁN DISPONIBLES (arrendadas, vendidas o retiradas):\n${inactive.map((p) => `- ${p.code} — ${p.title} (${p.sector})`).join("\n")}\n`
    : ""
}${fixed}
Canal: ${CHANNEL_LABEL[convo.channel]}
Nombre del contacto: ${convo.contact_name}
${convo.referral_text ? `Llegó desde: ${convo.referral_text}\n` : ""}${convo.notes ? `Notas internas: ${convo.notes}\n` : ""}
Conversación (más antigua primero):
${history}

Redacta el borrador de respuesta al último mensaje del cliente.`;

  const raw = await callClaude({
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: user }],
  });
  const out = parseJson<{
    property_code: string | null;
    confidence: Confidence;
    reasoning: string;
    reply: string;
    missing_info?: string[];
  }>(raw);

  let finalDetection = detection;
  if (!detection.property && out.property_code) {
    const p = properties.find((x) => x.code.toUpperCase() === out.property_code!.toUpperCase());
    if (p) finalDetection = { property: p, source: "ia", confidence: out.confidence };
  }

  return {
    detection: finalDetection,
    draft: {
      text: out.reply,
      property_code: finalDetection.property?.code ?? null,
      confidence: finalDetection.property ? (finalDetection.confidence ?? out.confidence) : "baja",
      reasoning: out.reasoning,
      missing_info: out.missing_info ?? [],
      generated_at: new Date().toISOString(),
      engine: "ia",
    },
  };
}

/** Borrador simple cuando no hay clave de API: sirve para probar el flujo. */
function templateDraft(
  convo: ConversationWithMessages,
  detection: Detection,
  properties: Property[],
): Draft {
  const name = firstName(convo.contact_name);
  const p = detection.property;
  if (!p) {
    const options = properties
      .filter((x) => x.active)
      .slice(0, 3)
      .map((x) => x.code)
      .join(", ");
    return {
      text: `¡Hola${name ? " " + name : ""}! Gracias por escribirnos. Para darte la información correcta, ¿me cuentas por cuál propiedad consultas? Si tienes el código del aviso${options ? ` (por ejemplo ${options})` : ""} o el sector, mejor 😊`,
      property_code: null,
      confidence: "baja",
      reasoning: "No se encontró aviso vinculado ni código en el mensaje.",
      missing_info: [],
      generated_at: new Date().toISOString(),
      engine: "plantilla",
    };
  }
  if (!p.active) {
    return {
      text: `¡Hola${name ? " " + name : ""}! Gracias por escribirnos. Te cuento que ${p.title} (${p.code}) ya no está disponible. Si me dices qué estás buscando (sector, dormitorios y modalidad), te muestro otras opciones 😊`,
      property_code: p.code,
      confidence: detection.confidence ?? "media",
      reasoning: "La propiedad consultada está marcada como no disponible.",
      missing_info: [],
      generated_at: new Date().toISOString(),
      engine: "plantilla",
    };
  }
  const prices = priceLines(p.modalities, p.details)
    .map((l) => { const lb = MODALITIES[l.modality].label; return `${lb.charAt(0).toLowerCase()}${lb.slice(1)}: ${l.text}`; })
    .join("; ");
  return {
    text: `¡Hola${name ? " " + name : ""}! Gracias por tu interés en ${p.title} (${p.code}). Se ofrece en ${prices}. ¿Te gustaría coordinar una visita?`,
    property_code: p.code,
    confidence: detection.confidence ?? "media",
    reasoning:
      detection.source === "aviso"
        ? "La conversación llegó desde un aviso vinculado a esta propiedad."
        : detection.source === "codigo"
          ? `El cliente mencionó el código ${p.code}.`
          : detection.source === "web"
            ? "Consultó desde la página de la propiedad en la web."
            : "Propiedad asignada manualmente.",
    missing_info: [],
    generated_at: new Date().toISOString(),
    engine: "plantilla",
  };
}

/* ------------------------------------------------------------------------ */
/* Captación de propietarios                                                 */
/* ------------------------------------------------------------------------ */

async function ownerLeadDraft(convo: ConversationWithMessages): Promise<Draft> {
  const name = firstName(convo.contact_name);
  const base: Omit<Draft, "text" | "engine"> = {
    property_code: null,
    confidence: "alta",
    reasoning: "Propietario que quiere arrendar o vender su propiedad con Fernanda.",
    missing_info: [],
    generated_at: new Date().toISOString(),
  };
  if (!aiEnabled()) {
    return {
      ...base,
      engine: "plantilla",
      text: `¡Hola${name ? " " + name : ""}! Muchas gracias por pensar en nosotros para tu propiedad. Me encantaría conocerla: ¿te parece si coordinamos una llamada o una visita para evaluarla y contarte cómo trabajamos?`,
    };
  }
  const history = convo.messages
    .slice(-10)
    .map((m) => `${m.direction === "in" ? "PROPIETARIO" : AGENT().toUpperCase()}: ${m.text}`)
    .join("\n");
  const raw = await callClaude({
    max_tokens: 600,
    system: `Eres el asistente de ${BUSINESS()}, corredora de propiedades en Chile. Redactas BORRADORES que ${AGENT()} revisa antes de enviar por WhatsApp o correo. Esta persona es un PROPIETARIO que quiere que ${AGENT()} arriende o venda su propiedad. Agradece, muestra interés, haz como máximo 2 preguntas clave que falten (sector, tipo de propiedad, modalidad: venta, arriendo año corrido, marzo a diciembre o Airbnb) y propone coordinar una llamada o visita de evaluación. No ofrezcas propiedades del listado ni des precios ni comisiones. Español de Chile, cordial, 2 a 4 frases. Responde SOLO con el texto del mensaje.`,
    messages: [{ role: "user", content: `Nombre: ${convo.contact_name}\n${history}` }],
  });
  return { ...base, engine: "ia", text: raw.trim() };
}

function firstName(contact: string) {
  if (/^(\+|Usuario )/.test(contact)) return "";
  const first = contact.replace(/^@/, "").split(/[ ._]/)[0];
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "";
}

/* ------------------------------------------------------------------------ */
/* Descripción para la web                                                   */
/* ------------------------------------------------------------------------ */

export async function writeWebDescription(p: PropertyInput): Promise<string> {
  if (!aiEnabled()) {
    throw new Error("Para redactar con IA se necesita configurar ANTHROPIC_API_KEY.");
  }
  const card = propertyCard({ ...p, id: "", created_at: "" } as Property, {
    hideAddress: !p.show_address,
  });
  const raw = await callClaude({
    max_tokens: 900,
    system: `Eres redactor inmobiliario en Chile. Escribes la descripción de una propiedad para la web de ${BUSINESS()}.
Reglas:
- 2 o 3 párrafos breves (máximo 120 palabras en total), tono cálido y profesional, español de Chile.
- Destaca lo que hace atractiva la propiedad (vista, luz, ubicación, espacios, amenidades) y para quién es ideal.
- Usa SOLO datos de la ficha. No inventes nada. No repitas precios ni requisitos (la web ya los muestra aparte).
- No incluyas la dirección exacta salvo que la ficha la entregue.
- Sin títulos, sin listas, sin emojis, sin signos de exclamación exagerados.
Responde SOLO con el texto.`,
    messages: [{ role: "user", content: card }],
  });
  return raw.trim();
}

/* ------------------------------------------------------------------------ */
/* Lectura de una ficha en PDF                                               */
/* ------------------------------------------------------------------------ */

export async function extractPropertyFromPdf(
  base64Pdf: string,
): Promise<Partial<PropertyInput>> {
  if (!aiEnabled()) {
    throw new Error("Para leer PDFs se necesita configurar ANTHROPIC_API_KEY.");
  }
  const raw = await callClaude({
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64Pdf },
          },
          {
            type: "text",
            text: `Este documento describe una propiedad en Chile. Extrae sus datos para completar una ficha. No inventes nada: omite lo que el documento no diga. En los campos con opciones usa exactamente una de ellas.

Responde ÚNICAMENTE con un JSON con esta forma:
{
  "title": "título corto, p. ej. 'Depto 2D2B vista al mar, Reñaca'",
  "modalities": ["airbnb" | "anual" | "temporada" | "venta"]  (airbnb = arriendo por noches; anual = arriendo año corrido; temporada = arriendo marzo a diciembre; venta),
  "sector": "comuna o sector",
  "address": "dirección o referencia",
  "bedrooms": número o null,
  "bathrooms": número o null,
  "area_m2": superficie útil (interior, sin terraza), número o null,
  "details": { ...campos de abajo que el documento mencione... },
  "brief": "todo dato útil que no calce en los campos, en líneas cortas"
}

Campos disponibles para "details":
${extractionSchema()}`,
          },
        ],
      },
    ],
  });
  return parseJson<Partial<PropertyInput>>(raw);
}
