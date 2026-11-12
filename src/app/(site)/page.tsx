import Link from "next/link";
import { CategoryCards } from "@/components/site/CategoryCards";
import { ContactForm } from "@/components/site/Forms";
import { MarqueeHero } from "@/components/site/Marquee";
import { Parallax } from "@/components/site/Parallax";
import { PropertyCard } from "@/components/site/PropertyCard";
import { Reveal } from "@/components/site/Reveal";
import { ScaleImage } from "@/components/site/ScaleImage";
import { ScrollBg } from "@/components/site/ScrollBg";
import { ScrollText } from "@/components/site/ScrollText";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublishedProperties } from "@/lib/public";
import { CATEGORIES, SITE, whatsappLink } from "@/lib/site";

const button =
  "eyebrow inline-flex h-12 items-center justify-center border px-7 transition";

export default async function Home() {
  const properties = await getPublishedProperties();
  const withPhotos = properties.filter((p) => p.photos.length);
  // Destacadas primero; si son menos de 3, se completa con otras publicadas.
  const featured = [...properties.filter((p) => p.featured), ...properties.filter((p) => !p.featured)].slice(
    0,
    Math.max(3, properties.filter((p) => p.featured).length),
  ).slice(0, 6);
  const heroImage = withPhotos.find((p) => p.featured)?.photos[0].url ?? withPhotos[0]?.photos[0].url ?? null;
  const bigImage =
    withPhotos.find((p) => p.featured)?.photos[1]?.url ?? withPhotos[1]?.photos[0].url ?? heroImage;

  const categories = CATEGORIES.map((category) => {
    const list = properties.filter((p) => p.modalities.includes(category.modality));
    return { category, count: list.length, cover: list.find((p) => p.photos[0])?.photos[0].url ?? null };
  });

  return (
    <>
      {/* Portada en blanco; el fondo pasa a beige al bajar */}
      <ScrollBg trigger="#portada" from="#ffffff" to="#f5f1ea" />
      <section id="portada" className="relative flex min-h-[100svh] flex-col">
        <SiteHeader />
        <div className="flex flex-1 flex-col justify-center">
          <MarqueeHero text={SITE.hero.marquee} image={heroImage} />
          <div className="px-5 pb-24 text-center md:pb-14">
            <p className="mx-auto max-w-xl whitespace-pre-line text-[15px] font-medium leading-relaxed md:text-[17px]">
              {SITE.hero.lead}
            </p>
            <a
              href={whatsappLink(SITE.advisoryWhatsapp)}
              target="_blank"
              rel="noreferrer"
              className="eyebrow mx-auto mt-5 inline-block border border-charcoal/70 px-3 py-1.5 !text-[9.5px] transition hover:bg-charcoal hover:text-cream"
            >
              {SITE.hero.badge} →
            </a>
          </div>
        </div>
        <p className="absolute bottom-10 left-12 hidden text-xs text-stone md:block">(Scroll)</p>
      </section>

      {/* Foto que crece */}
      <ScaleImage src={bigImage} />

      {/* Declaración */}
      <section className="px-5 pb-10 pt-28 md:px-12 md:pt-40">
        <ScrollText
          text={SITE.statement}
          className="mx-auto max-w-[1180px] text-[28px] font-medium leading-[1.14] tracking-[-0.015em] md:text-[54px]"
        />
      </section>

      {/* Mucho más que una corredora */}
      <section className="px-5 py-28 md:px-12 md:py-40">
        <div className="mx-auto max-w-[1240px]">
          <div className="text-center">
            <Reveal>
              <div className="mx-auto mb-10 h-14 w-px bg-charcoal/30" />
            </Reveal>
            <Reveal as="p" className="eyebrow text-stone">
              {SITE.tagline}
            </Reveal>
            <Reveal as="h2" delay={60} className="mx-auto mt-4 max-w-3xl font-serif text-[48px] font-light leading-[1] md:text-[84px]">
              {SITE.intro.title}
            </Reveal>
            <Reveal as="p" delay={150} className="mx-auto mt-8 max-w-xl text-[15px] leading-relaxed text-graphite">
              {SITE.intro.text}
            </Reveal>
          </div>
          <div className="mt-20 grid border-t border-charcoal/15 sm:grid-cols-2 lg:grid-cols-4">
            {SITE.value.items.map((it, i) => (
              <Reveal key={it.title} delay={i * 90} className="border-b border-charcoal/15 py-7 sm:px-7 md:py-8 lg:border-b-0 lg:border-r lg:last:border-r-0">
                <span className="font-serif text-lg italic text-taupe">0{i + 1}</span>
                <h3 className="mt-6 font-serif text-[28px] leading-tight">{it.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{it.text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal as="p" delay={200} className="mt-6 text-center text-xs text-stone">
            {SITE.value.note} Recibes mucho más.
          </Reveal>
        </div>
      </section>

      {/* Asesoría gratuita */}
      <section id="asesoria" className="scroll-mt-10 bg-sand px-5 py-28 md:px-12 md:py-40">
        <div className="mx-auto grid max-w-[1240px] gap-16 md:grid-cols-[1fr_1.05fr] md:gap-24">
          <div className="md:sticky md:top-24 md:self-start">
            <Reveal as="p" className="eyebrow text-stone">
              {SITE.advisory.eyebrow}
            </Reveal>
            <Reveal as="h2" delay={60} className="mt-4 font-serif text-5xl font-light leading-[1.02] md:text-7xl">
              {SITE.advisory.title}
            </Reveal>
            <Reveal as="p" delay={140} className="mt-7 max-w-md text-[15px] leading-relaxed text-graphite">
              {SITE.advisory.text}
            </Reveal>
            <Reveal delay={200} className="mt-7 flex flex-wrap gap-2">
              {SITE.advisory.factors.map((f) => (
                <span key={f} className="border border-charcoal/25 px-3 py-1.5 text-xs">
                  {f}
                </span>
              ))}
            </Reveal>
            <Reveal delay={260}>
              <a
                href={whatsappLink(SITE.advisoryWhatsapp)}
                target="_blank"
                rel="noreferrer"
                className={`${button} mt-10 border-charcoal bg-charcoal text-cream hover:bg-graphite`}
              >
                Agenda tu asesoría gratuita
              </a>
            </Reveal>
          </div>
          <ol className="border-t border-charcoal/15">
            {SITE.advisory.steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 80} className="flex gap-6 border-b border-charcoal/15 py-8 md:gap-10 md:py-10">
                <span className="font-serif text-6xl font-light leading-none text-taupe md:text-7xl">{i + 1}</span>
                <div className="pt-1">
                  <h3 className="font-serif text-3xl">{s.title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-graphite">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Modalidades */}
      <section className="px-5 py-28 md:px-12 md:py-40">
        <div className="mx-auto max-w-[1340px]">
          <Reveal className="mb-8 flex items-end justify-between gap-6 md:mb-12">
            <h2 className="font-serif text-4xl font-light md:text-6xl">¿Qué estás buscando?</h2>
            <p className="hidden max-w-xs text-sm text-stone md:block">
              Elige una modalidad y te mostramos las propiedades disponibles.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <CategoryCards items={categories} />
          </Reveal>
        </div>
      </section>

      {/* Destacadas */}
      {featured.length > 0 && (
        <section className="overflow-hidden bg-sand px-5 py-28 md:px-12 md:py-40">
          <div className="mx-auto max-w-[1340px]">
            <Reveal className="mb-14 text-center md:mb-20">
              <p className="eyebrow text-stone">Selección</p>
              <h2 className="mt-3 font-serif text-5xl font-light md:text-7xl">Propiedades destacadas</h2>
            </Reveal>
            <Parallax className="grid gap-14 md:grid-cols-3 md:gap-8">
              {featured.map((p, i) => (
                <div key={p.slug} data-speed={[0.2, -0.15, 0.35][i % 3]} className={i % 3 === 1 ? "md:mt-24" : ""}>
                  <Reveal delay={(i % 3) * 120}>
                    <PropertyCard p={p} />
                  </Reveal>
                </div>
              ))}
            </Parallax>
          </div>
        </section>
      )}

      {/* Inversión */}
      <section className="bg-charcoal px-5 py-28 text-sand md:px-12 md:py-44">
        <div className="mx-auto max-w-[1100px]">
          <Reveal as="p" className="eyebrow text-sand/55">
            {SITE.invest.eyebrow}
          </Reveal>
          <Reveal as="blockquote" delay={80} className="mt-6 font-serif text-[40px] font-light italic leading-[1.08] md:text-[68px]">
            “{SITE.invest.quote}”
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
            <Reveal as="p" delay={160} className="max-w-xl text-[15px] leading-relaxed text-sand/75">
              {SITE.invest.text}
            </Reveal>
            <Reveal delay={240} className="flex flex-wrap gap-3">
              <Link href="/propiedades/inversion" className={`${button} border-sand hover:bg-sand hover:text-charcoal`}>
                Ver propiedades en venta
              </Link>
              <a
                href={whatsappLink("Hola Fernanda, quiero asesoría para invertir en una propiedad")}
                target="_blank"
                rel="noreferrer"
                className={`${button} border-sand/40 text-sand/90 hover:border-sand`}
              >
                Quiero invertir
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="scroll-mt-10 px-5 py-28 md:px-12 md:py-40">
        <div className="mx-auto grid max-w-[1240px] items-center gap-14 md:grid-cols-2 md:gap-24">
          <Reveal className="relative mx-auto aspect-[4/5] w-full max-w-md bg-beige">
            <div className="absolute inset-0 grid place-items-center text-cream">
              <span aria-hidden className="font-serif text-[120px] italic leading-none text-cream/80">FD</span>
            </div>
          </Reveal>
          <div>
            <Reveal as="p" className="eyebrow text-stone">
              {SITE.about.eyebrow}
            </Reveal>
            <Reveal as="h2" delay={80} className="mt-3 font-serif text-5xl font-light md:text-7xl">
              {SITE.about.title}
            </Reveal>
            {SITE.about.paragraphs.map((t, i) => (
              <Reveal key={i} as="p" delay={160 + i * 80} className="mt-6 max-w-md text-[15px] leading-relaxed text-graphite">
                {t}
              </Reveal>
            ))}
            <div className="mt-10 grid grid-cols-2 border-t border-charcoal/15">
              {SITE.about.stats.map((s, i) => (
                <Reveal key={s.label} delay={240 + i * 70} className="border-b border-charcoal/15 py-5 pr-4">
                  <p className="font-serif text-[28px] leading-tight">{s.value}</p>
                  <p className="mt-1 text-xs leading-snug text-stone">{s.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Propietarios */}
      <section className="bg-sand px-5 py-28 md:px-12 md:py-36">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div>
            <Reveal as="p" className="eyebrow text-stone">
              Propietarios
            </Reveal>
            <Reveal as="h2" delay={80} className="mt-3 font-serif text-5xl font-light md:text-7xl">
              {SITE.owners.title}
            </Reveal>
            <Reveal as="p" delay={160} className="mt-6 max-w-lg text-[15px] leading-relaxed text-graphite">
              {SITE.owners.text}
            </Reveal>
          </div>
          <Reveal delay={240}>
            <Link href="/propietarios" className={`${button} shrink-0 border-charcoal hover:bg-charcoal hover:text-cream`}>
              Arrienda o vende con nosotros
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="scroll-mt-10 px-5 py-28 md:px-12 md:py-40">
        <div className="mx-auto grid max-w-[1240px] gap-14 md:grid-cols-[1fr_1.1fr] md:gap-24">
          <div>
            <Reveal as="p" className="eyebrow text-stone">
              Contacto
            </Reveal>
            <Reveal as="h2" delay={80} className="mt-3 font-serif text-5xl font-light md:text-7xl">
              Conversemos
            </Reveal>
            <Reveal as="p" delay={160} className="mt-6 max-w-sm text-[15px] leading-relaxed text-graphite">
              Cuéntanos qué buscas y agenda tu primera asesoría, sin costo. Si prefieres, escríbenos directo por WhatsApp.
            </Reveal>
            <Reveal delay={240}>
              <a
                href={whatsappLink(SITE.advisoryWhatsapp)}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-block font-serif text-3xl underline decoration-charcoal/25 underline-offset-8 hover:decoration-charcoal"
              >
                {SITE.whatsappDisplay}
              </a>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <ContactForm placeholder="Cuéntanos si quieres comprar, arrendar o invertir, y para cuándo." submitLabel="Quiero mi asesoría gratuita" />
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
