import { extractPropertyFromPdf } from "@/lib/ai";
import { normalizeDetails, normalizeModalities } from "@/lib/ficha";
import { errorResponse } from "@/lib/http";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return errorResponse(new Error("Falta el archivo"), 400);
    if (file.type !== "application/pdf") return errorResponse(new Error("El archivo debe ser PDF"), 400);
    if (file.size > 4 * 1024 * 1024) {
      return errorResponse(new Error("El PDF supera 4 MB. Prueba con una versión más liviana."), 400);
    }
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const data = await extractPropertyFromPdf(base64);
    return Response.json({
      ...data,
      modalities: normalizeModalities(data.modalities),
      details: normalizeDetails(data.details),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
