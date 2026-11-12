import type { Conversation, Message, Property } from "../types";

/** Datos de ejemplo para el modo demo. Todas las propiedades son ficticias. */
export function buildSeed(): {
  properties: Property[];
  conversations: Conversation[];
  messages: Message[];
} {
  const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

  const base = {
    links: "",
    active: true,
    private_notes: "",
    photos: [],
    published: true,
    featured: false,
    show_address: false,
    web_description: "",
  };
  const properties: Property[] = [
    {
      ...base,
      id: "p-ren01",
      featured: true,
      code: "REN-01",
      title: "Depto 2D2B con vista al mar, Reñaca",
      modalities: ["anual", "airbnb"],
      sector: "Reñaca",
      address: "Av. Borgoño (altura 15.000), Reñaca",
      bedrooms: 2,
      bathrooms: 2,
      area_m2: 68,
      details: {
        tipo: "Departamento",
        piso: "9",
        orientacion: "Nor-poniente",
        vista: "Vista despejada al mar",
        estacionamientos: "1",
        bodega: "Sí",
        amoblado: "Sin amoblar",
        mascotas: "Solo pequeñas",
        gastos_comunes: "$120.000",
        amenidades: ["Piscina", "Gimnasio", "Conserjería 24/7", "Ascensor"],
        canon_anual: "$750.000",
        gc_incluidos_anual: "No",
        disponible_anual: "1 de diciembre",
        garantia_anual: "1 mes + 1 mes adelantado",
        contrato_anual: "12 meses",
        requisitos_anual: "Renta líquida 3 veces el arriendo, 3 últimas liquidaciones, sin DICOM",
        noche_baja: "$60.000",
        noche_alta: "$95.000 (diciembre a febrero)",
        minimo_noches: "2 (4 en verano)",
        huespedes: "4",
        reserva: "Solo por Airbnb",
        dias_visita: "Lunes a sábado",
        anticipacion: "24 horas",
      },
      brief: "PROPIEDAD DE EJEMPLO (ficticia).\nEl arriendo por Airbnb se ofrece solo mientras no se arriende por año corrido.",
      private_notes: "Propietario acepta bajar a $720.000 si el contrato es por 2 años.",
      ad_ids: ["120210000000000001"],
      created_at: ago(60 * 24 * 7),
    },
    {
      ...base,
      id: "p-vin02",
      code: "VIN-02",
      title: "Depto 1D1B amoblado, Viña centro",
      modalities: ["temporada"],
      sector: "Viña del Mar centro",
      address: "Calle Quinta, a 2 cuadras de Av. Libertad",
      bedrooms: 1,
      bathrooms: 1,
      area_m2: 38,
      details: {
        tipo: "Departamento",
        estacionamientos: "0",
        amoblado: "Amoblado completo",
        mascotas: "No se aceptan",
        cercania: "Universidades a 10 min en micro, metro Miramar a 4 cuadras",
        canon_temporada: "$480.000",
        periodo: "1 de marzo al 31 de diciembre",
        perfil: "Estudiantes",
        garantia_temporada: "1 mes",
        disponible_temporada: "1 de marzo",
        servicios_temporada: ["Gastos comunes", "Internet"],
        requisitos_temporada: "Aval o codeudor con liquidaciones de sueldo, certificado de alumno regular",
      },
      brief: "PROPIEDAD DE EJEMPLO (ficticia).",
      ad_ids: [],
      created_at: ago(60 * 24 * 5),
    },
    {
      ...base,
      id: "p-con03",
      code: "CON-03",
      title: "Casa 4D3B con jardín, Concón",
      modalities: ["venta"],
      sector: "Concón",
      address: "Sector Bosques de Montemar, Concón",
      bedrooms: 4,
      bathrooms: 3,
      area_m2: 180,
      details: {
        tipo: "Casa en condominio",
        m2_totales: "400",
        estacionamientos: "2",
        amenidades: ["Jardín", "Quincho"],
        precio_venta: "UF 9.800",
        estado: "Usada",
        credito: "Sí",
        contribuciones: "$280.000 trimestrales",
        negociable: "Propietario evalúa ofertas",
        dias_visita: "Fines de semana",
        anticipacion: "48 horas",
      },
      brief: "PROPIEDAD DE EJEMPLO (ficticia).\nCondominio cerrado con guardia.",
      ad_ids: ["120210000000000003"],
      created_at: ago(60 * 24 * 3),
    },
  ];

  const conversations: Conversation[] = [];
  const messages: Message[] = [];

  const add = (
    c: Omit<Conversation, "created_at" | "updated_at">,
    msgs: [number, "in" | "out", string][],
  ) => {
    const last = msgs[msgs.length - 1][0];
    conversations.push({ ...c, created_at: ago(msgs[0][0]), updated_at: ago(last) });
    msgs.forEach(([min, direction, text], i) =>
      messages.push({
        id: `${c.id}-m${i}`,
        conversation_id: c.id,
        direction,
        text,
        created_at: ago(min),
        send_status: direction === "out" ? "simulado" : null,
      }),
    );
  };

  add(
    {
      id: "c-1",
      channel: "whatsapp",
      external_id: "sim-56911111111",
      contact_name: "Camila Rojas",
      property_id: "p-ren01",
      property_source: "aviso",
      property_confidence: "alta",
      status: "nuevo",
      referral_ad_id: "120210000000000001",
      referral_text: "Aviso: Depto vista al mar Reñaca",
      notes: "",
      last_customer_message_at: ago(12),
      draft: {
        text:
          "¡Hola Camila! Gracias por escribir. Sí, el departamento en Reñaca (REN-01) acepta mascotas pequeñas 🐾. El arriendo es de $750.000 más gastos comunes (aprox. $120.000) e incluye estacionamiento y bodega. Está disponible desde el 1 de diciembre. ¿Te gustaría coordinar una visita esta semana?",
        property_code: "REN-01",
        confidence: "alta",
        reasoning: "La conversación llegó desde el aviso vinculado a REN-01 (arriendo año corrido).",
        missing_info: [],
        generated_at: ago(11),
        engine: "plantilla",
      },
    },
    [[12, "in", "Hola! vi el aviso, ¿aceptan mascotas? tengo un perrito chico"]],
  );

  add(
    {
      id: "c-2",
      channel: "instagram",
      external_id: "sim-ig-2002",
      contact_name: "@tomas.vina",
      property_id: "p-vin02",
      property_source: "codigo",
      property_confidence: "alta",
      status: "nuevo",
      referral_ad_id: null,
      referral_text: null,
      notes: "",
      last_customer_message_at: ago(45),
      draft: {
        text:
          "¡Hola Tomás! El VIN-02 se arrienda de marzo a diciembre, desde el 1 de marzo, a $480.000 mensuales con gastos comunes e internet incluidos, y viene amoblado completo. Lamentablemente no tiene estacionamiento. ¿Quieres que agendemos una visita?",
        property_code: "VIN-02",
        confidence: "alta",
        reasoning: "El cliente menciona el código VIN-02.",
        missing_info: [],
        generated_at: ago(44),
        engine: "plantilla",
      },
    },
    [[45, "in", "Hola, consulta por el VIN-02, ¿tiene estacionamiento? y desde cuándo se puede arrendar"]],
  );

  add(
    {
      id: "c-3",
      channel: "messenger",
      external_id: "sim-fb-3003",
      contact_name: "Paula Fernández",
      property_id: null,
      property_source: null,
      property_confidence: "baja",
      status: "nuevo",
      referral_ad_id: null,
      referral_text: null,
      notes: "",
      last_customer_message_at: ago(130),
      draft: {
        text:
          "¡Hola Paula! Gracias por escribirnos. Para darte la información correcta, ¿me cuentas por cuál propiedad consultas? Si tienes el código del aviso (por ejemplo REN-01) o el sector, mejor 😊",
        property_code: null,
        confidence: "baja",
        reasoning:
          "Pregunta por un 'depto' sin código ni sector; hay dos departamentos en arriendo que podrían calzar (REN-01 y VIN-02).",
        missing_info: [],
        generated_at: ago(129),
        engine: "plantilla",
      },
    },
    [[130, "in", "Buenas tardes, ¿sigue disponible el depto? ¿cuánto es el arriendo?"]],
  );

  add(
    {
      id: "c-4",
      channel: "whatsapp",
      external_id: "sim-56922222222",
      contact_name: "Rodrigo Muñoz",
      property_id: "p-con03",
      property_source: "ia",
      property_confidence: "media",
      status: "respondido",
      referral_ad_id: null,
      referral_text: null,
      notes: "Interesado en comprar con crédito hipotecario.",
      last_customer_message_at: ago(60 * 20),
      draft: {
        text:
          "¡Hola Rodrigo! La casa de Concón (CON-03) tiene contribuciones de aprox. $280.000 trimestrales. Sobre los gastos comunes del condominio, déjame confirmarlo y te aviso hoy mismo. ¿Te acomoda visitarla este fin de semana?",
        property_code: "CON-03",
        confidence: "media",
        reasoning: "Menciona 'la casa de Concón'; CON-03 es la única casa en Concón.",
        missing_info: ["Gastos comunes del condominio"],
        generated_at: ago(60 * 20 - 1),
        engine: "plantilla",
      },
    },
    [
      [60 * 22, "in", "Hola, me interesa la casa de Concón, ¿acepta crédito hipotecario?"],
      [60 * 21, "out", "¡Hola Rodrigo! Sí, la casa acepta crédito hipotecario. ¿Quieres que te envíe más detalles?"],
      [60 * 20, "in", "Sí porfa. ¿Cuánto son las contribuciones y los gastos comunes del condominio?"],
    ],
  );

  return { properties, conversations, messages };
}
