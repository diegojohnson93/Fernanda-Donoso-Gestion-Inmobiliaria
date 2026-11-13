/* eslint-disable @next/next/no-img-element */
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Portada de cada modalidad: texto gigante que se desliza con una foto en un
 * cuadrado al centro. Al hacer scroll la foto crece de forma fluida hasta
 * ocupar toda la pantalla (como en la referencia).
 */
export function ExpandHero({
  text,
  image,
  imageAlt = "",
  imagePosition = "50% 50%",
  bg,
  header,
  children,
}: {
  text: string;
  image: string;
  imageAlt?: string;
  imagePosition?: string;
  bg: string;
  header: ReactNode;
  children?: ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const square = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const lead = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const s = section.current;
    const sq = square.current;
    const ph = photo.current;
    if (!s || !sq || !ph) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    // Posición del cuadrado relativa a la sección (sin transformaciones del pin).
    const rect = () => {
      const a = sq.getBoundingClientRect();
      const b = s.getBoundingClientRect();
      return { left: a.left - b.left, top: a.top - b.top, width: a.width, height: a.height };
    };

    const ctx = gsap.context(() => {
      gsap.set(ph, { ...rect(), autoAlpha: 1 });
      gsap.set(sq, { autoAlpha: 0 });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: s,
          start: "top top",
          end: "+=110%",
          scrub: 0.6,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo(ph, { left: () => rect().left, top: () => rect().top, width: () => rect().width, height: () => rect().height },
        { left: 0, top: 0, width: () => s.clientWidth, height: () => s.clientHeight, ease: "power1.inOut" }, 0)
        .fromTo(ph.querySelector("img"), { scale: 1.08 }, { scale: 1, ease: "power1.inOut" }, 0);
      if (lead.current) tl.to(lead.current, { autoAlpha: 0, y: -30, duration: 0.35 }, 0);
    }, s);
    return () => ctx.revert();
  }, []);

  const item = (
    <span className="flex shrink-0 items-center whitespace-nowrap">
      <span className="px-[0.18em]">{text}</span>
      <span className="px-[0.18em] text-[0.35em] opacity-60" aria-hidden>
        ✦
      </span>
    </span>
  );

  return (
    <section ref={section} className={`relative flex h-[100svh] min-h-[560px] flex-col overflow-hidden ${bg} text-cream`}>
      <div className="relative z-20">{header}</div>
      <div className="flex flex-1 flex-col justify-center">
        <div className="relative flex h-[46vh] min-h-[260px] items-center overflow-hidden md:h-[52vh]">
          <div className="marquee-track flex w-max font-serif text-[23vw] font-light leading-none tracking-[-0.02em] text-cream md:text-[15vw]" aria-hidden>
            {item}
            {item}
            {item}
            {item}
          </div>
          <span className="sr-only">{text}</span>
          {/* Cuadrado de referencia (y versión sin JavaScript). */}
          <div
            ref={square}
            className="absolute left-1/2 top-1/2 aspect-square w-[42vw] max-w-[260px] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-cream/15 md:w-[17vw]"
          >
            <img src={image} alt={imageAlt} className="h-full w-full object-cover" style={{ objectPosition: imagePosition }} />
          </div>
        </div>
        <div ref={lead} className="px-5 pb-24 text-center md:pb-14">
          {children}
        </div>
      </div>
      {/* Foto que crece hasta llenar la pantalla. */}
      <div ref={photo} className="invisible absolute z-10 overflow-hidden" aria-hidden>
        <img src={image} alt="" className="h-full w-full object-cover" style={{ objectPosition: imagePosition }} />
      </div>
    </section>
  );
}
