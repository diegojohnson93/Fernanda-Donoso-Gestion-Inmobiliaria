/** Datos públicos del negocio, usados por la web y los botones de contacto. */
export const SITE = {
  name: "Fernanda Donoso",
  tagline: "Gestión Inmobiliaria",
  /** Número en formato internacional, solo dígitos (para links de WhatsApp). */
  whatsapp: "56993316129",
  whatsappDisplay: "+56 9 9331 6129",
  email: "",
  zone: "Viña del Mar, Reñaca y Concón",
};

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
