import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fernanda Donoso · Gestión Inmobiliaria",
  description: "Bandeja unificada de mensajes con respuestas sugeridas por IA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
