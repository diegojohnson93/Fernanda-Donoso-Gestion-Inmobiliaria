import { writeWebDescription } from "@/lib/ai";
import { errorResponse } from "@/lib/http";
import { normalizeProperty } from "@/lib/property";

export const maxDuration = 60;

/** Redacta la descripción comercial para la web a partir de la ficha (sin guardarla). */
export async function POST(request: Request) {
  try {
    const input = normalizeProperty(await request.json());
    return Response.json({ text: await writeWebDescription(input) });
  } catch (e) {
    return errorResponse(e, 400);
  }
}
