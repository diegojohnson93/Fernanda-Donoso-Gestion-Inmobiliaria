"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor elegante para pantallas con mouse: un punto y un anillo fino que lo
 * sigue con suavidad. Crece sobre enlaces y botones, hace un pulso al hacer
 * clic y se oculta sobre las tarjetas de modalidad (que tienen su propio "Ver")
 * y sobre los campos de texto (donde vuelve el cursor normal).
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("has-cursor");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    let state: "idle" | "link" | "hidden" = "hidden";
    let pressed = false;
    let raf = 0;
    let scale = 1;
    let dotScale = 1;

    const apply = () => {
      const d = dot.current;
      const r = ring.current;
      if (!d || !r) return;
      const targetScale = pressed ? 0.75 : state === "link" ? 1.9 : 1;
      scale += (targetScale - scale) * 0.18;
      dotScale += ((state === "link" ? 0 : 1) - dotScale) * 0.25;
      d.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${dotScale})`;
      r.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      d.style.opacity = r.style.opacity = state === "hidden" ? "0" : "1";
      r.style.backgroundColor = state === "link" ? "rgba(255,255,255,0.18)" : "transparent";
    };

    const loop = () => {
      const k = reduce ? 1 : 0.16;
      ringPos.x += (pos.x - ringPos.x) * k;
      ringPos.y += (pos.y - ringPos.y) * k;
      apply();
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [data-mcard]")) state = "hidden";
      else if (t.closest("a, button, label, [role='button']")) state = "link";
      else state = "idle";
      if (ringPos.x === window.innerWidth / 2 && state !== "hidden") {
        ringPos.x = pos.x;
        ringPos.y = pos.y;
      }
    };
    const onLeave = () => (state = "hidden");
    const onDown = () => (pressed = true);
    const onUp = () => (pressed = false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[95] h-9 w-9 rounded-full border border-white opacity-0 mix-blend-difference transition-[background-color,opacity] duration-300 will-change-transform"
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[96] h-1.5 w-1.5 rounded-full bg-white opacity-0 mix-blend-difference transition-opacity duration-300 will-change-transform"
      />
    </>
  );
}
