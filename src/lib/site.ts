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
  zone: "Viña del Mar, Valparaíso, Reñaca y Concón",
  description:
    "Asesoría y gestión inmobiliaria en Viña del Mar, Valparaíso, Reñaca y Concón. Primera asesoría gratuita para comprar, arrendar o invertir: Airbnb, marzo a diciembre, año corrido e inversión.",
  advisoryWhatsapp: "Hola Fernanda, quiero agendar una asesoría gratuita",

  hero: {
    marquee: "Asesoría inmobiliaria",
    lead: "Comprar o arrendar es una decisión importante.\nTe asesoramos gratis para encontrar la mejor opción para ti.",
    badge: "Primera asesoría sin costo",
  },

  /** Párrafo grande después de la foto que crece. */
  statement:
    "Te acompañamos desde la primera conversación hasta la entrega de llaves: entendemos tus números y tus objetivos, seleccionamos las propiedades que de verdad te convienen y negociamos por ti, para que tomes la mejor decisión con total confianza.",

  intro: {
    title: "Mucho más que una corredora",
    text: "Antes de mostrarte propiedades, conversamos. Entendemos tu situación y tus objetivos para recomendarte lo que de verdad te conviene.",
  },

  advisory: {
    eyebrow: "Asesoría gratuita",
    title: "Vamos a tomar un café",
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
        title: "Buscamos y cotizamos",
        text: "Seleccionamos propiedades a tu medida y negociamos las mejores condiciones.",
      },
      {
        title: "Te acompañamos",
        text: "Visitas, documentos, firma y entrega. Estamos contigo en cada paso.",
      },
    ],
  },

  invest: {
    eyebrow: "Nuestra mirada",
    quote:
      "Para nosotros, una propiedad es mucho más que metros cuadrados. Es todo lo que la rodea: las personas que la habitan, el barrio que la envuelve y la forma en que un espacio se integra a una vida que ya está en movimiento. Para eso trabajamos, en la costa que conocemos bien.",
    text: "Una propiedad bien elegida une la tranquilidad de un bien real con la inteligencia de una inversión que, mes a mes, se va pagando sola. Y el camino suele estar más cerca de lo que imaginas: muchas veces es posible dar el paso sin tener todo el pie reunido, y siempre vale la pena conversar las condiciones.",
  },

  /** Página Nosotros. */
  aboutPage: {
    marquee: "Nosotros",
    statement:
      "Fernanda Donoso Asesoría & Gestión Inmobiliaria acompaña a quienes buscan comprar, arrendar o invertir en Viña del Mar, Valparaíso, Reñaca y Concón, con una mirada financiera, números claros y atención preferencial en cada paso.",
    quote: "Una buena propiedad no es un gasto: con los números claros, es una decisión que trabaja para ti.",
    closing: "Fernanda Donoso",
  },

  about: {
    eyebrow: "Quién te asesora",
    title: "Hola, soy Fernanda",
    paragraphs: [
      "Soy Ingeniera Civil Industrial de la Pontificia Universidad Católica de Valparaíso y llevo más de tres años en el rubro inmobiliario, asesorando a familias, estudiantes, viajeros e inversionistas en Viña del Mar, Valparaíso, Reñaca y Concón.",
      "Creo en la inversión inmobiliaria y la practico: mi portafolio personal incluye varias propiedades propias. Por eso te asesoro como lo haría para mí, con números claros y atención preferencial.",
    ],
    stats: [
      { value: "Ing. Civil Industrial", label: "Pontificia Universidad Católica de Valparaíso" },
      { value: "+3 años", label: "en el rubro inmobiliario" },
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
      { title: "Acompañamiento", text: "De la primera visita a la entrega de llaves, una sola persona a cargo y siempre disponible." },
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
  /** Foto de la portada, que crece con el scroll. */
  image: string;
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
    image: "/images/renaca.webp",
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
    image: "/images/vina-del-mar.webp",
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
    image: "/images/vina-del-mar.webp",
  },
  {
    modality: "venta",
    slug: "comprar",
    title: "Comprar",
    description: "Para vivir, arrendar\no capitalizarte",
    lead: "Propiedades en venta para vivir o invertir. Te asesoramos gratis para que compres con números claros.",
    bg: "bg-cat-venta",
    fg: "text-cream",
    hex: "#2d2a27",
    image: "/images/renaca.webp",
  },
];

/** Pregunta al elegir "Comprar": ¿para invertir o para vivir? */
export const BUY_INTENTS = {
  invertir: {
    label: "Para invertir",
    text: "Te ayudamos a evaluar cada propiedad como inversión: arriendo esperado, gastos, financiamiento y cuánto pie necesitas. La primera asesoría es gratis.",
    cta: "Quiero asesoría para invertir",
    whatsapp: "Hola Fernanda, quiero comprar una propiedad para invertir",
  },
  vivir: {
    label: "Para vivir",
    text: "Te ayudamos a encontrar tu hogar y a revisar tu capacidad de compra según tus ingresos, tu ahorro y tu nivel de endeudamiento. La primera asesoría es gratis.",
    cta: "Quiero asesoría para comprar",
    whatsapp: "Hola Fernanda, quiero comprar una propiedad para vivir",
  },
} as const;

export type BuyIntent = keyof typeof BUY_INTENTS;

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug) ?? null;
export const categoryFor = (m: Modality) => CATEGORIES.find((c) => c.modality === m)!;
