import type {
  Channel,
  Conversation,
  ConversationWithMessages,
  Message,
  Property,
  PropertyInput,
} from "../types";

export interface Store {
  kind: "memoria" | "supabase";

  listProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | null>;
  createProperty(input: PropertyInput): Promise<Property>;
  updateProperty(id: string, patch: Partial<PropertyInput>): Promise<Property>;
  deleteProperty(id: string): Promise<void>;

  listConversations(): Promise<ConversationWithMessages[]>;
  getConversation(id: string): Promise<ConversationWithMessages | null>;
  findConversation(channel: Channel, externalId: string): Promise<Conversation | null>;
  createConversation(
    input: Omit<Conversation, "id" | "created_at" | "updated_at">,
  ): Promise<Conversation>;
  updateConversation(id: string, patch: Partial<Conversation>): Promise<Conversation>;

  addMessage(input: Omit<Message, "id">): Promise<Message>;
}
