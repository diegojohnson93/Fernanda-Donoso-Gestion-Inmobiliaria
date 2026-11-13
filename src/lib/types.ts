import type { Details, Modality } from "./ficha";

export type Channel = "whatsapp" | "instagram" | "messenger" | "web";

export type ConversationStatus =
  | "nuevo"
  | "respondido"
  | "visita"
  | "cerrado"
  | "descartado";

export type Confidence = "alta" | "media" | "baja";

/** Cómo se determinó la propiedad de una conversación. */
export type PropertySource = "aviso" | "codigo" | "ia" | "manual" | "web";

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
  /** Se muestra en la web pública. */
  published: boolean;
  /** Aparece en la portada de la web. */
  featured: boolean;
  /** Si es false, la web muestra solo el sector (recomendado). */
  show_address: boolean;
  /** Texto comercial para la web. */
  web_description: string;
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
  /** "manual": respuesta a un formulario web, enviada por Fernanda desde su WhatsApp o correo. */
  send_status?: "enviado" | "simulado" | "manual" | "error" | null;
  send_error?: string | null;
}

export interface Conversation {
  id: string;
  channel: Channel;
  /** Teléfono (WhatsApp), PSID (Messenger), IGSID (Instagram) o web:<teléfono/correo>. */
  external_id: string;
  contact_name: string;
  /** Datos dejados en el formulario web. */
  contact_phone?: string | null;
  contact_email?: string | null;
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
  contact_phone?: string | null;
  contact_email?: string | null;
  text: string;
  referral_ad_id?: string | null;
  referral_text?: string | null;
  timestamp?: string;
}

/* ------------------------------------------------------------------------ */
/* Reservas (estadías cortas tipo Airbnb, cobradas directo)                  */
/* ------------------------------------------------------------------------ */

export type ReservationStatus = "pendiente" | "pagada" | "cancelada";
export type ReservationSource = "web" | "manual";

export interface Reservation {
  id: string;
  property_id: string | null;
  property_code: string;
  property_title: string;
  /** Día de llegada, AAAA-MM-DD */
  check_in: string;
  /** Día de salida, AAAA-MM-DD */
  check_out: string;
  guests: number | null;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: ReservationStatus;
  source: ReservationSource;
  /** Monto recibido (abono o total), como lo escribe Fernanda ("$60.000") */
  amount: string;
  /** Valor total de la estadía ("$180.000"); vacío si no se informó */
  total: string;
  /** Nota para el huésped que va en el correo de confirmación */
  guest_note: string;
  paid_at: string | null;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ReservationInput = Omit<Reservation, "id" | "created_at" | "updated_at">;
