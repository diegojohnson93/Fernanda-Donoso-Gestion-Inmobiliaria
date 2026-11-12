import { sb } from "./store/supabase";
import type { Photo } from "./types";

/**
 * Fotos de propiedades.
 * - Con Supabase: se guardan en el bucket público "fotos" (se crea solo la primera vez).
 * - En modo demo: se guardan en memoria como data URL (se pierden al reiniciar).
 */

const BUCKET = "fotos";
const supabaseEnabled = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

let bucketReady = false;

async function ensureBucket() {
  if (bucketReady) return;
  const { data } = await sb().storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await sb().storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (error && !/already exists/i.test(error.message)) throw new Error(error.message);
  }
  bucketReady = true;
}

export async function uploadPhoto(
  bytes: ArrayBuffer,
  contentType: string,
  meta: { width?: number; height?: number } = {},
): Promise<Photo> {
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const path = `propiedades/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;

  if (!supabaseEnabled()) {
    const url = `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`;
    return { path: `memoria/${path}`, url, ...meta };
  }

  await ensureBucket();
  const { error } = await sb()
    .storage.from(BUCKET)
    .upload(path, bytes, { contentType, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`No se pudo subir la foto: ${error.message}`);
  const { data } = sb().storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl, ...meta };
}

export async function deletePhotos(paths: string[]) {
  const real = paths.filter((p) => !p.startsWith("memoria/"));
  if (!real.length || !supabaseEnabled()) return;
  const { error } = await sb().storage.from(BUCKET).remove(real);
  if (error) console.error("No se pudieron borrar fotos", error.message);
}
