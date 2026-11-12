"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/** Aparece suavemente (sube y se aclara) cuando entra en pantalla. */
export function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.shown = "true";
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.shown = "true";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`translate-y-8 opacity-0 transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(.16,1,.3,1)] data-[shown=true]:translate-y-0 data-[shown=true]:opacity-100 ${className}`}
    >
      {children}
    </Tag>
  );
}
