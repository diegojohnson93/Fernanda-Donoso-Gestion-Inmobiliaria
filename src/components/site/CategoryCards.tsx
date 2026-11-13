/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Category } from "@/lib/site";

export interface CategoryInfo {
  category: Category;
  cover: string | null;
  count: number;
}

/** Las cuatro tarjetas de modalidad (portada y menú "Propiedades"). */
export function CategoryCards({
  items,
  onNavigate,
  compact = false,
}: {
  items: CategoryInfo[];
  onNavigate?: () => void;
  compact?: boolean;
}) {
  return (
    <>
      {compact && (
        <div className="space-y-2 md:hidden">
          {items.map(({ category: c, cover, count }) => (
            <Link
              key={c.slug}
              href={`/propiedades/${c.slug}`}
              onClick={onNavigate}
              data-card
              className={`flex h-[76px] items-stretch overflow-hidden text-cream ${c.bg}`}
            >
              <div className="flex flex-1 flex-col justify-center px-4">
                <span className="font-serif text-[28px] leading-none">
                  {c.title}
                </span>
                <span className="mt-1 text-[11px] opacity-80">
                  {count} {count === 1 ? "propiedad" : "propiedades"}
                </span>
              </div>
              { }
              {cover && <img src={cover} alt="" className="w-24 object-cover opacity-[0.12] grayscale contrast-75 mix-blend-luminosity" />}
            </Link>
          ))}
        </div>
      )}
      <div className={`grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5 ${compact ? "hidden md:grid" : ""}`}>
        {items.map(({ category: c, cover, count }) => (
          <Link
            key={c.slug}
            href={`/propiedades/${c.slug}`}
            onClick={onNavigate}
            data-card
            className="group relative flex flex-col overflow-hidden text-cream"
          >
            <div
              className={`relative flex flex-1 flex-col justify-between p-4 md:p-5 ${c.bg} ${
                compact ? "min-h-[170px] md:min-h-[300px]" : "min-h-[240px] md:min-h-[380px]"
              }`}
            >
              <span className="font-serif text-lg italic leading-none opacity-80">FD</span>
              <div className="flex items-end justify-between gap-2">
                <p
                  className={`whitespace-pre-line text-[11px] leading-snug opacity-90 md:text-xs ${compact ? "hidden md:block" : ""}`}
                >
                  {c.description}
                </p>
                <h3
                  className={`vertical-title ml-auto font-serif font-normal leading-[0.9] transition-transform duration-500 group-hover:-translate-y-1 md:text-[52px] ${
                    compact ? "text-[26px]" : "text-[32px]"
                  }`}
                >
                  {c.title}
                  </h3>
              </div>
            </div>
            <div className={`relative overflow-hidden ${compact ? "h-16 md:h-28" : "h-24 md:h-40"} ${c.bg}`}>
              {cover ? (
                <img
                  src={cover}
                  alt=""
                  className="h-full w-full object-cover opacity-[0.07] grayscale contrast-75 mix-blend-luminosity transition-[transform,opacity] duration-700 group-hover:scale-105 group-hover:opacity-[0.12]"
                />
              ) : (
                <div
                  className="h-full w-full opacity-30"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, rgba(255,255,255,.35) 0 1px, transparent 1px 12px)",
                  }}
                />
              )}
              <span className="absolute bottom-2 right-2 rounded-full bg-cream/90 px-2 py-0.5 text-[10px] font-semibold text-charcoal">
                {count} {count === 1 ? "propiedad" : "propiedades"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
