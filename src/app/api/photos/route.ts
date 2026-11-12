import { errorResponse } from "@/lib/http";
import { uploadPhoto } from "@/lib/photos";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/** Sube una foto (ya comprimida en el navegador) y devuelve su URL. */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return errorResponse(new Error("Falta la foto"), 400);
    if (!ALLOWED.includes(file.type)) {
      return errorResponse(new Error("Formato no soportado. Usa JPG, PNG o WebP."), 400);
    }
    if (file.size > 4 * 1024 * 1024) {
      return errorResponse(new Error("La foto pesa más de 4 MB incluso comprimida."), 400);
    }
    const photo = await uploadPhoto(await file.arrayBuffer(), file.type, {
      width: Number(form.get("width")) || undefined,
      height: Number(form.get("height")) || undefined,
    });
    return Response.json(photo);
  } catch (e) {
    return errorResponse(e);
  }
}
