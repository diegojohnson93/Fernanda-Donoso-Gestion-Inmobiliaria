import type { Metadata } from "next";
import { OwnerForm } from "@/components/site/Forms";
import { Reveal } from "@/components/site/Reveal";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Propietarios",
  description: "Arrienda o vende tu propiedad con asesoría personalizada en Viña del Mar, Valparaíso, Reñaca y Concón.",
};

const STEPS = SITE.owners.steps;

export default function OwnersPage() {
  return (
    <>
      <SiteHeader />
      <section className="px-5 pb-20 pt-16 md:px-12 md:pb-28 md:pt-24">
        <div className="mx-auto max-w-[1240px]">
          <Reveal as="p" className="eyebrow text-stone">
            Propietarios
          </Reveal>
          <Reveal as="h1" delay={60} className="mt-4 max-w-4xl font-serif text-[52px] font-light leading-[1] md:text-[96px]">
            Arrienda o vende con tranquilidad
          </Reveal>
          <Reveal as="p" delay={140} className="mt-8 max-w-xl text-[15px] leading-relaxed text-graphite">
            {SITE.owners.text} Cobramos la comisión estándar del mercado, pero recibes asesoría y gestión de principio a fin.
          </Reveal>
        </div>
      </section>

      <section className="px-5 md:px-12">
        <div className="mx-auto grid max-w-[1240px] border-t border-charcoal/15 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 90} className="border-b border-charcoal/15 lg:border-b-0 lg:border-r lg:last:border-r-0">
              <div className="step-card py-7 sm:px-7 md:py-8">
                <span className="font-serif text-lg italic text-taupe">0{i + 1}</span>
                <h2 className="mt-6 font-serif text-3xl">{s.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-24 bg-charcoal px-5 py-24 text-sand md:mt-32 md:px-12 md:py-32">
        <div className="mx-auto grid max-w-[1240px] gap-14 md:grid-cols-[1fr_1.3fr] md:gap-24">
          <div>
            <Reveal as="h2" className="font-serif text-5xl font-light leading-[1.02] md:text-6xl">
              Cuéntanos de tu propiedad
            </Reveal>
            <Reveal as="p" delay={100} className="mt-6 max-w-sm text-[15px] leading-relaxed text-sand/75">
              Te contactamos para conocerla y conversar, sin compromiso.
            </Reveal>
          </div>
          <Reveal delay={120}>
            <OwnerForm />
          </Reveal>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
