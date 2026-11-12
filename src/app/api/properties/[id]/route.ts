import { errorResponse } from "@/lib/http";
import { normalizeProperty } from "@/lib/property";
import { getStore } from "@/lib/store";

export async function PUT(request: Request, ctx: RouteContext<"/api/properties/[id]">) {
  const { id } = await ctx.params;
  try {
    const input = normalizeProperty(await request.json());
    const existing = await getStore().listProperties();
    if (existing.some((p) => p.id !== id && p.code.toUpperCase() === input.code.toUpperCase())) {
      return errorResponse(new Error(`Ya existe una propiedad con el código ${input.code}`), 400);
    }
    return Response.json(await getStore().updateProperty(id, input));
  } catch (e) {
    return errorResponse(e, 400);
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/properties/[id]">) {
  const { id } = await ctx.params;
  try {
    await getStore().deleteProperty(id);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
