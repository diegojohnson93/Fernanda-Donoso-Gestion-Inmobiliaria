import { getStore } from "./store";
import { addDays, isDay, nightsOf, todayChile } from "./reservations";
import type { Property } from "./types";

export const cleanText = (v: unknown, max: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u0008\u000B-\u001F]/g, "")
    .trim()
    .slice(0, max);

export interface StayInput {
  property: Property;
  check_in: string;
  check_out: string;
  guests: number | null;
  name: string;
  phone: string;
  email: string;
  message: string;
}

/** Valida los datos de una reserva. Lanza un Error con un mensaje para el usuario. */
export async function parseStay(
  body: Record<string, unknown>,
  opts: { requireContact: boolean; requirePublished: boolean; allowPast: boolean },
): Promise<StayInput> {
  const code = cleanText(body.property_code, 20).toUpperCase();
  const all = await getStore().listProperties();
  const property = all.find((p) => p.code.toUpperCase() === code);
  if (!property || !property.active || (opts.requirePublished && !property.published)) {
    throw new Error("No encontramos esa propiedad.");
  }
  if (!property.modalities?.includes("airbnb")) throw new Error("Esta propiedad no se arrienda por noches.");

  const check_in = body.check_in;
  const check_out = body.check_out;
  if (!isDay(check_in) || !isDay(check_out)) throw new Error("Elige las fechas de llegada y salida.");
  if (check_out <= check_in) throw new Error("La salida debe ser después de la llegada.");
  if (!opts.allowPast && check_in < todayChile()) throw new Error("La llegada no puede ser en el pasado.");
  if (check_in > addDays(todayChile(), 400)) throw new Error("Solo tomamos reservas hasta un año adelante.");
  if (nightsOf({ check_in, check_out }) > 90) throw new Error("Para estadías de más de 90 noches escríbenos por WhatsApp.");

  const name = cleanText(body.name, 80);
  const phone = cleanText(body.phone, 30).replace(/[^\d+]/g, "");
  const email = cleanText(body.email, 120).toLowerCase();
  if (opts.requireContact) {
    if (!name) throw new Error("Cuéntanos tu nombre.");
    if (phone.replace(/\D/g, "").length < 8) throw new Error("Déjanos un teléfono válido.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Déjanos un correo válido.");
  } else {
    if (!name) throw new Error("Falta el nombre del huésped.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("El correo no parece válido.");
  }
  const g = Number(body.guests);
  const guests = Number.isFinite(g) && g > 0 ? Math.min(Math.round(g), 50) : null;

  return { property, check_in, check_out, guests, name, phone, email, message: cleanText(body.message, 1500) };
}
