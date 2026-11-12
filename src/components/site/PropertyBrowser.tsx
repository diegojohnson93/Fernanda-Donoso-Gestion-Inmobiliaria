"use client";

import Link from "next/link";
import { useState } from "react";
import type { Modality } from "@/lib/ficha";
import type { PublicProperty } from "@/lib/public";
import { CATEGORIES, SITE, whatsappLink } from "@/lib/site";
import { BuyIntentPrompt } from "./BuyIntent";
import { PropertyCard } from "./PropertyCard";

/** Propiedades disponibles con filtro por modalidad (primera sección de la portada). */
export function PropertyBrowser({ properties }: { properties: PublicProperty[] }) {
  const [filter, setFilter] = useState<Modality | "todas">("todas");
  const counts = Object.fromEntries(
    CATEGORIES.map((c) => [c.modality, properties.filter((p) => p.modalities.includes(c.modality)).length]),
  );
  const list = properties.filter((p) => filter === "todas" || p.modalities.includes(filter));
  const cat = CATEGORIES.find((c) => c.modality === filter);

  return (
    <div>
      <div className="-mx-5 mb-12 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {(["todas", ...CATEGORIES.map((c) => c.modality)] as const).map((m) => {
          const c = CATEGORIES.find((x) => x.modality === m);
          const active = filter === m;
          const n = m === "todas" ? properties.length : counts[m];
          return (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`group flex shrink-0 items-center gap-2 border px-4 py-2.5 text-sm transition-colors duration-300 ${
                active ? "border-charcoal bg-charcoal text-white" : "border-charcoal/15 hover:border-charcoal"
              }`}
            >
              {c && <span className={`h-2 w-2 rounded-full ${c.bg} ${active ? "ring-1 ring-white" : ""}`} />}
              {m === "todas" ? "Todas" : c!.title}
              <sup className={`text-[10px] ${active ? "text-white/60" : "text-stone"}`}>{n}</sup>
            </button>
          );
        })}
      </div>

      {filter === "venta" && (
        <div className="mb-14">
          <BuyIntentPrompt />
        </div>
      )}

      {list.length ? (
        <div key={filter} className="grid animate-[fadeUp_.7s_cubic-bezier(.16,1,.3,1)] gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <PropertyCard key={p.slug} p={p} modality={filter === "todas" ? undefined : filter} />
          ))}
        </div>
      ) : (
        <div className="border-y border-charcoal/10 py-16 text-center">
          <p className="font-serif text-3xl md:text-4xl">Pronto publicaremos nuevas propiedades{cat ? ` en ${cat.title}` : ""}</p>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-graphite">
            Cuéntanos qué buscas y te avisamos apenas tengamos algo para ti.
          </p>
          <a
            href={whatsappLink(SITE.advisoryWhatsapp)}
            target="_blank"
            rel="noreferrer"
            className="eyebrow mt-8 inline-flex h-12 items-center border border-charcoal px-7 transition hover:bg-charcoal hover:text-white"
          >
            Escribir por WhatsApp
          </a>
        </div>
      )}

      {cat && list.length > 0 && (
        <div className="mt-14 text-center">
          <Link href={`/propiedades/${cat.slug}`} className="eyebrow border-b border-charcoal pb-1">
            Ver todo en {cat.title}
          </Link>
        </div>
      )}
    </div>
  );
}
