import type { Details, Modality } from "./ficha";
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
    details: p.details ?? {},
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
