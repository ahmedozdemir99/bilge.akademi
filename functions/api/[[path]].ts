interface Env { API_ORIGIN?: string }
/** Cloudflare Pages proxy: paid AI requests remain on a separate secured Node backend. */
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.API_ORIGIN) return Response.json({ error: 'API_ORIGIN ayarlanmamış. AI özellikleri için güvenli Node API sunucusu gerekir.' }, { status: 503 });
  const origin = new URL(env.API_ORIGIN);
  if (origin.protocol !== 'https:') return Response.json({ error: 'API_ORIGIN HTTPS olmalı.' }, { status: 500 });
  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, origin);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('cookie');
  return fetch(new Request(target.toString(), { method: request.method, headers, body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body, redirect: 'manual', duplex: 'half' } as RequestInit));
};