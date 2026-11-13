/**
 * Ficha base de propiedades.
 *
 * Toda la ficha se define aquí: el formulario, la lectura de PDF por IA y lo
 * que la IA recibe para responder se generan a partir de esta lista.
 * Para agregar un campo nuevo basta con sumarlo a la sección correspondiente.
 */

export type Modality = "airbnb" | "anual" | "temporada" | "venta";

export const MODALITIES: Record<Modality, { label: string; short: string; hint: string }> = {
  airbnb: { label: "Arriendo Airbnb", short: "Airbnb", hint: "Por noches, a turistas" },
  anual: { label: "Arriendo año corrido", short: "Año corrido", hint: "Contrato de 12 meses o más" },
  temporada: { label: "Arriendo marzo a diciembre", short: "Mar–Dic", hint: "Temporada académica" },
  venta: { label: "Venta", short: "Venta", hint: "Compraventa" },
};

export const MODALITY_KEYS = Object.keys(MODALITIES) as Modality[];

export type FieldType = "text" | "number" | "select" | "multi" | "textarea";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  help?: string;
  /** Ancho en el formulario (de 6 columnas). */
  span?: 2 | 3 | 4 | 6;
}

/** Campos internos: nunca se muestran en la web ni se envían a la IA. */
export const PRIVATE_DETAIL_KEYS = new Set(["ical_airbnb"]);

export interface SectionDef {
  id: string;
  title: string;
  /** Si existe, la sección solo aplica a esa modalidad. */
  modality?: Modality;
  fields: FieldDef[];
}

const SI_NO = ["Sí", "No"];

