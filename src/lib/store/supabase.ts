import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, ConversationWithMessages, Message, Property, Reservation } from "../types";
import type { Store } from "./types";

let client: SupabaseClient | null = null;

export function sb(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );
  }
  return client;
}

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

function sortMessages(c: ConversationWithMessages): ConversationWithMessages {
  c.messages = [...(c.messages ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
  return c;
}

export const supabaseStore: Store = {
  kind: "supabase",

  async listProperties() {
    return check(await sb().from("properties").select("*").order("code")) as Property[];
  },
  async getProperty(id) {
    return check(
      await sb().from("properties").select("*").eq("id", id).maybeSingle(),
    ) as Property | null;
  },
  async createProperty(input) {
    return check(
      await sb().from("properties").insert(input).select("*").single(),
    ) as Property;
  },
  async updateProperty(id, patch) {
    return check(
      await sb().from("properties").update(patch).eq("id", id).select("*").single(),
    ) as Property;
  },
  async deleteProperty(id) {
    check(await sb().from("properties").delete().eq("id", id));
  },

  async listConversations() {
    const rows = check(
      await sb()
        .from("conversations")
        .select("*, messages(*)")
        .order("updated_at", { ascending: false })
        .limit(300),
    ) as ConversationWithMessages[];
    return rows.map(sortMessages);
  },
  async getConversation(id) {
    const row = check(
      await sb().from("conversations").select("*, messages(*)").eq("id", id).maybeSingle(),
    ) as ConversationWithMessages | null;
    return row ? sortMessages(row) : null;
  },
  async findConversation(channel, externalId) {
    return check(
      await sb()
        .from("conversations")
        .select("*")
        .eq("channel", channel)
        .eq("external_id", externalId)
        .maybeSingle(),
    ) as Conversation | null;
  },
  async createConversation(input) {
    return check(
      await sb().from("conversations").insert(input).select("*").single(),
    ) as Conversation;
  },
  async updateConversation(id, patch) {
    const clean = { ...patch } as Record<string, unknown>;
    delete clean.messages;
    delete clean.id;
    clean.updated_at = new Date().toISOString();
    return check(
      await sb().from("conversations").update(clean).eq("id", id).select("*").single(),
    ) as Conversation;
  },

  async addMessage(input) {
    return check(
      await sb().from("messages").insert(input).select("*").single(),
    ) as Message;
  },

  async listReservations() {
    return check(
      await sb().from("reservations").select("*").order("check_in").limit(1000),
    ) as Reservation[];
  },
  async getReservation(id) {
    return check(
      await sb().from("reservations").select("*").eq("id", id).maybeSingle(),
    ) as Reservation | null;
  },
  async createReservation(input) {
    return check(
      await sb().from("reservations").insert(input).select("*").single(),
    ) as Reservation;
  },
  async updateReservation(id, patch) {
    const clean = { ...patch, updated_at: new Date().toISOString() } as Record<string, unknown>;
    delete clean.id;
    return check(
      await sb().from("reservations").update(clean).eq("id", id).select("*").single(),
    ) as Reservation;
  },
};
