import Link from "next/link";
import { Logo } from "./Logo";

/** Encabezado: Nosotros · logo · Contacto. `tone` según el fondo de la página. */
export function SiteHeader({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const color = tone === "light" ? "text-cream" : "text-charcoal";
  return (
    <header className={`relative z-20 grid grid-cols-[1fr_auto_1fr] items-center px-5 py-5 md:px-12 md:py-8 ${color}`}>
      <Link href="/nosotros" className="hidden justify-self-start text-sm font-medium hover:opacity-70 md:block">
        Nosotros
      </Link>
      <Link href="/" aria-label="Fernanda Donoso, inicio" className="col-start-2">
        <Logo />
      </Link>
      <Link href="/#contacto" className="hidden justify-self-end text-sm font-medium hover:opacity-70 md:block">
        Contacto
      </Link>
    </header>
  );
}
