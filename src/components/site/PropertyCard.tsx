/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Modality } from "@/lib/ficha";
import { factsLine, priceFor, type PublicProperty } from "@/lib/public";
import { categoryFor } from "@/lib/site";

export function PropertyCard({
  p,
  modality,
  className = "",
  aspect = "aspect-[4/5]",
}: {
  p: PublicProperty;
  /** Modalidad a destacar (en la página de cada modalidad). */
  modality?: Modality;
  className?: string;
  aspect?: string;
}) {
  const shown = modality ? [modality] : p.modalities;
  return (
    <Link href={`/propiedad/${p.slug}`} className={`group block ${className}`}>
      <div className={`relative overflow-hidden bg-beige ${aspect}`}>
        {p.photos[0] ? (
          <img
            src={p.photos[0].url}
            alt={p.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-cream/80">
            <svg viewBox="0 0 48 60" className="h-16 w-14" fill="none" aria-hidden>
              <path d="M5 58V25a19 19 0 0 1 38 0v33" stroke="currentColor" strokeWidth="1" />
              <path d="M1 58h46" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        )}
        <span className="absolute left-3 top-3 bg-cream/90 px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-charcoal">
          {p.code}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
        {p.modalities.map((m) => (
          <span key={m} className="eyebrow !text-[9.5px] text-stone">
            {categoryFor(m).title}
          </span>
        ))}
      </div>
      <h3 className="mt-1.5 font-serif text-[26px] font-normal leading-tight">{p.title}</h3>
      <p className="mt-1 text-sm text-stone">
        {[p.sector, factsLine(p)].filter(Boolean).join(" · ")}
      </p>
      <div className="mt-2 space-y-0.5 text-sm">
        {shown.map((m) => (
          <p key={m}>
            {!modality && p.modalities.length > 1 && (
              <span className="text-stone">{categoryFor(m).title}: </span>
            )}
            <span className="font-medium">{priceFor(p, m)}</span>
          </p>
        ))}
      </div>
    </Link>
  );
}
