import assert from 'node:assert/strict';
import { onRequest } from '../../functions/api/[[path]]';

function createContext(
  url: string,
  init: RequestInit = {},
  env: { GEMINI_API_KEY?: string } = {}
) {
  return {
    request: new Request(url, init),
    env,
    params: {},
  };
}

async function runTests() {
  const originalFetch = globalThis.fetch;

  try {
    // 1. Health endpoint without API key
    const healthMissing = await onRequest(
      createContext('https://bilgeakademi.pages.dev/api/health', { method: 'GET' }, {})
    );
    assert.equal(healthMissing.status, 200);
    const healthMissingBody = (await healthMissing.json()) as Record<string, unknown>;
    assert.equal(healthMissingBody.ok, true);
    assert.equal(healthMissingBody.runtime, 'cloudflare-pages');
    assert.equal(healthMissingBody.aiConfigured, false);
    assert.equal(healthMissingBody.model, 'gemini-4-hydrogen');
    assert.equal(healthMissingBody.fallbackModel, 'gemini-3.1-flash-lite');

    // 2. Health endpoint with API key (must NOT leak key)
    const fakeSecretKey = 'AIzaSyTEST_HEALTH_KEY_DO_NOT_LEAK_0001';
    const healthOk = await onRequest(
      createContext(
        'https://bilgeakademi.pages.dev/api/health',
        { method: 'GET' },
        { GEMINI_API_KEY: fakeSecretKey }
      )
    );
    assert.equal(healthOk.status, 200);
    const healthOkText = await healthOk.text();
    assert.equal(healthOkText.includes(fakeSecretKey), false);
    const healthOkBody = JSON.parse(healthOkText) as Record<string, unknown>;
    assert.equal(healthOkBody.aiConfigured, true);

    // 3. Missing GEMINI_API_KEY returns 503 MISSING_API_KEY
    const missingKeyRes = await onRequest(
      createContext(
        'https://bilgeakademi.pages.dev/api/ai/assistant',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Merhaba' }),
        },
        {}
      )
    );
    assert.equal(missingKeyRes.status, 503);
    const missingKeyBody = (await missingKeyRes.json()) as { code?: string; error?: string };
    assert.equal(missingKeyBody.code, 'MISSING_API_KEY');
    assert.ok(missingKeyBody.error?.includes('GEMINI_API_KEY'));

    // 4. Primary Flash model succeeds directly
    const calledUrlsPrimary: string[] = [];
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      calledUrlsPrimary.push(url);
      return new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'Merhaba öğrenci!' }] } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const primaryRes = await onRequest(
      createContext(
        'https://bilgeakademi.pages.dev/api/ai/assistant',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Fotosentez nedir?' }),
        },
        { GEMINI_API_KEY: 'AIzaSyTEST_PRIMARY_KEY_0002' }
      )
    );
    assert.equal(primaryRes.status, 200);
    const primaryBody = (await primaryRes.json()) as { reply?: string };
    assert.equal(primaryBody.reply, 'Merhaba öğrenci!');
    assert.equal(calledUrlsPrimary.length, 1);
    assert.ok(calledUrlsPrimary[0].includes('/models/gemini-4-hydrogen:generateContent'));

    // 5. Fallback to Flash-Lite when Primary hits 429 quota
    const calledUrlsFallback: string[] = [];
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      calledUrlsFallback.push(url);
      if (url.includes('gemini-4-hydrogen')) {
        return new Response(
          JSON.stringify({ error: { status: 'RESOURCE_EXHAUSTED', message: 'Quota exceeded' } }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'Yedek Flash-Lite yanıtı' }] } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const fallbackRes = await onRequest(
      createContext(
        'https://bilgeakademi.pages.dev/api/ai/assistant',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Kareköklü sayılar' }),
        },
        { GEMINI_API_KEY: 'AIzaSyTEST_FALLBACK_KEY_0003' }
      )
    );
    assert.equal(fallbackRes.status, 200);
    const fallbackBody = (await fallbackRes.json()) as { reply?: string };
    assert.equal(fallbackBody.reply, 'Yedek Flash-Lite yanıtı');
    assert.equal(calledUrlsFallback.length, 2);
    assert.ok(calledUrlsFallback[1].includes('/models/gemini-3.1-flash-lite:generateContent'));

    // 6. Dynamic discovery when static IDs return 404 on external API key
    const calledUrlsDiscovery: string[] = [];
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      calledUrlsDiscovery.push(url);
      if (url.includes('/v1beta/models?')) {
        return new Response(
          JSON.stringify({
            models: [
              { name: 'models/gemini-1.5-flash', supportedGenerationMethods: ['generateContent'] },
              { name: 'models/gemini-3-flash-preview', supportedGenerationMethods: ['generateContent'] },
              { name: 'models/gemini-flash-lite-latest', supportedGenerationMethods: ['generateContent'] },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (url.includes('gemini-3-flash-preview:generateContent')) {
        return new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: 'Keşfedilen Flash modeli çalıştı!' }] } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: { status: 'NOT_FOUND', message: 'Model is not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const discoveredRes = await onRequest(
      createContext(
        'https://bilgeakademi.pages.dev/api/ai/assistant',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Malazgirt Savaşı' }),
        },
        { GEMINI_API_KEY: 'AIzaSyTEST_DISCOVERY_KEY_0004' }
      )
    );
    assert.equal(discoveredRes.status, 200);
    const discoveredBody = (await discoveredRes.json()) as { reply?: string };
    assert.equal(discoveredBody.reply, 'Keşfedilen Flash modeli çalıştı!');
    assert.ok(calledUrlsDiscovery.some((u) => u.includes('/v1beta/models?')));
    assert.ok(calledUrlsDiscovery.some((u) => u.includes('gemini-3-flash-preview:generateContent')));

    // 7. Error mapping: 404 MODEL_NOT_FOUND when all models unavailable
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ error: { status: 'NOT_FOUND', message: 'Model not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )) as typeof fetch;

    const notFoundRes = await onRequest(
      createContext(
        'https://bilgeakademi.pages.dev/api/ai/assistant',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Test 404' }),
        },
        { GEMINI_API_KEY: 'AIzaSyTEST_404_KEY_0005' }
      )
    );
    assert.equal(notFoundRes.status, 404);
    const notFoundBody = (await notFoundRes.json()) as { code?: string; error?: string };
    assert.equal(notFoundBody.code, 'MODEL_NOT_FOUND');
    assert.ok(notFoundBody.error?.includes('modeli bulunamadı'));

    // 8. Error mapping: 429 QUOTA_EXHAUSTED
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ error: { status: 'RESOURCE_EXHAUSTED', message: 'Quota exceeded' } }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )) as typeof fetch;

    const quotaRes = await onRequest(
      createContext(
        'https://bilgeakademi.pages.dev/api/ai/assistant',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Test 429' }),
        },
        { GEMINI_API_KEY: 'AIzaSyTEST_429_KEY_0006' }
      )
    );
    assert.equal(quotaRes.status, 429);
    const quotaBody = (await quotaRes.json()) as { code?: string; error?: string };
    assert.equal(quotaBody.code, 'QUOTA_EXHAUSTED');
    assert.ok(quotaBody.error?.includes('kotası'));

    // 9. Error mapping: 504 TIMEOUT on AbortError
    globalThis.fetch = (async () => {
      const abortErr = new Error('The operation was aborted');
      abortErr.name = 'AbortError';
      throw abortErr;
    }) as typeof fetch;

    const timeoutRes = await onRequest(
      createContext(
        'https://bilgeakademi.pages.dev/api/ai/assistant',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Test timeout' }),
        },
        { GEMINI_API_KEY: 'AIzaSyTEST_TIMEOUT_KEY_0007' }
      )
    );
    assert.equal(timeoutRes.status, 504);
    const timeoutBody = (await timeoutRes.json()) as { code?: string; error?: string };
    assert.equal(timeoutBody.code, 'TIMEOUT');
    assert.ok(timeoutBody.error?.includes('zaman aşımına'));

    console.log('Cloudflare Pages API tests: 9/9 passed.');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

runTests().catch((err) => {
  console.error('Cloudflare Pages API test failed:', err);
  process.exit(1);
});
