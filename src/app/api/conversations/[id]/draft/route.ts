import { errorResponse } from "@/lib/http";
import { refreshDraft } from "@/lib/inbox";
import { getStore } from "@/lib/store";

export const maxDuration = 60;

export async function POST(_request: Request, ctx: RouteContext<"/api/conversations/[id]/draft">) {
  const { id } = await ctx.params;
  try {
    await refreshDraft(id);
    return Response.json(await getStore().getConversation(id));
  } catch (e) {
    return errorResponse(e);
  }
}
