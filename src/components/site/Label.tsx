/** Etiqueta de sección al estilo de la referencia: "(Propiedades)". */
export function Label({ children, light = false }: { children: string; light?: boolean }) {
  return <p className={`text-[13px] ${light ? "text-white/60" : "text-stone"}`}>({children})</p>;
}
