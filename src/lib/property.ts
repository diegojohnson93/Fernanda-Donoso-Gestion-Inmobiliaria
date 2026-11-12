import type { PropertyInput } from "./types";

const num = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

export function normalizeProperty(body: Record<string, unknown>): PropertyInput {
  const code = String(body.code ?? "").trim().toUpperCase();
  if (!code) throw new Error("La propiedad necesita un código (p. ej. REN-01)");
  const title = String(body.title ?? "").trim();
  if (!title) throw new Error("La propiedad necesita un título");
  const adIds = Array.isArray(body.ad_ids)
    ? body.ad_ids
    : String(body.ad_ids ?? "").split(/[\s,;]+/);
  return {
    code,
    title,
    operation: body.operation === "venta" ? "venta" : "arriendo",
    price: String(body.price ?? "").trim(),
    sector: String(body.sector ?? "").trim(),
    address: String(body.address ?? "").trim(),
    bedrooms: num(body.bedrooms),
    bathrooms: num(body.bathrooms),
    area_m2: num(body.area_m2),
    brief: String(body.brief ?? "").trim(),
    ad_ids: adIds.map((x) => String(x).trim()).filter(Boolean),
    links: String(body.links ?? "").trim(),
    active: body.active !== false,
  };
}
