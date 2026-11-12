import Link from "next/link";
import { ContactForm } from "@/components/site/Forms";
import { MarqueeHero } from "@/components/site/Marquee";
import { CountUp, SplitReveal, Typewriter } from "@/components/site/Motion";
import { PropertyBrowser } from "@/components/site/PropertyBrowser";
import { Reveal } from "@/components/site/Reveal";
import { ScaleImage } from "@/components/site/ScaleImage";
import { ScrollText } from "@/components/site/ScrollText";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Label } from "@/components/site/Label";
import { getPublishedProperties } from "@/lib/public";
import { SITE, whatsappLink } from "@/lib/site";

const button = "eyebrow inline-flex h-12 items-center justify-center border px-7 transition duration-300";

export default async function Home() {
  const properties = await getPublishedProperties();
  const withPhotos = properties.filter((p) => p.photos.length);
  const heroImage = withPhotos.find((p) => p.featured)?.photos[0].url ?? withPhotos[0]?.photos[0].url ?? null;
  const bigImage =
    withPhotos.find((p) => p.featured)?.photos[1]?.url ?? withPhotos[1]?.photos[0].url ?? heroImage;

  return (
    <>
      {/* Portada */}
      <section className="relative flex min-h-[100svh] flex-col bg-white">
        <SiteHeader />
        <div className="flex flex-1 flex-col justify-center">
          <MarqueeHero text={SITE.hero.marquee} image={heroImage} />
          <div className="px-5 pb-24 text-center md:pb-14">
            <p className="mx-auto max-w-xl text-[15px] font-medium leading-relaxed md:text-[17px]">
              <Typewriter text={SITE.hero.lead} on="load" startDelay={1700} speed={26} />
            </p>
            <a
              href={whatsappLink(SITE.advisoryWhatsapp)}
              target="_blank"
              rel="noreferrer"
              className="eyebrow mx-auto mt-5 inline-block border border-charcoal/70 px-3 py-1.5 !text-[9.5px] transition hover:bg-charcoal hover:text-white"
            >
              {SITE.hero.badge} →
            </a>
          </div>
        </div>
        <p className="absolute bottom-10 left-12 hidden text-xs text-stone md:block">(Scroll)</p>
      </section>

      {/* Propiedades disponibles: lo primero que ve el cliente */}
      <section id="propiedades" className="scroll-mt-10 bg-white px-5 pb-28 pt-16 md:px-12 md:pb-40 md:pt-24">
        <div className="mx-auto max-w-[1340px]">
          <div className="mb-10 grid gap-6 md:mb-14 md:grid-cols-[1fr_2fr] md:items-end">
            <Label>Propiedades</Label>
            <div>
              <SplitReveal as="h2" type="chars" className="font-serif text-[52px] font-light leading-[0.95] md:text-[96px]">
                Disponibles hoy
              </SplitReveal>
              <SplitReveal as="p" delay={200} className="mt-5 max-w-md text-[15px] leading-relaxed text-graphite">
                Elige una modalidad y revisa las propiedades que tenemos para ti. ¿No sabes cuál te conviene? Te
                asesoramos gratis.
              </SplitReveal>
            </div>
          </div>
          <PropertyBrowser properties={properties} />
        </div>
      </section>

      {/* Foto que crece */}
      <ScaleImage src={bigImage} />

      {/* Declaración */}
      <section className="bg-white px-5 pb-10 pt-28 md:px-12 md:pt-40">
        <ScrollText
          text={SITE.statement}
          className="mx-auto max-w-[1180px] text-[28px] font-medium leading-[1.14] tracking-[-0.015em] md:text-[54px]"
        />
      </section>

      {/* Lo que recibes */}
      <section className="bg-white px-5 py-28 md:px-12 md:py-36">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
            <Label>{SITE.tagline}</Label>
            <div>
              <SplitReveal as="h2" type="chars" className="font-serif text-[48px] font-light leading-[0.98] md:text-[84px]">
                {SITE.intro.title}
              </SplitReveal>
              <SplitReveal as="p" delay={150} className="mt-7 max-w-xl text-[15px] leading-relaxed text-graphite">
                {SITE.intro.text}
              </SplitReveal>
            </div>
          </div>
          <div className="mt-20 grid border-t border-charcoal/12 sm:grid-cols-2 lg:grid-cols-4">
            {SITE.value.items.map((it, i) => (
              <Reveal
                key={it.title}
                delay={i * 90}
                className="border-b border-charcoal/12 py-8 transition-colors duration-500 hover:bg-cream sm:px-7 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <span className="font-serif text-lg italic text-taupe">0{i + 1}</span>
                <h3 className="mt-6 font-serif text-[28px] leading-tight">{it.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{it.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Asesoría gratuita */}
      <section id="asesoria" className="scroll-mt-10 bg-white px-5 pb-28 md:px-12 md:pb-40">
        <div className="mx-auto grid max-w-[1240px] gap-16 border-t border-charcoal/12 pt-28 md:grid-cols-[1fr_1.05fr] md:gap-24 md:pt-36">
          <div className="md:sticky md:top-24 md:self-start">
            <Label>{SITE.advisory.eyebrow}</Label>
            <SplitReveal as="h2" type="lines" className="mt-5 font-serif text-5xl font-light leading-[1.02] md:text-7xl">
              {SITE.advisory.title}
            </SplitReveal>
            <SplitReveal as="p" delay={150} className="mt-7 max-w-md text-[15px] leading-relaxed text-graphite">
              {SITE.advisory.text}
            </SplitReveal>
            <Reveal delay={200} className="mt-7 flex flex-wrap gap-2">
              {SITE.advisory.factors.map((f) => (
                <span key={f} className="border border-charcoal/20 px-3 py-1.5 text-xs">
                  {f}
                </span>
              ))}
            </Reveal>
            <Reveal delay={260}>
              <a
                href={whatsappLink(SITE.advisoryWhatsapp)}
                target="_blank"
                rel="noreferrer"
                className={`${button} mt-10 border-charcoal bg-charcoal text-white hover:bg-white hover:text-charcoal`}
              >
                Agenda tu asesoría gratuita
              </a>
            </Reveal>
          </div>
          <ol className="border-t border-charcoal/12">
            {SITE.advisory.steps.map((s, i) => (
              <Reveal
                as="li"
                key={s.title}
                delay={i * 80}
                className="flex gap-6 border-b border-charcoal/12 py-8 md:gap-10 md:py-10"
              >
                <span className="w-10 font-serif text-6xl font-light leading-none text-taupe md:text-7xl">{i + 1}</span>
                <div className="pt-1">
                  <h3 className="font-serif text-3xl">{s.title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-graphite">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Nuestra mirada + inversión */}
      <section className="bg-charcoal px-5 py-28 text-white md:px-12 md:py-44">
        <div className="mx-auto max-w-[1100px]">
          <Label light>{SITE.invest.eyebrow}</Label>
          <SplitReveal
            as="blockquote"
            type="lines"
            className="mt-6 font-serif text-[34px] font-light italic leading-[1.12] md:text-[54px]"
          >
            {`“${SITE.invest.quote}”`}
          </SplitReveal>
          <div className="mt-14 grid gap-10 border-t border-white/15 pt-10 md:grid-cols-[1fr_auto] md:items-end">
            <SplitReveal as="p" delay={160} className="max-w-xl text-[15px] leading-relaxed text-white/75">
              {SITE.invest.text}
            </SplitReveal>
            <Reveal delay={240} className="flex flex-wrap gap-3">
              <Link href="/propiedades/comprar" className={`${button} border-white hover:bg-white hover:text-charcoal`}>
                Ver propiedades en venta
              </Link>
              <a
                href={whatsappLink("Hola Fernanda, quiero asesoría para invertir en una propiedad")}
                target="_blank"
                rel="noreferrer"
                className={`${button} border-white/40 text-white/90 hover:border-white`}
              >
                Quiero invertir
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Nosotros (resumen) */}
      <section className="bg-white px-5 py-28 md:px-12 md:py-40">
        <div className="mx-auto grid max-w-[1240px] gap-8 md:grid-cols-[1fr_3fr]">
          <Label>Nosotros</Label>
          <div>
            <SplitReveal
              as="p"
              type="lines"
              indent="22%"
              className="text-[26px] font-medium leading-[1.16] tracking-[-0.015em] md:text-[44px]"
            >
              {SITE.about.paragraphs[0]}
            </SplitReveal>
            <div className="mt-14 grid grid-cols-2 border-t border-charcoal/12 md:grid-cols-3">
              {SITE.about.stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 80} className="border-b border-charcoal/12 py-6 pr-4 md:border-b-0">
                  <CountUp value={s.value} className="block font-serif text-[30px] leading-tight" />
                  <p className="mt-1 text-xs leading-snug text-stone">{s.label}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={200}>
              <Link href="/nosotros" className="eyebrow mt-10 inline-block border-b border-charcoal pb-1">
                Conoce a Fernanda →
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Propietarios */}
      <section className="bg-cream px-5 py-28 md:px-12 md:py-36">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div>
            <Label>Propietarios</Label>
            <SplitReveal as="h2" type="chars" className="mt-4 font-serif text-5xl font-light md:text-7xl">
              {SITE.owners.title}
            </SplitReveal>
            <SplitReveal as="p" delay={160} className="mt-6 max-w-lg text-[15px] leading-relaxed text-graphite">
              {SITE.owners.text}
            </SplitReveal>
          </div>
          <Reveal delay={240}>
            <Link href="/propietarios" className={`${button} shrink-0 border-charcoal hover:bg-charcoal hover:text-white`}>
              Arrienda o vende con nosotros
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="scroll-mt-10 bg-white px-5 py-28 md:px-12 md:py-40">
        <div className="mx-auto grid max-w-[1240px] gap-14 md:grid-cols-[1fr_1.1fr] md:gap-24">
          <div>
            <Label>Contacto</Label>
            <SplitReveal as="h2" type="chars" className="mt-4 font-serif text-5xl font-light md:text-7xl">
              Conversemos
            </SplitReveal>
            <SplitReveal as="p" delay={160} className="mt-6 max-w-sm text-[15px] leading-relaxed text-graphite">
              Cuéntanos qué buscas y agenda tu primera asesoría, sin costo. Si prefieres, escríbenos directo por WhatsApp.
            </SplitReveal>
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
            <ContactForm
              placeholder="Cuéntanos si quieres comprar, arrendar o invertir, y para cuándo."
              submitLabel="Quiero mi asesoría gratuita"
            />
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
