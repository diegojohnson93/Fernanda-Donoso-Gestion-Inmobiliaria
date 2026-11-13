/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ModalityCards } from "@/components/site/ModalityCards";
import { ContactForm } from "@/components/site/Forms";
import { SplitReveal, Typewriter } from "@/components/site/Motion";
import { PropertyBrowser } from "@/components/site/PropertyBrowser";
import { Reveal } from "@/components/site/Reveal";
import { Parallax } from "@/components/site/Parallax";
import { PhotoHero } from "@/components/site/PhotoHero";
import { ScrollText } from "@/components/site/ScrollText";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublishedProperties } from "@/lib/public";
import { CATEGORIES, SITE, whatsappLink } from "@/lib/site";

const button = "eyebrow inline-flex h-12 items-center justify-center border px-7 transition duration-300";

export default async function Home() {
  const properties = await getPublishedProperties();
  const categories = CATEGORIES.map((category) => {
    const list = properties.filter((p) => p.modalities.includes(category.modality));
    return { category, count: list.length, cover: list.find((p) => p.photos[0])?.photos[0].url ?? null };
  });

  return (
    <>
      {/* Portada: foto completa con el título deslizándose encima */}
      <PhotoHero
        text={SITE.hero.marquee}
        image="/images/vina-del-mar.webp"
        imageAlt="Viña del Mar"
        imagePosition="50% 45%"
        header={<SiteHeader tone="light" />}
      >
        <p className="mx-auto max-w-2xl text-[15px] font-medium leading-relaxed md:text-[17px] md:[&_span]:whitespace-pre">
          <Typewriter text={SITE.hero.lead} on="load" startDelay={1700} speed={26} />
        </p>
        <a
          href={whatsappLink(SITE.advisoryWhatsapp)}
          target="_blank"
          rel="noreferrer"
          className="eyebrow mx-auto mt-5 inline-block border border-white/80 px-3 py-1.5 !text-[9.5px] transition hover:bg-white hover:text-charcoal"
        >
          {SITE.hero.badge} →
        </a>
      </PhotoHero>

      {/* Modalidades: las cuatro tarjetas */}
      <section className="bg-white px-5 pb-28 pt-16 md:px-12 md:pb-36 md:pt-24">
        <div className="mx-auto max-w-[1340px]">
          <div className="mb-10 text-center md:mb-14">
            <SplitReveal as="h2" type="chars" className="font-serif text-[48px] font-light leading-[0.98] md:text-[84px]">
              ¿Qué estás buscando?
            </SplitReveal>
            <SplitReveal as="p" delay={150} className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-graphite">
              Elige una modalidad y te mostramos las propiedades disponibles.
            </SplitReveal>
          </div>
          <ModalityCards items={categories} total={properties.length} />
        </div>
      </section>

      {/* Declaración */}
      <section className="bg-white px-5 pb-10 pt-28 md:px-12 md:pt-40">
        <ScrollText
          text={SITE.statement}
          className="mx-auto max-w-[1180px] text-center text-[28px] font-medium leading-[1.14] tracking-[-0.015em] md:text-[54px]"
        />
      </section>

      {/* Propiedades disponibles: lo primero que ve el cliente */}
      <section id="propiedades" className="scroll-mt-10 bg-white px-5 pb-10 pt-28 md:px-12 md:pt-36">
        <div className="mx-auto max-w-[1340px]">
          <div className="mb-10 text-center md:mb-14">
            <SplitReveal as="h2" type="chars" className="font-serif text-[52px] font-light leading-[0.95] md:text-[96px]">
              Disponibles hoy
            </SplitReveal>
            <SplitReveal as="p" delay={200} className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-graphite">
              Elige una modalidad y revisa las propiedades que tenemos para ti. ¿No sabes cuál te conviene? Te
              asesoramos gratis.
            </SplitReveal>
          </div>
          <PropertyBrowser properties={properties} />
        </div>
      </section>

      {/* Lo que recibes */}
      <section className="bg-white px-5 py-28 md:px-12 md:py-36">
        <div className="mx-auto max-w-[1240px]">
          <div className="text-center">
            <SplitReveal as="h2" type="chars" className="font-serif text-[48px] font-light leading-[0.98] md:text-[84px]">
              {SITE.intro.title}
            </SplitReveal>
            <SplitReveal as="p" delay={150} className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-graphite">
              {SITE.intro.text}
            </SplitReveal>
          </div>
          <div className="mt-20 grid border-t border-charcoal/12 sm:grid-cols-2 lg:grid-cols-4">
            {SITE.value.items.map((it, i) => (
              <Reveal
                key={it.title}
                delay={i * 90}
                className="border-b border-charcoal/12 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <div className="step-card py-8 sm:px-7">
                  <span className="font-serif text-lg italic text-taupe">0{i + 1}</span>
                  <h3 className="mt-6 font-serif text-[28px] leading-tight">{it.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-graphite">{it.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Nuestra mirada + inversión */}
      <section className="bg-charcoal px-5 py-28 text-white md:px-12 md:py-44">
        <div className="mx-auto max-w-[1100px] text-center">
          <SplitReveal
            as="blockquote"
            type="lines"
            className="font-serif text-[34px] font-light italic leading-[1.12] md:text-[54px]"
          >
            {`“${SITE.invest.quote}”`}
          </SplitReveal>
          <div className="mx-auto mt-14 max-w-2xl border-t border-white/15 pt-10">
            <SplitReveal as="p" delay={160} className="mx-auto max-w-xl text-[15px] leading-relaxed text-white/75">
              {SITE.invest.text}
            </SplitReveal>
            <Reveal delay={240} className="mt-10 flex flex-wrap justify-center gap-3">
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

      {/* Propietarios: sección destacada, foto a todo el ancho */}
      <section className="relative overflow-hidden bg-[#3a322b] px-5 py-28 text-white md:px-12 md:py-40">
        {/* Foto casi imperceptible: solo textura, en tonos beige */}
        <Parallax className="absolute inset-0">
          <img
            src="/images/propietarios.webp"
            alt=""
            aria-hidden
            data-speed="1"
            className="absolute inset-x-0 -top-[18%] h-[136%] w-full object-cover opacity-[0.12] grayscale mix-blend-luminosity"
            style={{ objectPosition: "60% 50%" }}
          />
        </Parallax>
        <div aria-hidden className="absolute inset-0 bg-[#a58b6c] opacity-[0.12] mix-blend-color" />
        <div className="relative mx-auto max-w-[1240px]">
          <SplitReveal as="h2" type="chars" className="text-center font-serif text-[56px] font-light leading-[0.95] md:text-[112px]">
            {SITE.owners.title}
          </SplitReveal>
          <SplitReveal as="p" delay={160} className="mx-auto mt-8 max-w-xl text-center text-[16px] leading-relaxed text-white/85 md:text-[18px]">
            {SITE.owners.text}
          </SplitReveal>
          <ol className="mt-16 grid border-t border-white/25 sm:grid-cols-2 lg:grid-cols-4">
            {SITE.owners.steps.map((st, i) => (
              <Reveal
                as="li"
                key={st.title}
                delay={i * 90}
                className="border-b border-white/25 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <div className="step-card step-card-dark py-7 sm:px-7">
                  <span className="font-serif text-lg italic text-white/60">0{i + 1}</span>
                  <h3 className="mt-5 font-serif text-3xl">{st.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/75">{st.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={200} className="mt-14 flex flex-wrap justify-center gap-3">
            <Link href="/propietarios" className={`${button} border-white bg-white text-charcoal hover:bg-transparent hover:text-white`}>
              Arrienda o vende con nosotros
            </Link>
            <a
              href={whatsappLink(SITE.owners.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className={`${button} border-white/50 text-white hover:border-white`}
            >
              Escríbenos por WhatsApp
            </a>
          </Reveal>
        </div>
      </section>

      {/* Asesoría gratuita + contacto, en una sola sección */}
      <section id="asesoria" className="scroll-mt-10 bg-white px-5 py-28 md:px-12 md:py-40">
        <span id="contacto" className="block scroll-mt-10" aria-hidden />
        <div className="mx-auto max-w-[1240px] text-center">
          <SplitReveal as="h2" type="chars" className="font-serif text-5xl font-light leading-[1.02] md:text-[84px]">
            {SITE.advisory.title}
          </SplitReveal>
          <SplitReveal as="p" delay={150} className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-graphite">
            {SITE.advisory.text}
          </SplitReveal>
          <Reveal delay={200} className="mt-7 flex flex-wrap justify-center gap-2">
            {SITE.advisory.factors.map((f) => (
              <span key={f} className="border border-charcoal/20 px-3 py-1.5 text-xs">
                {f}
              </span>
            ))}
          </Reveal>
        </div>
        <Reveal delay={120} className="mx-auto mt-16 max-w-2xl">
          <ContactForm
            placeholder="Cuéntanos si quieres comprar, arrendar o invertir, y para cuándo."
            submitLabel="Quiero mi asesoría gratuita"
            centered
          />
          <p className="mt-12 text-center text-sm text-stone">
            ¿Prefieres WhatsApp?{" "}
            <a
              href={whatsappLink(SITE.advisoryWhatsapp)}
              target="_blank"
              rel="noreferrer"
              className="font-serif text-2xl text-charcoal underline decoration-charcoal/25 underline-offset-8 hover:decoration-charcoal"
            >
              {SITE.whatsappDisplay}
            </a>
          </p>
        </Reveal>
      </section>

      <SiteFooter />
    </>
  );
}
