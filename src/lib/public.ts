import { airbnbBusyNights, type Availability } from "./airbnb-calendar";
import { FICHA, MODALITIES, PRIVATE_DETAIL_KEYS, priceLines, type Details, type Modality } from "./ficha";
import { getStore } from "./store";
import type { Photo, Property } from "./types";

/**
 * Datos de propiedades para la web pública.
 * Solo propiedades disponibles y marcadas para publicar, y nunca las notas
 * privadas, los IDs de avisos ni la dirección exacta si Fernanda no lo autoriza.
 */
export interface PublicProperty {
  slug: string;
  code: string;
  title: string;
  modalities: Modality[];
  sector: string;
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_m2: number | null;
  details: Details;
  description: string;
  photos: Photo[];
  featured: boolean;
  links: string;
}

export const slugFor = (code: string) => code.toLowerCase();

function toPublic(p: Property): PublicProperty {
  return {
    slug: slugFor(p.code),
    code: p.code,
    title: p.title,
    modalities: p.modalities ?? [],
    sector: p.sector,
    address: p.show_address ? p.address : null,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area_m2: p.area_m2,
    details: Object.fromEntries(Object.entries(p.details ?? {}).filter(([k]) => !PRIVATE_DETAIL_KEYS.has(k))),
    description: p.web_description,
    photos: p.photos ?? [],
    featured: Boolean(p.featured),
    links: p.links,
  };
}

export async function getPublishedProperties(): Promise<PublicProperty[]> {
  const all = await getStore().listProperties();
  return all
    .filter((p) => p.active && p.published)
    .map(toPublic)
    .sort((a, b) => Number(b.featured) - Number(a.featured));
}

export async function getPublishedProperty(slug: string): Promise<PublicProperty | null> {
  const all = await getPublishedProperties();
  return all.find((p) => p.slug === slug.toLowerCase()) ?? null;
}

/**
 * Noches ocupadas según el calendario de Airbnb de la propiedad (solo en el
 * servidor: el enlace del calendario es privado y no llega al navegador).
 */
export async function getAirbnbAvailability(code: string): Promise<Availability | null> {
  const all = await getStore().listProperties();
  const p = all.find((x) => x.active && x.published && x.code.toLowerCase() === code.toLowerCase());
  const url = p?.details?.ical_airbnb;
  if (!p || !p.modalities?.includes("airbnb") || typeof url !== "string" || !url.trim()) return null;
  return airbnbBusyNights(url.trim());
}

/* ------------------------------------------------------------------------ */
/* Ayudas de presentación                                                    */
/* ------------------------------------------------------------------------ */


/** Campos que no se muestran en la web aunque estén en la ficha. */
const HIDDEN_ON_WEB = new Set(["negociable", "link_airbnb"]);

export function priceFor(p: PublicProperty, m: Modality): string {
  return priceLines([m], p.details)[0]?.text ?? "";
}

export function factsLine(p: PublicProperty): string {
  return [
    p.bedrooms ? `${p.bedrooms} ${p.bedrooms === 1 ? "dormitorio" : "dormitorios"}` : null,
    p.bathrooms ? `${p.bathrooms} ${p.bathrooms === 1 ? "baño" : "baños"}` : null,
    p.area_m2 ? `${p.area_m2} m²` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export interface DetailSection {
  id: string;
  title: string;
  modality?: Modality;
  rows: { label: string; value: string }[];
}

export function detailSections(p: PublicProperty): DetailSection[] {
  return FICHA.filter((s) => !s.modality || p.modalities.includes(s.modality))
    .map((s) => ({
      id: s.id,
      title: s.modality ? MODALITIES[s.modality].label : s.title,
      modality: s.modality,
      rows: s.fields
        .filter((f) => !HIDDEN_ON_WEB.has(f.key))
        .map((f) => {
          const v = p.details[f.key];
          const value = Array.isArray(v) ? v.join(", ") : (v ?? "");
          return { label: f.label, value };
        })
        .filter((r) => r.value),
    }))
    .filter((s) => s.rows.length);
}
