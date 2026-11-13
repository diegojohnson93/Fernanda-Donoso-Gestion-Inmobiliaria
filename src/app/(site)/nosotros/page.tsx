/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { ImageReveal } from "@/components/site/ImageReveal";
import { Label } from "@/components/site/Label";
import { MarqueeText } from "@/components/site/Marquee";
import { CountUp, SplitReveal } from "@/components/site/Motion";
import { Reveal } from "@/components/site/Reveal";
import { ScaleImage } from "@/components/site/ScaleImage";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublishedProperties } from "@/lib/public";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Fernanda Donoso, Ingeniera Civil Industrial PUCV, asesora inmobiliaria en Viña del Mar, Valparaíso, Reñaca y Concón. Primera asesoría gratuita.",
};

export default async function AboutPage() {
  const photos = (await getPublishedProperties()).flatMap((p) => p.photos.map((ph) => ph.url));
  const vina = "/images/vina-del-mar.webp";
  const heroPhoto = photos[0] ?? vina;

  return (
    <>
      {/* Portada con foto a todo el ancho y texto gigante en blanco */}
      <section className="relative flex h-[100svh] min-h-[560px] flex-col overflow-hidden bg-taupe text-white">
        {heroPhoto ? (
          <img src={heroPhoto} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundImage: "linear-gradient(160deg, #d8ccbc 0%, #a8977f 55%, #7b7168 100%)" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/25" />
        <div className="relative">
          <SiteHeader tone="light" />
        </div>
        <div className="relative flex flex-1 items-center">
          <MarqueeText
            text={SITE.aboutPage.marquee}
            className="w-full font-serif text-[26vw] font-light tracking-[-0.02em] md:text-[17vw]"
          />
        </div>
        <p className="relative mb-10 ml-5 text-xs text-white/80 md:ml-12">(Scroll)</p>
      </section>

      {/* Declaración con sangría, línea por línea */}
      <section className="bg-white px-5 py-28 md:px-12 md:py-40">
        <div className="mx-auto grid max-w-[1340px] gap-8 md:grid-cols-[1fr_3fr]">
          <Label>Nosotros</Label>
          <SplitReveal
            as="p"
            type="lines"
            indent="22%"
            className="text-[28px] font-medium leading-[1.14] tracking-[-0.015em] md:text-[52px]"
          >
            {SITE.aboutPage.statement}
          </SplitReveal>
        </div>
      </section>

      <ScaleImage src="/images/renaca.webp" alt="Reñaca, Viña del Mar" />

      {/* Fernanda */}
      <section className="bg-white px-5 py-28 md:px-12 md:py-40">
        <div className="mx-auto grid max-w-[1240px] items-start gap-14 md:grid-cols-[1fr_1.15fr] md:gap-20">
          <ImageReveal
            src="/images/fernanda.webp"
            alt="Fernanda Donoso"
            position="50% 20%"
            className="aspect-[4/5] w-full md:sticky md:top-16"
          />
          <div className="md:pt-6">
            <Label>{SITE.about.eyebrow}</Label>
            <SplitReveal as="h2" type="chars" className="mb-10 mt-4 font-serif text-[56px] font-light leading-[0.95] md:text-[88px]">
              {SITE.about.title}
            </SplitReveal>
            {SITE.about.paragraphs.map((t, i) => (
              <SplitReveal key={i} as="p" delay={i * 120} className="mb-6 text-[17px] leading-relaxed text-graphite">
                {t}
              </SplitReveal>
            ))}
            <div className="mt-10 flex flex-wrap gap-x-16 gap-y-2 border-t border-charcoal/12 pt-2 md:gap-x-20">
              {SITE.about.stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 90} className="py-5">
                  <CountUp value={s.value} className="block font-serif text-[30px] leading-tight" />
                  <p className="mt-1 text-xs leading-snug text-stone">{s.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cita central */}
      <section className="bg-white px-5 pb-28 text-center md:px-12 md:pb-40">
        <SplitReveal
          as="blockquote"
          type="lines"
          className="mx-auto max-w-4xl font-serif text-[40px] font-light leading-[1.05] md:text-[72px]"
        >
          {`“${SITE.aboutPage.quote}”`}
        </SplitReveal>
      </section>

      {/* Nombre en marquesina */}
      <section className="bg-white pb-24 md:pb-32">
        <MarqueeText
          text={SITE.aboutPage.closing}
          className="font-serif text-[22vw] font-light tracking-[-0.02em] text-charcoal md:text-[14vw]"
        />
      </section>

      {/* Llamado a la acción */}
      <section className="bg-cream px-5 py-24 text-center md:px-12 md:py-32">
        <Label>{SITE.advisory.eyebrow}</Label>
        <SplitReveal as="h2" type="chars" className="mx-auto mt-4 max-w-3xl font-serif text-5xl font-light md:text-7xl">
          Conversemos sin costo
        </SplitReveal>
        <SplitReveal as="p" delay={150} className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-graphite">
          {SITE.advisory.text}
        </SplitReveal>
        <Reveal delay={220}>
          <a
            href={whatsappLink(SITE.advisoryWhatsapp)}
            target="_blank"
            rel="noreferrer"
            className="eyebrow mt-10 inline-flex h-12 items-center border border-charcoal bg-charcoal px-7 text-white transition duration-300 hover:bg-white hover:text-charcoal"
          >
            Agenda tu asesoría gratuita
          </a>
        </Reveal>
      </section>
      <SiteFooter />
    </>
  );
}
