import { connection } from "next/server";
import { errorResponse } from "@/lib/http";
import { normalizeProperty } from "@/lib/property";
import { getStore } from "@/lib/store";

export async function GET() {
  await connection();
  try {
    return Response.json(await getStore().listProperties());
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const input = normalizeProperty(await request.json());
    const existing = await getStore().listProperties();
    if (existing.some((p) => p.code.toUpperCase() === input.code.toUpperCase())) {
      return errorResponse(new Error(`Ya existe una propiedad con el código ${input.code}`), 400);
    }
    return Response.json(await getStore().createProperty(input));
  } catch (e) {
    return errorResponse(e, 400);
  }
}
