import { errorResponse } from "@/lib/http";
import { getStore } from "@/lib/store";
import type { Conversation } from "@/lib/types";

const EDITABLE = ["status", "notes", "contact_name", "property_id", "draft"] as const;

export async function PATCH(request: Request, ctx: RouteContext<"/api/conversations/[id]">) {
  const { id } = await ctx.params;
  try {
    const body = (await request.json()) as Partial<Conversation>;
    const patch: Partial<Conversation> = {};
    for (const k of EDITABLE) if (k in body) (patch as Record<string, unknown>)[k] = body[k];
    // Si Fernanda elige la propiedad a mano, queda fija para la IA.
    if ("property_id" in body) {
      patch.property_source = body.property_id ? "manual" : null;
      patch.property_confidence = body.property_id ? "alta" : null;
    }
    await getStore().updateConversation(id, patch);
    return Response.json(await getStore().getConversation(id));
  } catch (e) {
    return errorResponse(e);
  }
}