export const FICHA: SectionDef[] = [
  {
    id: "general",
    title: "Características",
    fields: [
      {
        key: "tipo",
        label: "Tipo de propiedad",
        type: "select",
        options: ["Departamento", "Casa", "Casa en condominio", "Oficina", "Local comercial", "Terreno / Parcela", "Otro"],
        span: 2,
      },
      { key: "piso", label: "Piso", type: "text", placeholder: "9 de 15", span: 2 },
      { key: "m2_totales", label: "m² totales (con terraza)", type: "number", span: 2 },
      { key: "orientacion", label: "Orientación", type: "text", placeholder: "Nor-poniente", span: 2 },
      { key: "vista", label: "Vista", type: "text", placeholder: "Vista al mar despejada", span: 2 },
      { key: "anio", label: "Año de construcción", type: "text", span: 2 },
      { key: "estacionamientos", label: "Estacionamientos", type: "select", options: ["0", "1", "2", "3 o más"], span: 2 },
      { key: "bodega", label: "Bodega", type: "select", options: SI_NO, span: 2 },
      {
        key: "amoblado",
        label: "Amoblado",
        type: "select",
        options: ["Amoblado completo", "Semi-amoblado", "Sin amoblar"],
        span: 2,
      },
      {
        key: "mascotas",
        label: "Mascotas",
        type: "select",
        options: ["Se aceptan", "Solo pequeñas", "No se aceptan", "Consultar con propietario"],
        span: 2,
      },
      { key: "gastos_comunes", label: "Gastos comunes aprox.", type: "text", placeholder: "$120.000", span: 2 },
      { key: "calefaccion", label: "Calefacción / agua caliente", type: "text", placeholder: "Central / eléctrica / gas", span: 2 },
      {
        key: "amenidades",
        label: "Amenidades",
        type: "multi",
        options: [
          "Piscina",
          "Gimnasio",
          "Quincho",
          "Conserjería 24/7",
          "Ascensor",
          "Lavandería",
          "Terraza",
          "Jardín",
          "Sala de eventos",
          "Juegos infantiles",
          "Aire acondicionado",
          "Acceso a la playa",
        ],
        span: 6,
      },
      {
        key: "cercania",
        label: "Cerca de",
        type: "textarea",
        placeholder: "Playa a 5 min caminando, supermercado, locomoción a Viña, universidades…",
        span: 6,
      },
    ],
  },
  {
    id: "airbnb",
    title: "Arriendo Airbnb",
    modality: "airbnb",
    fields: [
      { key: "noche_baja", label: "Precio por noche, temporada baja", type: "text", placeholder: "$55.000", span: 3 },
      { key: "noche_alta", label: "Precio por noche, temporada alta", type: "text", placeholder: "$85.000 (dic–feb)", span: 3 },
      { key: "minimo_noches", label: "Mínimo de noches", type: "text", placeholder: "2 (3 en verano)", span: 2 },
      { key: "huespedes", label: "Huéspedes máximo", type: "number", span: 2 },
      { key: "tarifa_aseo", label: "Tarifa de aseo", type: "text", placeholder: "$25.000", span: 2 },
      { key: "camas", label: "Camas", type: "text", placeholder: "1 king, 2 single, sofá cama", span: 6 },
      { key: "checkin", label: "Check-in", type: "text", placeholder: "Desde 15:00, autónomo con caja de llaves", span: 3 },
      { key: "checkout", label: "Check-out", type: "text", placeholder: "Hasta 11:00", span: 3 },
      {
        key: "incluye_airbnb",
        label: "Incluye",
        type: "multi",
        options: ["Ropa de cama", "Toallas", "Wi-Fi", "Estacionamiento", "Cocina equipada", "Smart TV", "Lavadora", "Cuna"],
        span: 6,
      },
      {
        key: "reserva",
        label: "Cómo se reserva",
        type: "select",
        options: ["Solo por Airbnb", "Por Airbnb o directo", "Solo directo"],
        span: 3,
      },
      { key: "link_airbnb", label: "Link del anuncio en Airbnb", type: "text", span: 3 },
      {
        key: "ical_airbnb",
        label: "Calendario de Airbnb (enlace .ics)",
        type: "text",
        placeholder: "https://www.airbnb.cl/calendar/ical/….ics?s=…",
        help: "En Airbnb: Calendario → Disponibilidad → Conectar calendarios → Exportar calendario. Copia el enlace que termina en .ics. Es privado: no se muestra en la web.",
        span: 6,
      },
      {
        key: "reglas",
        label: "Reglas de la casa",
        type: "textarea",
        placeholder: "No fumar, no se permiten fiestas, silencio desde las 23:00…",
        span: 6,
      },
    ],
  },
  {
    id: "anual",
    title: "Arriendo año corrido",
    modality: "anual",
    fields: [
      { key: "canon_anual", label: "Arriendo mensual", type: "text", placeholder: "$750.000", span: 2 },
      { key: "gc_incluidos_anual", label: "¿Incluye gastos comunes?", type: "select", options: SI_NO, span: 2 },
      { key: "disponible_anual", label: "Disponible desde", type: "text", placeholder: "1 de diciembre", span: 2 },
      { key: "garantia_anual", label: "Garantía", type: "text", placeholder: "1 mes", span: 2 },
      { key: "contrato_anual", label: "Contrato mínimo", type: "text", placeholder: "12 meses", span: 2 },
      { key: "reajuste", label: "Reajuste", type: "text", placeholder: "IPC semestral", span: 2 },
      {
        key: "requisitos_anual",
        label: "Requisitos",
        type: "textarea",
        placeholder: "Renta líquida 3 veces el arriendo, 3 últimas liquidaciones, sin DICOM, aval si es independiente…",
        span: 6,
      },
    ],
  },
  {
    id: "temporada",
    title: "Arriendo marzo a diciembre",
    modality: "temporada",
    fields: [
      { key: "canon_temporada", label: "Arriendo mensual", type: "text", placeholder: "$480.000", span: 2 },
      { key: "periodo", label: "Período", type: "text", placeholder: "1 de marzo al 31 de diciembre", span: 4 },
      {
        key: "perfil",
        label: "Perfil buscado",
        type: "select",
        options: ["Estudiantes", "Profesionales", "Indistinto"],
        span: 2,
      },
      { key: "garantia_temporada", label: "Garantía", type: "text", placeholder: "1 mes", span: 2 },
      { key: "disponible_temporada", label: "Disponible desde", type: "text", placeholder: "1 de marzo", span: 2 },
      {
        key: "servicios_temporada",
        label: "Incluye en el arriendo",
        type: "multi",
        options: ["Gastos comunes", "Luz", "Agua", "Gas", "Internet"],
        span: 6,
      },
      {
        key: "requisitos_temporada",
        label: "Requisitos",
        type: "textarea",
        placeholder: "Aval o codeudor solidario con liquidaciones, certificado de alumno regular…",
        span: 6,
      },
    ],
  },
  {
    id: "venta",
    title: "Venta",
    modality: "venta",
    fields: [
      { key: "precio_venta", label: "Precio", type: "text", placeholder: "UF 9.800", span: 2 },
      {
        key: "estado",
        label: "Estado",
        type: "select",
        options: ["Usada", "Nueva", "Entrega inmediata", "En verde", "En blanco"],
        span: 2,
      },
      { key: "credito", label: "Acepta crédito hipotecario", type: "select", options: SI_NO, span: 2 },
      { key: "contribuciones", label: "Contribuciones", type: "text", placeholder: "$280.000 trimestrales / Exenta", span: 3 },
      {
        key: "negociable",
        label: "¿Precio conversable?",
        type: "select",
        options: ["Sí", "No", "Propietario evalúa ofertas"],
        span: 3,
      },
      {
        key: "documentos",
        label: "Situación legal y documentos",
        type: "textarea",
        placeholder: "Recepción final, título al día, sin hipoteca vigente…",
        span: 6,
      },
    ],
  },
  {
    id: "visitas",
    title: "Visitas",
    fields: [
      { key: "dias_visita", label: "Días y horarios", type: "text", placeholder: "Lunes a sábado, 10:00 a 19:00", span: 3 },
      { key: "anticipacion", label: "Anticipación para agendar", type: "text", placeholder: "24 horas", span: 3 },
      {
        key: "como_visitar",
        label: "Cómo funcionan las visitas",
        type: "textarea",
        placeholder: "Fernanda muestra la propiedad; se pide nombre y RUT para el registro de conserjería…",
        span: 6,
      },
    ],
  },
];

