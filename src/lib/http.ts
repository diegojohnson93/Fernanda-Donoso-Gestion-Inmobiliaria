export function errorResponse(e: unknown, status = 500) {
  const message = e instanceof Error ? e.message : String(e);
  console.error(message);
  return Response.json({ error: message }, { status });
}
