/* eslint-disable @next/next/no-img-element */
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

/** Foto que se revela desde abajo al entrar en pantalla, con un leve acercamiento. */
export function ImageReveal({
  src,
  alt,
  className = "",
  position = "50% 50%",
}: {
  src: string;
  alt: string;
  className?: string;
  position?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!wrap.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: wrap.current, start: "top 85%", once: true } });
      tl.fromTo(wrap.current, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out" })
        .fromTo(wrap.current!.querySelector("img"), { scale: 1.2 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0);
    }, wrap);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrap} className={`overflow-hidden bg-beige ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" style={{ objectPosition: position }} />
    </div>
  );
}
