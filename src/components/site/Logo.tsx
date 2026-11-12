/**
 * Logo de Fernanda Donoso Gestión Inmobiliaria.
 * Monograma "FD" dentro de un arco (una puerta, un hogar) y el nombre en serif.
 */

export function LogoMark({ className = "h-11 w-9", strokeWidth = 1.1 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 48 60" className={className} aria-hidden="true" fill="none">
      <path
        d="M5 58V25a19 19 0 0 1 38 0v33"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path d="M1 58h46" stroke="currentColor" strokeWidth={strokeWidth} />
      <text
        x="24"
        y="43"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontFamily: "var(--font-serif)", fontSize: 21, fontStyle: "italic", fontWeight: 500, letterSpacing: "-0.5px" }}
      >
        FD
      </text>
    </svg>
  );
}

export function Logo({
  layout = "horizontal",
  className = "",
}: {
  layout?: "horizontal" | "stacked";
  className?: string;
}) {
  if (layout === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
        <LogoMark className="h-14 w-11" />
        <span className="text-center leading-none">
          <span className="block font-serif text-[26px] font-medium tracking-[0.02em]">Fernanda Donoso</span>
          <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.34em] opacity-70">
            Asesoría &amp; Gestión Inmobiliaria
          </span>
        </span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-10 w-8" />
      <span className="leading-none">
        <span className="block font-serif text-[22px] font-medium tracking-[0.02em]">Fernanda Donoso</span>
        <span className="mt-1 block whitespace-nowrap text-[7.5px] font-semibold uppercase tracking-[0.22em] opacity-70 md:text-[8.5px] md:tracking-[0.3em]">
          Asesoría &amp; Gestión Inmobiliaria
        </span>
      </span>
    </span>
  );
}
