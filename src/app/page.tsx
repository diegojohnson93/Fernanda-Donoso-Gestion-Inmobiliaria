import { SITE, whatsappLink } from "@/lib/site";

/** Portada provisoria mientras se diseña la web pública. */
export default function Home() {
  return (
    <main className="grid min-h-full place-items-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand text-lg font-bold text-white">
          FD
        </div>
        <h1 className="mt-4 text-2xl font-semibold">{SITE.name}</h1>
        <p className="text-muted">{SITE.tagline}</p>
        <p className="mt-6 text-sm text-muted">
          Estamos preparando nuestro sitio. Mientras tanto, escríbenos y te ayudamos a encontrar tu
          próxima propiedad en {SITE.zone}.
        </p>
        <a
          href={whatsappLink("Hola Fernanda, quiero consultar por una propiedad")}
          className="mt-6 inline-flex rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white"
        >
          Escribir por WhatsApp · {SITE.whatsappDisplay}
        </a>
        <div className="mt-10">
          <a href="/admin" className="text-xs text-muted underline-offset-2 hover:underline">
            Acceso Fernanda
          </a>
        </div>
      </div>
    </main>
  );
}
