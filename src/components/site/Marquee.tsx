/** Solo el texto gigante que se desliza (sin foto al centro). */
export function MarqueeText({
  text,
  className = "",
  separator = true,
}: {
  text: string;
  className?: string;
  separator?: boolean;
}) {
  const item = (
    <span className="flex shrink-0 items-center whitespace-nowrap">
      <span className="px-[0.2em]">{text}</span>
      {separator && (
        <MarqueeDot />
      )}
    </span>
  );
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max leading-none" aria-hidden>
        {item}
        {item}
        {item}
        {item}
      </div>
      <span className="sr-only">{text}</span>
    </div>
  );
}

/** Separador minimalista entre repeticiones del texto: un punto pequeño. */
export function MarqueeDot() {
  return (
    <span aria-hidden className="mx-[0.3em] inline-block h-[0.09em] w-[0.09em] shrink-0 translate-y-[0.06em] rounded-full bg-current opacity-80" />
  );
}
