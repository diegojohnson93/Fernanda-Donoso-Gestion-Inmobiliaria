import { errorResponse } from "@/lib/http";
import { deletePhotos } from "@/lib/photos";
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
    const before = existing.find((p) => p.id === id);
    const saved = await getStore().updateProperty(id, input);
    // Las fotos que se quitaron de la ficha se borran del almacenamiento.
    const kept = new Set(input.photos.map((p) => p.path));
    await deletePhotos((before?.photos ?? []).map((p) => p.path).filter((p) => !kept.has(p)));
    return Response.json(saved);
  } catch (e) {
    return errorResponse(e, 400);
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/properties/[id]">) {
  const { id } = await ctx.params;
  try {
    const before = await getStore().getProperty(id);
    await getStore().deleteProperty(id);
    await deletePhotos((before?.photos ?? []).map((p) => p.path));
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
