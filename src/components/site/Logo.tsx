/**
 * Logo de Fernanda Donoso Asesoría & Gestión Inmobiliaria.
 * Solo tipográfico: nombre en serif y bajada centrada.
 */

/** Iniciales en serif, para espacios sin foto. */
export function Monogram({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`font-serif italic leading-none ${className}`}>
      FD
    </span>
  );
}

export function Logo({
  size = "md",
  align = "center",
  className = "",
}: {
  size?: "md" | "lg";
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex flex-col leading-none ${
        align === "left" ? "items-start text-left" : "items-center text-center"
      } ${className}`}
    >
      <span className={`block font-serif font-medium ${size === "lg" ? "text-[30px]" : "text-[22px] md:text-[24px]"}`}>
        Fernanda Donoso
      </span>
      <span
        className={`mt-1 block whitespace-nowrap font-medium uppercase tracking-[0.06em] opacity-70 ${
          size === "lg" ? "text-[11px]" : "text-[9px] md:text-[10px]"
        }`}
      >
        Asesoría &amp; Gestión Inmobiliaria
      </span>
    </span>
  );
}
