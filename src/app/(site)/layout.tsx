import "@fontsource/cormorant-garamond/latin-300.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-300-italic.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-500-italic.css";
import "@fontsource-variable/manrope";
import type { Metadata } from "next";
import { connection } from "next/server";
import { SiteShell } from "@/components/site/SiteShell";
import { getPublishedProperties } from "@/lib/public";
import { CATEGORIES, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: { siteName: `${SITE.name} ${SITE.tagline}`, locale: "es_CL", type: "website" },
};

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  await connection();
  const properties = await getPublishedProperties();
  const categories = CATEGORIES.map((category) => {
    const list = properties.filter((p) => p.modalities.includes(category.modality));
    return {
      category,
      count: list.length,
      cover: list.find((p) => p.photos[0])?.photos[0].url ?? null,
    };
  });
  return (
    <>
      {/* Marca que hay JavaScript (para preparar efectos sin parpadeo); se quita sola por seguridad. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.documentElement.classList.add('js');setTimeout(function(){document.documentElement.classList.remove('js')},3500)",
        }}
      />
      <SiteShell categories={categories}>{children}</SiteShell>
    </>
  );
}