export type Details = Record<string, string | string[]>;

const ALL_FIELDS = new Map(FICHA.flatMap((s) => s.fields.map((f) => [f.key, f] as const)));

export function sectionsFor(modalities: Modality[]): SectionDef[] {
  return FICHA.filter((s) => !s.modality || modalities.includes(s.modality));
}

/** Limpia y valida lo que llega del formulario o del PDF. */
export function normalizeDetails(raw: unknown): Details {
  const out: Details = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const field = ALL_FIELDS.get(key);
    if (!field || value === null || value === undefined) continue;
    if (field.type === "multi") {
      const arr = (Array.isArray(value) ? value : String(value).split(","))
        .map((v) => String(v).trim())
        .filter(Boolean);
      if (arr.length) out[key] = arr;
    } else {
      const s = String(value).trim();
      if (s) out[key] = s;
    }
  }
  return out;
}

export function normalizeModalities(raw: unknown): Modality[] {
  const arr = Array.isArray(raw) ? raw : [];
  return MODALITY_KEYS.filter((m) => arr.includes(m));
}

/** Precio principal de cada modalidad, para tarjetas y resúmenes. */
export function priceLines(modalities: Modality[], d: Details): { modality: Modality; text: string }[] {
  const get = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");
  return modalities
    .map((m) => {
      let text = "";
      if (m === "airbnb") {
        const low = get("noche_baja");
        const high = get("noche_alta");
        text = low && high ? `${low} a ${high} por noche` : low || high ? `${low || high} por noche` : "";
      }
      if (m === "anual") text = get("canon_anual") ? `${get("canon_anual")} mensual` : "";
      if (m === "temporada") text = get("canon_temporada") ? `${get("canon_temporada")} mensual` : "";
      if (m === "venta") text = get("precio_venta");
      return { modality: m, text: text || "precio por definir" };
    });
}

/** Texto de la ficha, por secciones, tal como lo recibe la IA. */
export function detailsToText(modalities: Modality[], d: Details): string {
  const lines: string[] = [];
  for (const section of sectionsFor(modalities)) {
    const filled = section.fields
      .filter((f) => !PRIVATE_DETAIL_KEYS.has(f.key))
      .map((f) => {
        const v = d[f.key];
        if (!v || (Array.isArray(v) && !v.length)) return null;
        return `- ${f.label}: ${Array.isArray(v) ? v.join(", ") : v}`;
      })
      .filter(Boolean);
    if (filled.length) lines.push(`[${section.title}]`, ...(filled as string[]));
  }
  return lines.join("\n");
}

/** Descripción de los campos para pedirle a la IA que lea un PDF. */
export function extractionSchema(): string {
  return FICHA.flatMap((s) =>
    s.fields.filter((f) => !PRIVATE_DETAIL_KEYS.has(f.key)).map((f) => {
      const opts = f.options ? ` — opciones: ${f.options.map((o) => `"${o}"`).join(" | ")}` : "";
      const kind = f.type === "multi" ? " (lista)" : "";
      return `"${f.key}": ${f.label}${kind}${opts}`;
    }),
  ).join("\n");
}
