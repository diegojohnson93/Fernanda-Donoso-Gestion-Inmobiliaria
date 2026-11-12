/* eslint-disable @next/next/no-img-element */

/**
 * Texto gigante que se desliza sin fin, con una foto fija al centro
 * (el efecto de portada de la referencia).
 */
export function MarqueeHero({
  text,
  image,
  imageAlt = "",
  tone = "dark",
  fallbackBg = "bg-beige",
}: {
  text: string;
  image?: string | null;
  imageAlt?: string;
  tone?: "dark" | "light";
  fallbackBg?: string;
}) {
  const item = (
    <span className="flex shrink-0 items-center whitespace-nowrap">
      <span className="px-[0.18em]">{text}</span>
      <span className="px-[0.18em] text-[0.35em] opacity-60" aria-hidden>
        ✦
      </span>
    </span>
  );
  return (
    <div className="relative flex h-[46vh] min-h-[260px] items-center overflow-hidden md:h-[52vh]">
      <div
        className={`marquee-track flex w-max font-serif text-[23vw] font-light leading-none tracking-[-0.02em] md:text-[15vw] ${
          tone === "light" ? "text-cream" : "text-charcoal"
        }`}
        aria-hidden
      >
        {item}
        {item}
        {item}
        {item}
      </div>
      <span className="sr-only">{text}</span>
      <div
        className={`absolute left-1/2 top-1/2 aspect-square w-[42vw] max-w-[260px] -translate-x-1/2 -translate-y-1/2 overflow-hidden md:w-[17vw] ${fallbackBg}`}
      >
        {image ? (
          <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span aria-hidden className="font-serif text-6xl italic text-cream/80">FD</span>
          </div>
        )}
      </div>
    </div>
  );
}
