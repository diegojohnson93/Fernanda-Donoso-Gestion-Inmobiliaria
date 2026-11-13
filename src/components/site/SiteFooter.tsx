import Link from "next/link";
import { CATEGORIES, SITE, whatsappLink } from "@/lib/site";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="bg-charcoal px-5 pb-28 pt-16 text-sand md:px-12 md:pb-16">
      <div className="mx-auto grid max-w-[1340px] gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo align="left" />
          <p className="mt-5 max-w-xs text-sm text-sand/70">
            Arriendos y ventas en {SITE.zone}.
          </p>
        </div>
        <div>
          <p className="eyebrow text-sand/50">Propiedades</p>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/propiedades/${c.slug}`} className="hover:text-cream">
                  {c.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/propietarios" className="hover:text-cream">
                Propietarios
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-sand/50">Contacto</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={whatsappLink("Hola Fernanda, quiero hacer una consulta")} target="_blank" rel="noreferrer" className="hover:text-cream">
                WhatsApp {SITE.whatsappDisplay}
              </a>
            </li>
            {SITE.email && (
              <li>
                <a href={`mailto:${SITE.email}`} className="hover:text-cream">
                  {SITE.email}
                </a>
              </li>
            )}
            {SITE.instagram && (
              <li>
                <a href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noreferrer" className="hover:text-cream">
                  @{SITE.instagram}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-[1340px] flex-wrap justify-between gap-3 border-t border-sand/15 pt-6 text-xs text-sand/50">
        <span>
          © {new Date().getFullYear()} {SITE.name} {SITE.tagline}
        </span>
        <span className="flex gap-5">
          <Link href="/privacidad" className="hover:text-sand">
            Privacidad
          </Link>
          <Link href="/admin" className="hover:text-sand">
            Acceso
          </Link>
        </span>
      </div>
    </footer>
  );
}
