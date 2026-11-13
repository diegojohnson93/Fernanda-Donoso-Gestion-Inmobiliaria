/* eslint-disable @next/next/no-img-element */
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

/** Foto que parte pequeña y crece hasta ocupar todo el ancho al hacer scroll. */
export function ScaleImage({ src, alt = "", fallbackBg = "bg-beige" }: { src: string | null; alt?: string; fallbackBg?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!wrap.current || !box.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        box.current,
        { clipPath: "inset(18% 27% 18% 27%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: wrap.current, start: "top top", end: "+=120%", scrub: true, pin: true },
        },
      );
      gsap.fromTo(
        box.current!.querySelector("img"),
        { scale: 1.25 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: wrap.current, start: "top top", end: "+=120%", scrub: true },
        },
      );
    }, wrap);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrap} className="relative h-screen w-full overflow-hidden">
      <div
        ref={box}
        className={`absolute inset-0 ${fallbackBg}`}
        style={{ clipPath: "inset(18% 27% 18% 27%)" }}
      >
        {src ? (
          <img src={src} alt={alt} className="photo-tone h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(160deg, #d8ccbc 0%, #a8977f 55%, #7b7168 100%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
