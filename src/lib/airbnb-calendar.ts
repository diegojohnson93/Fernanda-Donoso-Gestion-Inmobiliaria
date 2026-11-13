/**
 * Lectura del calendario de Airbnb (formato iCal / .ics) de una propiedad.
 * Airbnb publica un enlace por anuncio con las fechas reservadas y bloqueadas.
 * Lo leemos en el servidor y guardamos el resultado unos minutos para no
 * consultar a Airbnb en cada visita.
 */

export interface Availability {
  /** Noches ocupadas, como "AAAA-MM-DD" (la noche que empieza ese día). */
  busy: string[];
  /** Cuándo se leyó el calendario (ISO). */
  fetchedAt: string;
}

const TTL_MS = 30 * 60 * 1000;
const MAX_DAYS = 400;

type Cache = Map<string, { at: number; data: Availability }>;
const g = globalThis as unknown as { __airbnbCal?: Cache };
const cache: Cache = (g.__airbnbCal ??= new Map());

/** Solo aceptamos enlaces de calendario de Airbnb (evita leer otras direcciones). */
export function isAirbnbIcalUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return (
      u.protocol === "https:" &&
      /(^|\.)airbnb\.(com|[a-z]{2}|com\.[a-z]{2}|co\.[a-z]{2})$/i.test(u.hostname) &&
      u.pathname.startsWith("/calendar/ical/")
    );
  } catch {
    return false;
  }
}

/** "20261215" o "20261215T150000Z" → "2026-12-15" */
function toDay(v: string): string | null {
  const m = v.match(/(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Convierte el texto .ics en la lista de noches ocupadas. */
export function parseIcs(text: string): string[] {
  // Las líneas largas vienen "plegadas": continúan en la siguiente con un espacio.
  const lines = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
  const nights = new Set<string>();
  let start: string | null = null;
  let end: string | null = null;
  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      start = end = null;
    } else if (line.startsWith("DTSTART")) {
      start = toDay(line.slice(line.indexOf(":") + 1));
    } else if (line.startsWith("DTEND")) {
      end = toDay(line.slice(line.indexOf(":") + 1));
    } else if (line.startsWith("END:VEVENT") && start) {
      // DTEND es el día de salida: esa noche ya no está ocupada.
      const last = end && end > start ? end : addDays(start, 1);
      for (let d = start, i = 0; d < last && i < MAX_DAYS; d = addDays(d, 1), i++) nights.add(d);
    }
  }
  return [...nights].sort();
}

export async function airbnbBusyNights(url: string): Promise<Availability | null> {
  if (!isAirbnbIcalUrl(url)) return null;
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "text/calendar" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes("BEGIN:VCALENDAR")) throw new Error("No es un calendario");
    const data: Availability = { busy: parseIcs(text), fetchedAt: new Date().toISOString() };
    cache.set(url, { at: Date.now(), data });
    return data;
  } catch (e) {
    console.error("[airbnb-calendar]", e instanceof Error ? e.message : e);
    // Si Airbnb no responde, usamos la última lectura aunque esté vencida.
    return hit?.data ?? null;
  }
}
