"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, useLayoutEffect, useRef, useState, type ElementType, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Texto que sube desde una máscara, por líneas, palabras o letras
 * (el efecto de títulos de la referencia).
 */
export function SplitReveal({
  as: Tag = "div",
  children,
  className = "",
  type = "lines",
  delay = 0,
  on = "view",
  stagger,
  indent,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  type?: "lines" | "words" | "chars";
  delay?: number;
  on?: "view" | "load";
  stagger?: number;
  /** Sangría solo de la primera línea (p. ej. "22%"). */
  indent?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      el.dataset.ready = "true";
      return;
    }
    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = SplitText.create(el, {
        type: type === "chars" ? "words,chars" : type === "words" ? "words" : "lines",
        mask: type === "chars" ? "words" : type,
        autoSplit: type === "lines",
        onSplit(self) {
          el.dataset.ready = "true";
          // Holgura para que la máscara no corte acentos ni letras que bajan (¿, g, p).
          self.masks.forEach((m) => {
            (m as HTMLElement).style.padding = "0.14em 0.04em 0.18em";
            (m as HTMLElement).style.margin = "-0.14em -0.04em -0.18em";
          });
          const targets = type === "chars" ? self.chars : type === "words" ? self.words : self.lines;
          return gsap.from(targets, {
            yPercent: 110,
            duration: type === "chars" ? 1 : 1.15,
            ease: "expo.out",
            stagger: stagger ?? (type === "chars" ? 0.025 : type === "words" ? 0.04 : 0.09),
            delay: delay / 1000,
            scrollTrigger: on === "view" ? { trigger: el, start: "top 88%", once: true } : undefined,
          });
        },
      });
    }, el);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [type, delay, on, stagger]);

  return (
    <Tag ref={ref} data-split className={className}>
      {indent && <span aria-hidden className="inline-block" style={{ width: indent }} />}
      {children}
    </Tag>
  );
}

/** Texto que se escribe letra por letra, con cursor parpadeante. */
export function Typewriter({
  text,
  className = "",
  speed = 32,
  startDelay = 400,
  on = "view",
}: {
  text: string;
  className?: string;
  speed?: number;
  startDelay?: number;
  on?: "view" | "load";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      const t = setTimeout(() => {
        setCount(text.length);
        setDone(true);
      }, 0);
      return () => clearTimeout(t);
    }
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    const tick = () => {
      i += 1;
      setCount(i);
      if (i < text.length) {
        const ch = text[i - 1];
        timer = setTimeout(tick, /[.,:;\n]/.test(ch) ? speed * 8 : speed + Math.random() * speed * 0.6);
      } else setDone(true);
    };
    const start = () => (timer = setTimeout(tick, startDelay));
    if (on === "load") {
      start();
      return () => clearTimeout(timer);
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        start();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [text, speed, startDelay, on]);

  return (
    <span ref={ref} className={`relative inline-block ${className}`} aria-label={text}>
      {/* Reserva el espacio del texto completo para que nada salte. */}
      <span aria-hidden className="invisible whitespace-pre-line">
        {text}
      </span>
      <span aria-hidden className="absolute inset-0 whitespace-pre-line">
        {text.slice(0, count)}
        <span
          className={`-mr-[3px] ml-[1px] inline-block w-[2px] translate-y-[0.12em] bg-current align-baseline ${
            done ? "animate-[blink_1s_steps(1)_infinite]" : ""
          }`}
          style={{ height: "1em" }}
        />
      </span>
    </span>
  );
}

/** Número que cuenta hasta su valor al entrar en pantalla ("+3 años" → 0…3). */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const match = value.match(/^(\D*)(\d+)(.*)$/);
    if (!el || !match || reduced()) return;
    const target = Number(match[2]);
    const obj = { n: 0 };
    const t = gsap.to(obj, {
      n: target,
      duration: 1.6,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = `${match[1]}${Math.round(obj.n)}${match[3]}`;
      },
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
    return () => {
      t.scrollTrigger?.kill();
      t.kill();
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
