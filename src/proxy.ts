import { NextResponse, type NextRequest } from "next/server";
import { authEnabled, SESSION_COOKIE, sessionToken } from "@/lib/auth";

/** APIs que el público o Meta pueden llamar sin contraseña. */
// /api/cron/ se protege con CRON_SECRET dentro de la ruta.
const PUBLIC_API = ["/api/login", "/api/webhooks/", "/api/public/", "/api/cron/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (!authEnabled()) return NextResponse.next();

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (cookie && cookie === (await sessionToken())) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  // Solo se protege el panel de Fernanda y sus APIs. La web pública queda abierta.
  matcher: ["/admin/:path*", "/api/:path*"],
};
