"use client";

import gsap from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SITE, whatsappLink } from "@/lib/site";
import { CategoryCards, type CategoryInfo } from "./CategoryCards";

/**
 * Envoltura de la web pública.
 * El botón "Propiedades" (abajo a la derecha) hace retroceder la página y
 * despliega las cuatro modalidades, como en la referencia.
 */
export function SiteShell({ categories, children }: { categories: CategoryInfo[]; children: ReactNode }) {
  const [selection, setSelection] = useState(false);
  const [menu, setMenu] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Al navegar se cierra todo.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setSelection(false);
    setMenu(false);
  }

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (selection) {
      page.style.setProperty("--sy", `${window.scrollY}px`);
      document.documentElement.style.overflow = "hidden";
      if (!reduce && cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.querySelectorAll("[data-card]"),
          { y: -60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: "expo.out", delay: 0.1 },
        );
      }
    } else {
      document.documentElement.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelection(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selection]);

  return (
    <div className={`site relative min-h-full ${selection ? "bg-sand" : "bg-cream"}`}>
      {/* Capa de modalidades */}
      <div
        className={`fixed inset-x-0 top-0 z-40 px-4 pt-4 transition-opacity duration-500 md:px-12 md:pt-12 ${
          selection ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!selection}
      >
        <div ref={cardsRef} className="mx-auto max-w-[1340px]">
          <CategoryCards items={categories} compact onNavigate={() => setSelection(false)} />
        </div>
      </div>
      {selection && (
        <button
          aria-label="Cerrar propiedades"
          className="fixed inset-0 z-30 cursor-zoom-out"
          onClick={() => setSelection(false)}
        />
      )}

      {/* Página */}
      <div
        ref={pageRef}
        className={`relative z-10 min-h-screen bg-cream [--shift:52vh] md:[--shift:68vh] transition-transform duration-[900ms] ease-[cubic-bezier(.7,0,.2,1)] ${
          selection ? "pointer-events-none overflow-hidden rounded-sm shadow-2xl" : ""
        }`}
        style={
          selection
            ? {
                transformOrigin: "50% var(--sy)",
                transform: "translateY(var(--shift, 66vh)) scale(0.46)",
              }
            : undefined
        }
      >
        {children}
      </div>

      {/* Controles fijos */}
      <div className="fixed bottom-4 right-4 z-50 flex items-end gap-2 md:bottom-8 md:right-12">
        {menu && (
          <nav className="absolute bottom-14 right-0 w-60 border border-charcoal/15 bg-cream p-5 shadow-xl">
            <ul className="space-y-2.5 font-serif text-2xl">
              <li><Link href="/">Inicio</Link></li>
              <li>
                <button onClick={() => { setMenu(false); setSelection(true); }}>Propiedades</button>
              </li>
              <li><Link href="/#asesoria" onClick={() => setMenu(false)}>Asesoría gratuita</Link></li>
              <li><Link href="/propietarios">Propietarios</Link></li>
              <li><Link href="/#nosotros" onClick={() => setMenu(false)}>Nosotros</Link></li>
              <li><Link href="/#contacto" onClick={() => setMenu(false)}>Contacto</Link></li>
            </ul>
            <a
              href={whatsappLink(SITE.advisoryWhatsapp)}
              target="_blank"
              rel="noreferrer"
              className="mt-5 block border-t border-charcoal/10 pt-4 text-sm"
            >
              WhatsApp · {SITE.whatsappDisplay}
            </a>
          </nav>
        )}
        <button
          onClick={() => { setMenu(false); setSelection((v) => !v); }}
          className="flex h-11 items-center gap-3 border border-charcoal/30 bg-cream/90 px-5 text-sm font-medium text-charcoal backdrop-blur transition hover:bg-cream"
        >
          {selection ? "Cerrar" : "Propiedades"}
          {selection ? (
            <span aria-hidden className="text-base leading-none">×</span>
          ) : (
            <span aria-hidden className="grid grid-cols-2 gap-[3px]">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="h-[3px] w-[3px] bg-current" />
              ))}
            </span>
          )}
        </button>
        <button
          aria-label="Menú"
          onClick={() => { setSelection(false); setMenu((v) => !v); }}
          className="grid h-11 w-11 place-items-center bg-charcoal text-cream ring-1 ring-cream/25"
        >
          <span aria-hidden className="flex flex-col items-start gap-[5px]">
            <span className={`block h-px bg-current transition-all ${menu ? "w-4 translate-y-[3px] rotate-45" : "w-4"}`} />
            <span className={`block h-px bg-current transition-all ${menu ? "w-4 -translate-y-[3px] -rotate-45" : "w-2.5"}`} />
          </span>
        </button>
      </div>
    </div>
  );
}
