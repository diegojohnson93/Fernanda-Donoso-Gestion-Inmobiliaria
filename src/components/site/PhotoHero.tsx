/* eslint-disable @next/next/no-img-element */
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { MarqueeDot } from "./Marquee";

/**
 * Portada a pantalla completa: foto de borde a borde, título gigante en blanco
 * que se desliza y texto abajo. Al hacer scroll la foto se aleja un poco y el
 * título sube más lento (profundidad), sin fijar la sección.
 */
export function PhotoHero({
  text,
  image,
  imageAlt = "",
  imagePosition = "50% 50%",
  header,
  children,
}: {
  text: string;
  image: string;
  imageAlt?: string;
  imagePosition?: string;
  header: ReactNode;
  children?: ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const s = section.current;
    if (!s || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const st = { trigger: s, start: "top top", end: "bottom top", scrub: true };
      gsap.fromTo(img.current, { scale: 1.12, yPercent: 0 }, { scale: 1, yPercent: 12, ease: "none", scrollTrigger: st });
      gsap.to(title.current, { yPercent: 60, ease: "none", scrollTrigger: st });
      gsap.to(bottom.current, { autoAlpha: 0, y: -40, ease: "none", scrollTrigger: { ...st, end: "40% top" } });
    }, s);
    return () => ctx.revert();
  }, []);

  const item = (
    <span className="flex shrink-0 items-center whitespace-nowrap">
      <span className="px-[0.18em]">{text}</span>
      <MarqueeDot />
    </span>
  );

  return (
    <section ref={section} className="relative flex h-[100svh] min-h-[560px] flex-col overflow-hidden bg-charcoal text-white">
      {/* Movimiento lento continuo (zoom + desplazamiento lateral) */}
      <div className="ken-burns absolute inset-0">
        <img
          ref={img}
          src={image}
          alt={imageAlt}
          className="photo-tone absolute inset-0 h-full w-full origin-center object-cover"
          style={{ objectPosition: imagePosition }}
        />
      </div>
      <PhotoToneLayers />
      <div className="relative z-10">{header}</div>
      <div ref={title} className="relative flex flex-1 items-center">
        <div className="w-full overflow-hidden">
          <div
            className="marquee-track flex w-max font-serif text-[23vw] font-light leading-none tracking-[-0.02em] drop-shadow-[0_2px_24px_rgba(0,0,0,0.18)] md:text-[15vw]"
            aria-hidden
          >
            {item}
            {item}
            {item}
            {item}
          </div>
          <h1 className="sr-only">{text}</h1>
        </div>
      </div>
      <div ref={bottom} className="relative px-5 pb-24 text-center md:pb-14">
        {children}
      </div>
    </section>
  );
}

/**
 * Capas que unifican las fotos en tonos beige y oscurecen lo justo para que el
 * texto mande sobre la imagen. Se usa en todas las portadas.
 */
export function PhotoToneLayers() {
  return (
    <>
      {/* Tinte beige: lleva todas las fotos a la misma familia de color */}
      <div aria-hidden className="absolute inset-0 bg-[#a58b6c] opacity-30 mix-blend-color" />
      {/* Velo cálido oscuro para dar contraste al texto blanco */}
      <div aria-hidden className="absolute inset-0 bg-[#2d2620] opacity-30" />
      {/* Degradados arriba (menú) y abajo (bajada) */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#2d2620]/40 via-transparent to-[#2d2620]/60" />
    </>
  );
}
