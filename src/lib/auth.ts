export const SESSION_COOKIE = "fgi_session";

export const authEnabled = () => Boolean(process.env.APP_PASSWORD);

export async function sessionToken(): Promise<string> {
  const data = new TextEncoder().encode(`fgi:${process.env.APP_PASSWORD ?? ""}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
