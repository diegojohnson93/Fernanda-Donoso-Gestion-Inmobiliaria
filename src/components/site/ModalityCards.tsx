/* eslint-disable @next/next/no-img-element */
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import type { CategoryInfo } from "./CategoryCards";

/**
 * Sección "¿Qué estás buscando?": pestañas + cuatro tarjetas con movimiento.
 * - Al hacer scroll las tarjetas suben una tras otra, revelándose desde abajo.
 * - Al pasar el mouse (por la tarjeta o su pestaña) la tarjeta se destaca,
 *   la foto crece y aparece un círculo "Ver" que sigue al cursor.
 */
export function ModalityCards({ items, total }: { items: CategoryInfo[]; total: number }) {
  const [active, setActive] = useState<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!grid.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-mcard]");
      gsap.fromTo(
        cards,
        { clipPath: "inset(100% 0% 0% 0%)", y: 80 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: grid.current, start: "top 82%", once: true },
        },
      );
      // Títulos verticales que se deslizan un poco al hacer scroll.
      cards.forEach((card, i) => {
        gsap.fromTo(
          card.querySelector("[data-mtitle]"),
          { yPercent: 18 + i * 4 },
          {
            yPercent: -6,
            ease: "none",
            scrollTrigger: { trigger: grid.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    }, grid);
    return () => ctx.revert();
  }, []);

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div>
      {/* Pestañas */}
      <div className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:mb-10 md:flex-wrap md:justify-center md:px-0">
        <Link
          href="#propiedades"
          className="flex shrink-0 items-center gap-2 border border-charcoal bg-charcoal px-4 py-2.5 text-sm text-white transition-colors duration-300 hover:bg-white hover:text-charcoal"
        >
          Todas <sup className="text-[10px] opacity-60">{total}</sup>
        </Link>
        {items.map(({ category: c, count }, i) => (
          <Link
            key={c.slug}
            href={`/propiedades/${c.slug}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            className={`flex shrink-0 items-center gap-2 border px-4 py-2.5 text-sm transition-colors duration-300 ${
              active === i ? "border-charcoal" : "border-charcoal/15"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full transition-transform duration-300 ${c.bg} ${active === i ? "scale-150" : ""}`}
            />
            {c.title}
            <sup className="text-[10px] text-stone">{count}</sup>
          </Link>
        ))}
      </div>

      {/* Tarjetas */}
      <div ref={grid} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {items.map(({ category: c, cover, count }, i) => {
          const isActive = active === i;
          const dim = active !== null && !isActive;
          return (
            <Link
              key={c.slug}
              href={`/propiedades/${c.slug}`}
              data-mcard
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onMouseMove={onMove}
              className={`group relative flex cursor-none flex-col overflow-hidden text-white transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
                dim ? "opacity-45 saturate-50" : ""
              } ${isActive ? "md:-translate-y-3" : ""}`}
            >
              <div className={`relative flex min-h-[192px] flex-1 flex-col justify-between p-4 md:min-h-[304px] md:p-5 ${c.bg}`}>
                <div className="flex items-start justify-between">
                  <span className="font-serif text-lg italic leading-none opacity-80">FD</span>
                  <span className="text-[11px] opacity-80">0{i + 1}</span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="relative min-w-0 text-[11px] leading-snug md:h-9 md:overflow-hidden md:text-xs">
                    <p className="opacity-90 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] md:whitespace-pre-line md:group-hover:-translate-y-full">
                      {c.description}
                    </p>
                    <p className="mt-2 font-medium transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] md:absolute md:inset-x-0 md:top-full md:mt-0 md:group-hover:-translate-y-full">
                      Ver {count} {count === 1 ? "propiedad" : "propiedades"} →
                    </p>
                  </div>
                  <h3
                    data-mtitle
                    className="vertical-title relative z-10 ml-auto font-serif text-[24px] font-normal leading-[0.9] drop-shadow-sm md:text-[40px]"
                  >
                    {c.title}
                  </h3>
                </div>
              </div>
              <div className={`relative h-[77px] overflow-hidden transition-[height] duration-700 ease-[cubic-bezier(.16,1,.3,1)] md:h-32 md:group-hover:h-44 ${c.bg}`}>
                {cover ? (
                  <img
                    src={cover}
                    alt=""
                    className="h-full w-full scale-110 object-cover opacity-[0.07] grayscale contrast-75 mix-blend-luminosity transition-[transform,opacity] duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-100 group-hover:opacity-[0.12]"
                  />
                ) : (
                  <div
                    className="h-full w-full opacity-30"
                    style={{
                      backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.35) 0 1px, transparent 1px 12px)",
                    }}
                  />
                )}
              </div>

              {/* Círculo "Ver" que sigue al cursor (solo en pantallas con mouse) */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 z-10 hidden h-20 w-20 scale-[0.4] place-items-center rounded-full bg-white text-xs font-medium text-charcoal opacity-0 transition-[opacity,scale] duration-300 group-hover:scale-100 group-hover:opacity-100 md:grid"
                style={{ translate: "calc(var(--mx, 50%) - 50%) calc(var(--my, 50%) - 50%)" }}
              >
                Ver
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
