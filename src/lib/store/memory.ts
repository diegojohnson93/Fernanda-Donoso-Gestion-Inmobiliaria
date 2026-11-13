import type { Conversation, Message, Property, Reservation } from "../types";
import { buildSeed } from "./seed";
import type { Store } from "./types";

/**
 * Almacenamiento en memoria para el modo demo. Los datos viven mientras el
 * servidor esté encendido; en Vercel se reinician cada cierto tiempo.
 * Para datos permanentes, configurar Supabase (ver README).
 */
interface MemoryDb {
  properties: Property[];
  conversations: Conversation[];
  messages: Message[];
  reservations?: Reservation[];
}

const g = globalThis as unknown as { __fgiDb?: MemoryDb };

function db(): MemoryDb {
  if (!g.__fgiDb) g.__fgiDb = buildSeed();
  return g.__fgiDb;
}

const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

export const memoryStore: Store = {
  kind: "memoria",

  async listProperties() {
    return [...db().properties].sort((a, b) => a.code.localeCompare(b.code));
  },
  async getProperty(id) {
    return db().properties.find((p) => p.id === id) ?? null;
  },
  async createProperty(input) {
    const p: Property = { ...input, id: uid(), created_at: now() };
    db().properties.push(p);
    return p;
  },
  async updateProperty(id, patch) {
    const p = db().properties.find((x) => x.id === id);
    if (!p) throw new Error("Propiedad no encontrada");
    Object.assign(p, patch);
    return p;
  },
  async deleteProperty(id) {
    const d = db();
    d.properties = d.properties.filter((p) => p.id !== id);
    for (const c of d.conversations) if (c.property_id === id) c.property_id = null;
  },

  async listConversations() {
    const d = db();
    return [...d.conversations]
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map((c) => ({
        ...c,
        messages: d.messages
          .filter((m) => m.conversation_id === c.id)
          .sort((a, b) => a.created_at.localeCompare(b.created_at)),
      }));
  },
  async getConversation(id) {
    const d = db();
    const c = d.conversations.find((x) => x.id === id);
    if (!c) return null;
    return {
      ...c,
      messages: d.messages
        .filter((m) => m.conversation_id === id)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    };
  },
  async findConversation(channel, externalId) {
    return (
      db().conversations.find(
        (c) => c.channel === channel && c.external_id === externalId,
      ) ?? null
    );
  },
  async createConversation(input) {
    const c: Conversation = { ...input, id: uid(), created_at: now(), updated_at: now() };
    db().conversations.push(c);
    return c;
  },
  async updateConversation(id, patch) {
    const c = db().conversations.find((x) => x.id === id);
    if (!c) throw new Error("Conversación no encontrada");
    Object.assign(c, patch, { updated_at: now() });
    return c;
  },

  async addMessage(input) {
    const m: Message = { ...input, id: uid() };
    db().messages.push(m);
    return m;
  },

  async listReservations() {
    return [...(db().reservations ??= [])].sort((a, b) => a.check_in.localeCompare(b.check_in));
  },
  async getReservation(id) {
    return (db().reservations ??= []).find((r) => r.id === id) ?? null;
  },
  async createReservation(input) {
    const r: Reservation = { ...input, id: uid(), created_at: now(), updated_at: now() };
    (db().reservations ??= []).push(r);
    return r;
  },
  async updateReservation(id, patch) {
    const r = (db().reservations ??= []).find((x) => x.id === id);
    if (!r) throw new Error("Reserva no encontrada");
    Object.assign(r, patch, { updated_at: now() });
    return r;
  },
};
