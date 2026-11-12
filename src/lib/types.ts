import type { Details, Modality } from "./ficha";

export type Channel = "whatsapp" | "instagram" | "messenger";

export type ConversationStatus =
  | "nuevo"
  | "respondido"
  | "visita"
  | "cerrado"
  | "descartado";

export type Confidence = "alta" | "media" | "baja";

/** Cómo se determinó la propiedad de una conversación. */
export type PropertySource = "aviso" | "codigo" | "ia" | "manual";

export interface Photo {
  /** Ruta dentro del almacenamiento (se usa para borrarla). */
  path: string;
  url: string;
  width?: number;
  height?: number;
}

export interface Property {
  id: string;
  /** Código corto que aparece en avisos y publicaciones, p. ej. "REN-01". */
  code: string;
  title: string;
  /** Modalidades en que se ofrece: Airbnb, año corrido, marzo a diciembre, venta. */
  modalities: Modality[];
  sector: string;
  address: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_m2: number | null;
  /** Campos estructurados de la ficha base (ver lib/ficha.ts). */
  details: Details;
  /** Información adicional y preguntas frecuentes, en texto libre. */
  brief: string;
  /** Notas privadas de Fernanda. La IA NO las recibe. */
  private_notes: string;
  /** Fotos en orden; la primera es la portada. */
  photos: Photo[];
  /** IDs de avisos de Meta o publicaciones vinculadas a esta propiedad. */
  ad_ids: string[];
  links: string;
  active: boolean;
  created_at: string;
}

export type PropertyInput = Omit<Property, "id" | "created_at">;

export interface Draft {
  text: string;
  property_code: string | null;
  confidence: Confidence;
  reasoning: string;
  missing_info: string[];
  generated_at: string;
  /** "ia" si la generó Claude, "plantilla" si no hay clave de API configurada. */
  engine: "ia" | "plantilla";
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: "in" | "out";
  text: string;
  created_at: string;
  send_status?: "enviado" | "simulado" | "error" | null;
  send_error?: string | null;
}

export interface Conversation {
  id: string;
  channel: Channel;
  /** Teléfono (WhatsApp), PSID (Messenger) o IGSID (Instagram). */
  external_id: string;
  contact_name: string;
  property_id: string | null;
  property_source: PropertySource | null;
  property_confidence: Confidence | null;
  status: ConversationStatus;
  referral_ad_id: string | null;
  referral_text: string | null;
  draft: Draft | null;
  notes: string;
  last_customer_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface IncomingMessage {
  channel: Channel;
  external_id: string;
  contact_name?: string | null;
  text: string;
  referral_ad_id?: string | null;
  referral_text?: string | null;
  timestamp?: string;
}
