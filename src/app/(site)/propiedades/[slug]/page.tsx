import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarqueeHero } from "@/components/site/Marquee";
import { PropertyCard } from "@/components/site/PropertyCard";
import { Reveal } from "@/components/site/Reveal";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublishedProperties } from "@/lib/public";
import { CATEGORIES, SITE, categoryBySlug, whatsappLink } from "@/lib/site";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/propiedades/[slug]">): Promise<Metadata> {
  const c = categoryBySlug((await params).slug);
  if (!c) return {};
  const title = `${c.title}${c.note ? ` (${c.note})` : ""}`;
  return { title, description: c.lead };
}

export default async function CategoryPage({ params }: PageProps<"/propiedades/[slug]">) {
  const c = categoryBySlug((await params).slug);
  if (!c) notFound();
  const list = (await getPublishedProperties()).filter((p) => p.modalities.includes(c.modality));
  const cover = list.find((p) => p.photos[0])?.photos[0].url ?? null;

  return (
    <>
      <section className={`relative flex min-h-[100svh] flex-col ${c.bg} text-cream`}>
        <SiteHeader tone="light" />
        <div className="flex flex-1 flex-col justify-center">
          <MarqueeHero text={c.title} image={cover} tone="light" fallbackBg="bg-cream/15" />
          <div className="px-5 pb-24 text-center md:pb-14">
            <p className="mx-auto max-w-lg text-[15px] font-medium leading-relaxed md:text-[17px]">{c.lead}</p>
            <p className="eyebrow mx-auto mt-5 inline-block border border-cream/70 px-3 py-1.5 !text-[9.5px]">
              {list.length} {list.length === 1 ? "propiedad disponible" : "propiedades disponibles"}
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-[1340px]">
          {list.length ? (
            <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 3) * 100}>
                  <PropertyCard p={p} modality={c.modality} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="mx-auto max-w-xl py-10 text-center">
              <h2 className="font-serif text-4xl font-light md:text-5xl">Muy pronto, nuevas propiedades</h2>
              <p className="mt-5 text-[15px] leading-relaxed text-graphite">
                Cuéntanos qué buscas y te avisamos apenas tengamos algo para ti. También podemos asesorarte gratis
                para definir la mejor opción.
              </p>
              <a
                href={whatsappLink(`Hola Fernanda, busco una propiedad en ${c.title}${c.note ? ` (${c.note})` : ""}`)}
                target="_blank"
                rel="noreferrer"
                className="eyebrow mt-8 inline-flex h-12 items-center border border-charcoal px-7 transition hover:bg-charcoal hover:text-cream"
              >
                Escribir por WhatsApp
              </a>
            </Reveal>
          )}
        </div>
      </section>

      <section className="bg-sand px-5 py-24 text-center md:px-12 md:py-32">
        <Reveal as="p" className="eyebrow text-stone">
          {SITE.advisory.eyebrow}
        </Reveal>
        <Reveal as="h2" delay={80} className="mx-auto mt-4 max-w-2xl font-serif text-4xl font-light leading-[1.05] md:text-6xl">
          ¿No sabes cuál es la mejor opción para ti?
        </Reveal>
        <Reveal as="p" delay={160} className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-graphite">
          Conversemos sin costo: revisamos tus ingresos, tu ahorro y tus expectativas para recomendarte lo que de verdad te conviene.
        </Reveal>
        <Reveal delay={220}>
          <a
            href={whatsappLink(SITE.advisoryWhatsapp)}
            target="_blank"
            rel="noreferrer"
            className="eyebrow mt-9 inline-flex h-12 items-center bg-charcoal px-7 text-cream transition hover:bg-graphite"
          >
            Agenda tu asesoría gratuita
          </a>
        </Reveal>
      </section>
      <SiteFooter />
    </>
  );
}
