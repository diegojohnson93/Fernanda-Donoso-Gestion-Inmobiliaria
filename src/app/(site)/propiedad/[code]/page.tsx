import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityCalendar } from "@/components/site/AvailabilityCalendar";
import { ContactForm } from "@/components/site/Forms";
import { Gallery } from "@/components/site/Gallery";
import { Reveal } from "@/components/site/Reveal";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { mailEnabled } from "@/lib/mail";
import { detailSections, factsLine, getAirbnbAvailability, getPublishedProperty, priceFor } from "@/lib/public";
import { SITE, categoryFor, whatsappLink } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/propiedad/[code]">): Promise<Metadata> {
  const p = await getPublishedProperty((await params).code);
  if (!p) return {};
  const description = [
    p.modalities.map((m) => `${categoryFor(m).title}: ${priceFor(p, m)}`).join(" · "),
    p.sector,
    factsLine(p),
  ]
    .filter(Boolean)
    .join(" — ");
  return {
    title: `${p.title} (${p.code})`,
    description,
    openGraph: {
      title: `${p.title} · ${SITE.name}`,
      description,
      images: p.photos[0] ? [{ url: p.photos[0].url }] : undefined,
    },
  };
}

export default async function PropertyPage({ params }: PageProps<"/propiedad/[code]">) {
  const p = await getPublishedProperty((await params).code);
  if (!p) notFound();
  const sections = detailSections(p);
  const isAirbnb = p.modalities.includes("airbnb");
  const onlyAirbnb = isAirbnb && p.modalities.length === 1;
  const availability = isAirbnb ? await getAirbnbAvailability(p.code) : null;
  const minNights = typeof p.details.minimo_noches === "string" ? p.details.minimo_noches : undefined;
  const waText = isAirbnb
    ? `Hola Fernanda, quiero reservar ${p.code} — ${p.title}. ¿Qué fechas tienes disponibles?`
    : `Hola Fernanda, quiero consultar por ${p.code} — ${p.title}`;

  return (
    <>
      <SiteHeader />
      <main className="px-5 pb-28 md:px-12">
        <div className="mx-auto max-w-[1340px]">
          <nav className="mb-5 flex flex-wrap gap-2 text-xs text-stone">
            <Link href="/" className="hover:text-charcoal">Inicio</Link>
            <span>/</span>
            <Link href={`/propiedades/${categoryFor(p.modalities[0]).slug}`} className="hover:text-charcoal">
              {categoryFor(p.modalities[0]).title}
            </Link>
            <span>/</span>
            <span className="text-charcoal">{p.code}</span>
          </nav>

          <Gallery photos={p.photos} title={p.title} />

          <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_380px] lg:gap-20">
            <div>
              <Reveal className="flex flex-wrap items-center gap-2">
                <span className="eyebrow bg-charcoal px-2 py-1 !text-[9.5px] text-cream">{p.code}</span>
                {p.modalities.map((m) => (
                  <Link
                    key={m}
                    href={`/propiedades/${categoryFor(m).slug}`}
                    className={`eyebrow px-2 py-1 !text-[9.5px] text-cream ${categoryFor(m).bg}`}
                  >
                    {categoryFor(m).title}
                  </Link>
                ))}
              </Reveal>
              <Reveal as="h1" delay={60} className="mt-5 font-serif text-[44px] font-light leading-[1.02] md:text-[68px]">
                {p.title}
              </Reveal>
              <Reveal as="p" delay={120} className="mt-4 text-[15px] text-stone">
                {[p.address ?? p.sector, factsLine(p)].filter(Boolean).join(" · ")}
              </Reveal>

              {p.description && (
                <Reveal delay={160} className="mt-10 max-w-2xl space-y-4 text-[16px] leading-relaxed text-graphite">
                  {p.description.split(/\n+/).map((t, i) => (
                    <p key={i}>{t}</p>
                  ))}
                </Reveal>
              )}

              {isAirbnb && (
                <Reveal className="mt-14">
                  <AvailabilityCalendar
                    busy={availability?.busy ?? []}
                    synced={Boolean(availability)}
                    code={p.code}
                    title={p.title}
                    minNights={minNights}
                    requestEnabled={mailEnabled()}
                  />
                </Reveal>
              )}

              <div className="mt-14 space-y-12">
                {sections.map((s) => (
                  <Reveal key={s.id}>
                    <h2 className="flex items-center gap-3 font-serif text-3xl">
                      {s.modality && <span className={`h-2.5 w-2.5 rounded-full ${categoryFor(s.modality).bg}`} />}
                      {s.title}
                    </h2>
                    <dl className="mt-5 grid gap-x-10 border-t border-charcoal/15 sm:grid-cols-2">
                      {s.rows.map((r) => (
                        <div key={r.label} className="flex justify-between gap-6 border-b border-charcoal/10 py-3 text-sm">
                          <dt className="text-stone">{r.label}</dt>
                          <dd className="text-right">{r.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                ))}
              </div>
            </div>

            <aside className="lg:sticky lg:top-8 lg:self-start">
              <div className="border border-charcoal/15 bg-sand/60 p-6 md:p-8">
                <p className="eyebrow text-stone">{p.modalities.length > 1 ? "Valores" : "Valor"}</p>
                <div className="mt-4 space-y-4">
                  {p.modalities.map((m) => (
                    <div key={m}>
                      <p className="text-xs text-stone">{categoryFor(m).title}</p>
                      <p className="font-serif text-[30px] leading-tight">{priceFor(p, m)}</p>
                    </div>
                  ))}
                </div>
                <a
                  href={whatsappLink(waText)}
                  target="_blank"
                  rel="noreferrer"
                  className="eyebrow mt-8 flex h-12 items-center justify-center bg-charcoal text-cream transition hover:bg-graphite"
                >
                  {isAirbnb ? "Reservar por WhatsApp" : "Consultar por WhatsApp"}
                </a>
                <p className="mt-4 text-xs leading-relaxed text-stone">
                  {onlyAirbnb
                    ? "Reserva directo con nosotros, sin las comisiones de la plataforma."
                    : "¿Quieres saber si te conviene? La primera asesoría es gratis."}
                </p>
              </div>
              <div className="mt-8 border border-charcoal/15 p-6 md:p-8">
                <p className="font-serif text-2xl">Pide más información</p>
                <div className="mt-5">
                  <ContactForm propertyCode={p.code} placeholder={`Me interesa ${p.code}…`} submitLabel="Enviar consulta" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Botón fijo en celular */}
      <a
        href={whatsappLink(waText)}
        target="_blank"
        rel="noreferrer"
        className="eyebrow fixed bottom-4 left-4 z-40 flex h-11 items-center bg-charcoal px-4 !text-[10px] text-cream shadow-lg lg:hidden"
      >
        {isAirbnb ? "Reservar" : "WhatsApp"}
      </a>
      <SiteFooter />
    </>
  );
}
