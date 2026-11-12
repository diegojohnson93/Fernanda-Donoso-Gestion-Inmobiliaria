"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

/**
 * Cambia suavemente el fondo de la página al hacer scroll:
 * blanco en la portada y beige a medida que se baja.
 */
export function ScrollBg({ trigger, from, to }: { trigger: string; from: string; to: string }) {
  useEffect(() => {
    const page = document.getElementById("page");
    const el = document.querySelector(trigger);
    if (!page || !el) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      page.style.backgroundColor = from;
      return;
    }
    const tween = gsap.fromTo(
      page,
      { backgroundColor: from },
      {
        backgroundColor: to,
        ease: "none",
        scrollTrigger: { trigger: el, start: "bottom 85%", end: "bottom 15%", scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      page.style.backgroundColor = "";
    };
  }, [trigger, from, to]);
  return null;
}
