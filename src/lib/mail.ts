/**
 * Envío de correos con Resend (https://resend.com).
 * Variables:
 *  - RESEND_API_KEY: clave de Resend.
 *  - MAIL_FROM: remitente, p. ej. "Fernanda Donoso <reservas@fernandadonoso.cl>".
 *    Hasta verificar el dominio en Resend se puede usar "onboarding@resend.dev",
 *    pero entonces Resend solo entrega a la dirección dueña de la cuenta.
 *  - NOTIFY_EMAIL: correo de Fernanda (avisos y respuestas de los clientes).
 * Sin RESEND_API_KEY los correos no se envían y solo se registran en el log.
 */

export function mailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function notifyEmail(): string | null {
  return process.env.NOTIFY_EMAIL?.trim() || null;
}

export interface MailResult {
  sent: boolean;
  error?: string;
}

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
}): Promise<MailResult> {
  const to = (Array.isArray(opts.to) ? opts.to : [opts.to]).filter(Boolean);
  if (!to.length) return { sent: false, error: "Sin destinatario" };
  if (!mailEnabled()) {
    console.log(`[correo no enviado: falta RESEND_API_KEY] Para ${to.join(", ")} — ${opts.subject}`);
    return { sent: false, error: "Correos no configurados" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM?.trim() || "Fernanda Donoso <onboarding@resend.dev>",
        to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message || `Resend respondió ${res.status}`);
    }
    return { sent: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("[correo]", error);
    return { sent: false, error };
  }
}

/* ------------------------------------------------------------------------ */
/* Plantilla común                                                           */
/* ------------------------------------------------------------------------ */

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Convierte texto con saltos de línea en HTML seguro. */
export const nl2br = (s: string) => esc(s).replace(/\n/g, "<br>");

export interface MailRow {
  label: string;
  value: string;
}

/**
 * Correo sobrio con los colores del sitio. Los textos ya deben venir
 * escapados cuando se pasan como html (title/intro se escapan aquí).
 */
export function layout(opts: {
  title: string;
  intro: string;
  rows?: MailRow[];
  blocks?: { title: string; html: string }[];
  cta?: { label: string; href: string };
  footer?: string;
}): string {
  const rows = (opts.rows ?? [])
    .filter((r) => r.value)
    .map(
      (r) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #e7e0d6;color:#8a8178;font-size:13px;width:38%">${esc(r.label)}</td><td style="padding:10px 0;border-bottom:1px solid #e7e0d6;color:#2d2620;font-size:14px;text-align:right">${nl2br(r.value)}</td></tr>`,
    )
    .join("");
  const blocks = (opts.blocks ?? [])
    .map(
      (b) =>
        `<div style="margin-top:24px;padding:18px 20px;background:#f5f1ea"><p style="margin:0 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#8a8178">${esc(b.title)}</p><div style="font-size:14px;line-height:1.6;color:#2d2620">${b.html}</div></div>`,
    )
    .join("");
  const cta = opts.cta
    ? `<p style="margin:28px 0 0"><a href="${esc(opts.cta.href)}" style="display:inline-block;background:#2d2620;color:#f5f1ea;text-decoration:none;padding:13px 24px;font-size:12px;letter-spacing:.08em;text-transform:uppercase">${esc(opts.cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f5f1ea;font-family:Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
  <p style="margin:0 0 24px;text-align:center;font-family:Georgia,serif;font-size:22px;color:#2d2620">Fernanda Donoso<br><span style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#8a8178">Asesoría &amp; Gestión Inmobiliaria</span></p>
  <div style="background:#ffffff;padding:32px 28px">
    <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:normal;font-size:26px;line-height:1.2;color:#2d2620">${esc(opts.title)}</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4a423b">${nl2br(opts.intro)}</p>
    ${rows ? `<table style="width:100%;border-collapse:collapse;border-top:1px solid #e7e0d6">${rows}</table>` : ""}
    ${blocks}
    ${cta}
  </div>
  <p style="margin:20px 0 0;text-align:center;font-size:12px;line-height:1.6;color:#8a8178">${opts.footer ? nl2br(opts.footer) : ""}</p>
</div></body></html>`;
}

/** Versión en texto plano del mismo correo. */
export function plain(opts: {
  title: string;
  intro: string;
  rows?: MailRow[];
  blocks?: { title: string; text: string }[];
  cta?: { label: string; href: string };
  footer?: string;
}): string {
  return [
    opts.title,
    "",
    opts.intro,
    "",
    ...(opts.rows ?? []).filter((r) => r.value).map((r) => `${r.label}: ${r.value}`),
    ...(opts.blocks ?? []).flatMap((b) => ["", b.title.toUpperCase(), b.text]),
    opts.cta ? `\n${opts.cta.label}: ${opts.cta.href}` : "",
    "",
    "—",
    "Fernanda Donoso · Asesoría & Gestión Inmobiliaria",
    opts.footer ?? "",
  ]
    .join("\n")
    .trim();
}
