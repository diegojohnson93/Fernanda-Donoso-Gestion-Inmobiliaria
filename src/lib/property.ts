import { normalizeDetails, normalizeModalities } from "./ficha";
import type { Photo, PropertyInput } from "./types";

const num = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

function normalizePhotos(raw: unknown): Photo[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x) => x && typeof x === "object" && typeof x.path === "string" && typeof x.url === "string")
    .map((x) => ({
      path: x.path,
      url: x.url,
      ...(Number(x.width) ? { width: Number(x.width) } : {}),
      ...(Number(x.height) ? { height: Number(x.height) } : {}),
    }))
    .slice(0, 40);
}

export function normalizeProperty(body: Record<string, unknown>): PropertyInput {
  const code = String(body.code ?? "").trim().toUpperCase();
  if (!code) throw new Error("La propiedad necesita un código (p. ej. REN-01)");
  const title = String(body.title ?? "").trim();
  if (!title) throw new Error("La propiedad necesita un título");
  const modalities = normalizeModalities(body.modalities);
  if (!modalities.length) throw new Error("Elige al menos una modalidad (Airbnb, año corrido, marzo a diciembre o venta)");
  const adIds = Array.isArray(body.ad_ids)
    ? body.ad_ids
    : String(body.ad_ids ?? "").split(/[\s,;]+/);
  return {
    code,
    title,
    modalities,
    sector: String(body.sector ?? "").trim(),
    address: String(body.address ?? "").trim(),
    bedrooms: num(body.bedrooms),
    bathrooms: num(body.bathrooms),
    area_m2: num(body.area_m2),
    details: normalizeDetails(body.details),
    brief: String(body.brief ?? "").trim(),
    private_notes: String(body.private_notes ?? "").trim(),
    photos: normalizePhotos(body.photos),
    ad_ids: adIds.map((x) => String(x).trim()).filter(Boolean),
    links: String(body.links ?? "").trim(),
    active: body.active !== false,
  };
}
