import { errorResponse } from "@/lib/http";
import { approveAndSend } from "@/lib/inbox";
import { getStore } from "@/lib/store";

export async function POST(request: Request, ctx: RouteContext<"/api/conversations/[id]/send">) {
  const { id } = await ctx.params;
  try {
    const { text } = (await request.json()) as { text?: string };
    if (!text?.trim()) return errorResponse(new Error("El mensaje está vacío"), 400);
    const { result } = await approveAndSend(id, text.trim());
    return Response.json({ result, conversation: await getStore().getConversation(id) });
  } catch (e) {
    return errorResponse(e);
  }
}
