import type { Modality } from "./ficha";

/**
 * Datos públicos del negocio y textos de la web.
 * Todo lo que Fernanda quiera cambiar en la web (textos, zona, contacto) está aquí.
 */
export const SITE = {
  name: "Fernanda Donoso",
  tagline: "Asesoría y Gestión Inmobiliaria",
  /** Número en formato internacional, solo dígitos (para links de WhatsApp). */
  whatsapp: "56993316129",
  whatsappDisplay: "+56 9 9331 6129",
  email: "",
  instagram: "",
  zone: "Viña del Mar, Reñaca y Concón",
  description:
    "Asesoría y gestión inmobiliaria en Viña del Mar, Reñaca y Concón. Primera asesoría gratuita para comprar, arrendar o invertir: Airbnb, marzo a diciembre, año corrido e inversión.",
  advisoryWhatsapp: "Hola Fernanda, quiero agendar una asesoría gratuita",

  hero: {
    marquee: "Asesoría inmobiliaria",
    lead: "Comprar o arrendar es una decisión importante.\nTe asesoramos gratis para encontrar la mejor opción para ti.",
    badge: "Primera asesoría sin costo",
  },

  intro: {
    title: "Mucho más que una corredora",
    text: "Antes de mostrarte propiedades, conversamos. Entendemos tu situación y tus objetivos para recomendarte lo que de verdad te conviene.",
  },

  advisory: {
    eyebrow: "Asesoría gratuita",
    title: "Una conversación que ilumina el camino",
    text: "Revisamos juntos tu situación para encontrar la mejor solución según tus ingresos, tus expectativas, tu nivel de ahorro y tu nivel de endeudamiento. Esa primera conversación es gratis y, muchas veces, cambia por completo la forma de ver tu decisión.",
    factors: ["Tus ingresos", "Tus expectativas", "Tu nivel de ahorro", "Tu nivel de endeudamiento"],
    steps: [
      {
        title: "Conversamos",
        text: "Una asesoría sin costo para entender tu situación, tus planes y lo que buscas.",
      },
      {
        title: "Definimos la estrategia",
        text: "Comprar, arrendar o invertir: te mostramos los números y las alternativas que tienes.",
      },
      {
        title: "Buscamos y negociamos",
        text: "Seleccionamos propiedades a tu medida y negociamos las mejores condiciones.",
      },
      {
        title: "Te acompañamos",
        text: "Visitas, documentos, firma y entrega. Estamos contigo en cada paso.",
      },
    ],
  },

  invest: {
    eyebrow: "Inversión inmobiliaria",
    quote: "Sin darte cuenta, ahorraste y te capitalizaste gracias a la compra de un departamento para vivir o arrendar.",
    text: "Las propiedades son un equilibrio entre seguridad e inversión inteligente que se paga sola. En muchos casos es posible comprar aunque no tengas el 100% del pie, y casi siempre hay espacio para negociar.",
  },

  about: {
    eyebrow: "Quién te asesora",
    title: "Hola, soy Fernanda",
    paragraphs: [
      "Soy Ingeniera Civil Industrial de la Pontificia Universidad Católica de Valparaíso y llevo más de tres años en el rubro inmobiliario, asesorando a familias, estudiantes, viajeros e inversionistas en Viña del Mar, Reñaca y Concón.",
      "Creo en la inversión inmobiliaria y la practico: mi portafolio personal incluye varias propiedades propias. Por eso te asesoro como lo haría para mí, con números claros y atención preferencial.",
    ],
    stats: [
      { value: "Ing. Civil Industrial", label: "Pontificia Universidad Católica de Valparaíso" },
      { value: "+3 años", label: "en el rubro inmobiliario" },
      { value: "+4", label: "propiedades propias en su portafolio" },
      { value: "Gratis", label: "la primera asesoría" },
    ],
  },

  value: {
    title: "Lo que recibes",
    note: "Comisión estándar de mercado.",
    items: [
      { title: "Asesoría personalizada", text: "Una primera conversación gratuita para entender tu caso y recomendarte lo que de verdad te conviene." },
      { title: "Fotos de calidad", text: "Cada propiedad se presenta con buenas fotos, para que veas lo que de verdad vas a encontrar." },
      { title: "Negociación", text: "Siempre hay algo que conversar: buscamos las mejores condiciones para ti." },
      { title: "Acompañamiento completo", text: "De la primera visita a la entrega de llaves, una sola persona a cargo y siempre disponible." },
    ],
  },

  owners: {
    title: "¿Tienes una propiedad?",
    text: "Te asesoramos para arrendarla o venderla en las mejores condiciones: la evaluamos contigo, la presentamos con buenas fotos y nos encargamos de los interesados.",
  },
};

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Las cuatro modalidades tal como se muestran en la web. */
export interface Category {
  modality: Modality;
  slug: string;
  title: string;
  /** Segunda línea opcional del título, más pequeña. */
  note?: string;
  description: string;
  lead: string;
  /** Clase de color de fondo (Tailwind) y color del texto encima. */
  bg: string;
  fg: string;
  hex: string;
}

export const CATEGORIES: Category[] = [
  {
    modality: "airbnb",
    slug: "airbnb",
    title: "Airbnb",
    description: "Estadías cortas para\nvacaciones y escapadas",
    lead: "Departamentos y casas para unos días en la costa, listos para llegar y disfrutar.",
    bg: "bg-cat-airbnb",
    fg: "text-cream",
    hex: "#8b9784",
  },
  {
    modality: "temporada",
    slug: "marzo-diciembre",
    title: "Marzo a Diciembre",
    description: "Arriendo por temporada\nacadémica",
    lead: "Arriendos de marzo a diciembre, ideales para estudiantes y profesionales que llegan por el año académico.",
    bg: "bg-cat-temporada",
    fg: "text-cream",
    hex: "#a8887f",
  },
  {
    modality: "anual",
    slug: "ano-corrido",
    title: "Año Corrido",
    description: "Arriendos de largo plazo\npara vivir",
    lead: "Propiedades para arrendar todo el año, con contrato y la tranquilidad de un hogar estable.",
    bg: "bg-cat-anual",
    fg: "text-cream",
    hex: "#6c7470",
  },
  {
    modality: "venta",
    slug: "inversion",
    title: "Compra",
    note: "Inversión",
    description: "Para vivir, arrendar\no capitalizarte",
    lead: "Propiedades en venta para vivir o invertir. Te asesoramos gratis para que compres con números claros.",
    bg: "bg-cat-venta",
    fg: "text-cream",
    hex: "#2d2a27",
  },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug) ?? null;
export const categoryFor = (m: Modality) => CATEGORIES.find((c) => c.modality === m)!;
