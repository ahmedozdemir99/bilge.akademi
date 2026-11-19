interface PagesEnv {
  GEMINI_API_KEY?: string;
}

interface PagesContext {
  request: Request;
  env: PagesEnv;
  params: { path?: string | string[] };
}

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash-lite';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const ALLOWED_TTS_VOICES = new Set(['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr']);
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function jsonResponse(body: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...(extraHeaders ?? {}),
    },
  });
}

function getApiKey(env: PagesEnv): string | null {
  const key = env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY') return null;
  return key;
}

function formatGeminiError(raw: string): { status: number; message: string; code?: string } {
  if (raw.includes('API_KEY_INVALID') || raw.includes('PERMISSION_DENIED') || raw.includes('403')) {
    return {
      status: 403,
      code: 'AUTH_ERROR',
      message:
        'Gemini API anahtarı geçersiz veya yetkisiz görünüyor. Cloudflare Pages > Settings > Environment variables bölümünden GEMINI_API_KEY değerini kontrol edin.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      status: 429,
      code: 'QUOTA_EXHAUSTED',
      message:
        'Yapay zekâ kullanım kotası geçici olarak doldu. Kısa bir süre sonra tekrar deneyin.',
    };
  }
  if (raw.includes('NOT_FOUND') || raw.includes('404')) {
    return {
      status: 404,
      code: 'MODEL_NOT_FOUND',
      message: 'İstenen yapay zekâ modeli geçici olarak erişilemiyor.',
    };
  }
  return {
    status: 500,
    code: raw.slice(0, 180).replace(/AIza[0-9A-Za-z_-]+/g, '[REDACTED]'),
    message:
      'Yapay zekâ servisine bağlanırken bir hata oluştu. Lütfen birkaç saniye sonra tekrar deneyin.',
  };
}

function isPermanentError(msg: string): boolean {
  return (
    msg.includes('API_KEY_INVALID') ||
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('INVALID_ARGUMENT')
  );
}

interface GeminiRestResult {
  text: string;
}

async function callGeminiModel(
  apiKey: string,
  model: string,
  prompt: string,
  opts: {
    systemInstruction?: string;
    responseMimeType?: string;
    responseSchema?: Record<string, unknown>;
    useLowThinking?: boolean;
  }
): Promise<GeminiRestResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const generationConfig: Record<string, unknown> = {};
  if (opts.responseMimeType) generationConfig.responseMimeType = opts.responseMimeType;
  if (opts.responseSchema) generationConfig.responseSchema = opts.responseSchema;
  if (opts.useLowThinking) {
    generationConfig.thinkingConfig = { thinkingLevel: 'LOW' };
  }

  const payload: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  };
  if (opts.systemInstruction) {
    payload.systemInstruction = { parts: [{ text: opts.systemInstruction }] };
  }
  if (Object.keys(generationConfig).length > 0) {
    payload.generationConfig = generationConfig;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 22000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'aistudio-build',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = (await res.json().catch(() => ({}))) as {
      error?: { message?: string; status?: string; code?: number };
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
      }>;
    };

    if (!res.ok) {
      const errMsg = data.error?.message || data.error?.status || `HTTP ${res.status}`;
      throw new Error(`${res.status} ${errMsg}`);
    }

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .filter((p) => !p.thought && typeof p.text === 'string')
      .map((p) => p.text)
      .join('');

    return { text };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateResilient(
  apiKey: string,
  prompt: string,
  opts: {
    systemInstruction?: string;
    responseMimeType?: string;
    responseSchema?: Record<string, unknown>;
  } = {}
): Promise<GeminiRestResult> {
  try {
    return await callGeminiModel(apiKey, PRIMARY_MODEL, prompt, {
      ...opts,
      useLowThinking: true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (isPermanentError(msg)) {
      throw err;
    }
    return await callGeminiModel(apiKey, FALLBACK_MODEL, prompt, {
      ...opts,
      useLowThinking: false,
    });
  }
}

function safeParseJson<T = Record<string, unknown>>(rawText: string): T {
  const cleaned = (rawText || '{}')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned || '{}') as T;
}

function toArabicIndicNumber(n: number): string {
  return String(n)
    .split('')
    .map((ch) => ARABIC_DIGITS[Number(ch)] ?? ch)
    .join('');
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');

  /* ---------------- HEALTH CHECK ---------------- */
  if (route === 'health' && request.method === 'GET') {
    return jsonResponse({
      ok: true,
      runtime: 'cloudflare-pages',
      aiConfigured: Boolean(getApiKey(env)),
      model: PRIMARY_MODEL,
      fallbackModel: FALLBACK_MODEL,
    });
  }

  /* ---------------- QURAN ARABIC SCRIPT PROXY ---------------- */
  if (route === 'quran/arabic' && request.method === 'GET') {
    const type = String(url.searchParams.get('type') || '');
    const ref = String(url.searchParams.get('ref') || '');
    if (type !== 'surah' && type !== 'ayah') {
      return jsonResponse({ error: 'Geçersiz tür. surah veya ayah bekleniyor.' }, 400);
    }
    if (!/^\d+(:\d+)?$/.test(ref)) {
      return jsonResponse({ error: 'Geçersiz sure/ayet referansı.' }, 400);
    }

    try {
      const endpoint =
        type === 'surah'
          ? `https://api.alquran.cloud/v1/surah/${ref}/quran-uthmani`
          : `https://api.alquran.cloud/v1/ayah/${ref}/quran-uthmani`;
      const upstream = await fetch(endpoint);
      if (!upstream.ok) {
        return jsonResponse({ error: 'Arapça mushaf metni alınamadı.' }, 502);
      }
      const payload = (await upstream.json()) as {
        data?: {
          text?: string;
          ayahs?: Array<{ numberInSurah: number; text: string }>;
        };
      };

      if (type === 'ayah' && payload.data?.text) {
        return jsonResponse(
          { arabicText: payload.data.text.trim() },
          200,
          { 'Cache-Control': 'public, max-age=86400' }
        );
      }

      if (type === 'surah' && Array.isArray(payload.data?.ayahs)) {
        const surahNo = Number(ref);
        const basmalaPrefix = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
        let basmala: string | undefined;
        const formattedAyahs = payload.data.ayahs.map((a, idx) => {
          let text = a.text.trim();
          if (surahNo !== 1 && surahNo !== 9 && idx === 0 && text.startsWith(basmalaPrefix)) {
            basmala = basmalaPrefix;
            text = text.slice(basmalaPrefix.length).trim();
          }
          return `${text} ﴿${toArabicIndicNumber(a.numberInSurah)}﴾`;
        });
        return jsonResponse(
          { arabicText: formattedAyahs.join(' '), basmala },
          200,
          { 'Cache-Control': 'public, max-age=86400' }
        );
      }

      return jsonResponse({ error: 'Beklenmeyen API yanıtı.' }, 502);
    } catch {
      return jsonResponse({ error: 'Arapça metin sunucusuna ulaşılamadı.' }, 502);
    }
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Geçersiz istek yöntemi.' }, 405);
  }

  const apiKey = getApiKey(env);
  if (!apiKey) {
    return jsonResponse(
      {
        error:
          'Cloudflare Pages ortam değişkenlerinde GEMINI_API_KEY tanımlı değil. Lütfen Cloudflare Pages > Settings > Environment variables kısmına GEMINI_API_KEY ekleyip yeniden yayınlayın.',
        code: 'MISSING_API_KEY',
      },
      503
    );
  }

  const body = await readJsonBody(request);

  try {
    /* ---------------- AI TTS ---------------- */
    if (route === 'ai/tts') {
      const { text, voiceName, style } = body;
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return jsonResponse({ error: 'Seslendirilecek metin boş olamaz.' }, 400);
      }
      const cleanText = text.trim().slice(0, 1200);
      const selectedVoice =
        typeof voiceName === 'string' && ALLOWED_TTS_VOICES.has(voiceName) ? voiceName : 'Kore';
      const styleKey = typeof style === 'string' ? style.trim().slice(0, 140) : '';

      const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const ttsRes = await fetch(ttsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'aistudio-build',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                styleKey
                  ? { text: cleanText, speechMetadata: { style: styleKey } }
                  : { text: cleanText },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
            },
          },
        }),
      });

      const ttsData = (await ttsRes.json().catch(() => ({}))) as {
        error?: { message?: string };
        candidates?: Array<{
          content?: {
            parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }>;
          };
        }>;
      };

      if (!ttsRes.ok) {
        throw new Error(`${ttsRes.status} ${ttsData.error?.message || 'TTS Hatası'}`);
      }
      const audioPart = ttsData.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!audioPart?.data) {
        return jsonResponse({ error: 'Ses verisi oluşturulamadı. Lütfen tekrar deneyin.' }, 502);
      }
      return jsonResponse({
        audioBase64: audioPart.data,
        mimeType: audioPart.mimeType || 'audio/wav',
        voiceName: selectedVoice,
      });
    }

    /* ---------------- COMMON AI ASSISTANT ---------------- */
    if (route === 'ai/assistant') {
      const { message, moduleContext, roleView, history } = body;
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return jsonResponse({ error: 'Lütfen bir soru veya talep yazın.' }, 400);
      }
      const safeModule = String(moduleContext || 'Genel Platform').slice(0, 60);
      const safeRole = roleView === 'student' ? 'Öğrenci' : 'Öğretmen';
      const conversationLines = Array.isArray(history)
        ? history
            .slice(-8)
            .map(
              (m: { role?: string; text?: string }) =>
                `${m.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${String(m.text ?? '').slice(0, 800)}`
            )
            .join('\n')
        : '';

      const systemInstruction = `Sen BİLGE AKADEMİ platformunun ortak Türkçe Yapay Zekâ Eğitim Asistanısın.
Kullanıcının mevcut rol görünümü: ${safeRole}.
Kullanıcının bulunduğu modül bağlamı: ${safeModule}.

Görevlerin:
- Türkçe doğal, akıcı ve akademik açıdan özenli bir dille yanıt ver.
- Ders anlat, örnekler sun, çalışma planı öner ve öğretmenlere ders materyali / rubrik / soru taslağı hazırlamada destek ol.
- Öğrenci hakkında kesin psikolojik veya akademik teşhis koyma; yapıcı rehberlik sun.
- Tarihî veya bilimsel konularda kesin kaynak yoksa belirsizliği açıkça ifade et.
- Özel öğrenci verileri sana gönderilmedikçe tahmin yürütme.`;

      const fullPrompt = conversationLines
        ? `Önceki konuşma özeti:\n${conversationLines}\n\nYeni kullanıcı mesajı:\n${message.slice(0, 2000)}`
        : message.slice(0, 2000);

      const res = await generateResilient(apiKey, fullPrompt, { systemInstruction });
      return jsonResponse({ reply: res.text || 'Yanıt oluşturulamadı.' });
    }

    /* ---------------- SOCRATIC DIALOGUE ---------------- */
    if (route === 'ai/socratic-dialogue') {
      const { topic, philosopherPersona, message, history } = body;
      if (!message || typeof message !== 'string') {
        return jsonResponse({ error: 'Lütfen bir düşünce veya argüman yazın.' }, 400);
      }
      const personaText =
        philosopherPersona && philosopherPersona !== 'Sokratik Rehber'
          ? `Tarihî filozof ${String(philosopherPersona).slice(0, 60)} düşünce çizgisini eğitim amaçlı bir simülasyon olarak temsil ediyorsun. Yanıtında bunun tarihî bir simülasyon olduğunu hissettir, dogma dayatma.`
          : 'Tarafsız ve sorgulayıcı bir Sokratik felsefe rehberisin.';

      const historyLines = Array.isArray(history)
        ? history
            .slice(-8)
            .map(
              (m: { role?: string; text?: string }) =>
                `${m.role === 'user' ? 'Katılımcı' : 'Rehber'}: ${String(m.text ?? '').slice(0, 600)}`
            )
            .join('\n')
        : '';

      const prompt = `Felsefi Konu: ${String(topic || 'Bilgi ve Hakikat').slice(0, 120)}
${historyLines ? `Önceki Diyalog:\n${historyLines}\n\n` : ''}Katılımcının Yeni Argümanı: ${message.slice(0, 1500)}`;

      const res = await generateResilient(apiKey, prompt, {
        systemInstruction: `${personaText}
Türkçe yanıt ver. Görevlerin:
1. Katılımcının argümanındaki temel varsayımı nazikçe özetle.
2. Varsa gizli bir çelişkiyi veya sınır durumunu kibar biçimde işaret et.
3. Farklı bir felsefi akımdan kısa bir karşıt bakış açısı sun.
4. Katılımcıyı daha derine düşünmeye davet eden 1–2 güçlü Sokratik soru sor.`,
      });
      return jsonResponse({ reply: res.text || 'Yanıt oluşturulamadı.' });
    }

    /* ---------------- PHILOSOPHER COMPARE ---------------- */
    if (route === 'ai/philosopher-compare') {
      const { philosopherA, philosopherB } = body;
      if (!philosopherA || !philosopherB) {
        return jsonResponse({ error: 'Karşılaştırma için iki filozof seçilmelidir.' }, 400);
      }
      const prompt = `${String(philosopherA).slice(0, 60)} ve ${String(philosopherB).slice(0, 60)} filozoflarını Türkçe olarak şu 5 başlıkta akademik düzeyde karşılaştır:
1. Bilgi anlayışı (epistemoloji)
2. Varlık anlayışı (ontoloji)
3. Ahlak anlayışı (etik)
4. Toplum ve siyaset görüşleri
5. Ortak ve farklı düşünceleri`;

      const res = await generateResilient(apiKey, prompt, {
        systemInstruction: 'Nesnel, akademik ve anlaşılır Türkçe felsefe karşılaştırması yap. Yalnızca JSON döndür.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            epistemology: { type: 'STRING' },
            ontology: { type: 'STRING' },
            ethics: { type: 'STRING' },
            politicsAndSociety: { type: 'STRING' },
            commonalities: { type: 'ARRAY', items: { type: 'STRING' } },
            differences: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: [
            'epistemology',
            'ontology',
            'ethics',
            'politicsAndSociety',
            'commonalities',
            'differences',
          ],
        },
      });
      return jsonResponse({ comparison: safeParseJson(res.text) });
    }

    /* ---------------- MATH SOLVE ---------------- */
    if (route === 'ai/math-solve') {
      const { problem, topic, gradeLevel } = body;
      if (!problem || typeof problem !== 'string' || problem.trim().length < 2) {
        return jsonResponse({ error: 'Lütfen çözülecek bir matematik problemi yazın.' }, 400);
      }
      const prompt = `Sen BİLGE AKADEMİ Ortaokul (5–8. Sınıf & LGS) Matematik Öğretmenisin. Aşağıdaki matematik problemini MEB ortaokul müfredatına uygun 6 aşamalı yöntemle Türkçe çöz.
Matematiksel ifadeler için geçerli LaTeX sözdizimi kullan (ör. 3x + 5 = 20, a^2 + b^2 = c^2, \\sqrt{64} = 8, \\text{EBOB}(36, 48) = 12).
Her adımın hem Türkçe açıklamasını hem de saf LaTeX formülünü (dolar işareti olmadan) ver. Lise düzeyinde kapsam dışı kavramlar (parabol, fonksiyon, türev, integral, trigonometri) kullanma.

Konu: ${String(topic || 'Ortaokul Matematik').slice(0, 60)}
Seviye: ${String(gradeLevel || '8. Sınıf (LGS)').slice(0, 40)}
Problem: ${problem.slice(0, 1200)}`;

      const res = await generateResilient(apiKey, prompt, {
        systemInstruction:
          'İşlem hatası yapma; sonucu mutlaka yerine koyarak doğrula. Saf LaTeX ifadelerini $ veya $$ sarmalayıcısı olmadan latex alanına yaz. Yalnızca JSON döndür.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            analysis: { type: 'STRING' },
            givens: { type: 'ARRAY', items: { type: 'STRING' } },
            targets: { type: 'ARRAY', items: { type: 'STRING' } },
            method: { type: 'STRING' },
            steps: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING' },
                  explanation: { type: 'STRING' },
                  latex: { type: 'STRING' },
                },
                required: ['title', 'explanation', 'latex'],
              },
            },
            finalAnswerLatex: { type: 'STRING' },
            finalAnswerText: { type: 'STRING' },
            verification: { type: 'STRING' },
            alternativeMethod: { type: 'STRING' },
          },
          required: [
            'analysis',
            'givens',
            'targets',
            'method',
            'steps',
            'finalAnswerLatex',
            'finalAnswerText',
            'verification',
            'alternativeMethod',
          ],
        },
      });
      return jsonResponse({ solution: safeParseJson(res.text) });
    }

    /* ---------------- MATH EXERCISE ---------------- */
    if (route === 'ai/math-exercise') {
      const { gradeLevel, topic, difficulty } = body;
      const prompt = `MEB Ortaokul müfredatına (5–8. Sınıf & LGS) tam uyumlu olacak şekilde "${String(gradeLevel || '8. Sınıf (LGS)').slice(0, 30)}" seviyesinde, "${String(topic || 'Birinci Dereceden Denklemler').slice(0, 60)}" konusunda, "${String(difficulty || 'orta').slice(0, 20)}" zorluk derecesinde TEK bir özgün Türkçe matematik alıştırma sorusu üret.
Lise konularına (parabol, fonksiyon, ikinci dereceden denklem, trigonometri) kesinlikle girme.
Cevabı net sayısal veya kısa cebirsel ifade olsun.
Ayrıca öğrenci yanlış cevap verirse aşamalı gösterilecek 3 kademeli ipucu ve eksiksiz adım adım çözüm açıklaması üret.`;

      const res = await generateResilient(apiKey, prompt, {
        systemInstruction:
          'Doğru cevabın kesin doğruluğunu kontrol et. expressionLatex alanına $ işareti olmadan geçerli LaTeX yaz. Yalnızca JSON döndür.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            questionText: { type: 'STRING' },
            expressionLatex: { type: 'STRING' },
            acceptedAnswers: { type: 'ARRAY', items: { type: 'STRING' } },
            answerDisplayLatex: { type: 'STRING' },
            hints: { type: 'ARRAY', items: { type: 'STRING' } },
            fullSolution: { type: 'STRING' },
          },
          required: [
            'questionText',
            'expressionLatex',
            'acceptedAnswers',
            'answerDisplayLatex',
            'hints',
            'fullSolution',
          ],
        },
      });
      return jsonResponse({ exercise: safeParseJson(res.text) });
    }

    /* ---------------- HISTORY TUTOR ---------------- */
    if (route === 'ai/history-tutor') {
      const { mode, level, topic, periodA, periodB } = body;
      const safeLevel = String(level || 'Ortaokul (5–8. Sınıf)').slice(0, 40);
      const prompt =
        mode === 'compare'
          ? `İki tarihî dönemi "${safeLevel}" düzeyinde karşılaştır:
Dönem 1: ${String(periodA || 'Anadolu Selçuklu Devleti').slice(0, 100)}
Dönem 2: ${String(periodB || 'Osmanlı Devleti').slice(0, 100)}
Siyasi yapı, kültür-bilim, ekonomi ve toplumsal dönüşüm eksenlerinde ortak ve farklı yönleri açıkla.`
          : `Şu tarihî olay/konuyu "${safeLevel}" seviyesine uygun biçimde anlat:
Konu: ${String(topic || '').slice(0, 300)}
Nedenler, gelişim süreci, kısa ve uzun vadeli sonuçlar, tarihsel önem ve güvenilir akademik kaynak önerilerini sun.`;

      const res = await generateResilient(apiKey, prompt, {
        systemInstruction:
          'Sen nesnel, bilimsel ve Türkçe çalışan bir tarih öğretmenisin. Kaynaklarla kesin doğrulanmayan veya tarihçiler arasında tartışmalı olan noktaları kesin gerçek gibi sunma; akademik ihtiyatla belirt. Yalnızca JSON şemasına uy.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            overview: { type: 'STRING' },
            causesAndContext: { type: 'ARRAY', items: { type: 'STRING' } },
            keyDevelopments: { type: 'ARRAY', items: { type: 'STRING' } },
            consequences: { type: 'ARRAY', items: { type: 'STRING' } },
            historicalCaution: { type: 'STRING' },
            recommendedSources: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: [
            'title',
            'overview',
            'causesAndContext',
            'keyDevelopments',
            'consequences',
            'historicalCaution',
            'recommendedSources',
          ],
        },
      });
      return jsonResponse({ lesson: safeParseJson(res.text) });
    }

    /* ---------------- POEM ANALYSIS ---------------- */
    if (route === 'ai/poem-analysis') {
      const { title, genre, content, algorithmicSummary } = body;
      if (!content || typeof content !== 'string' || content.trim().length < 5) {
        return jsonResponse({ error: 'Analiz edilecek şiir metni çok kısa.' }, 400);
      }
      const prompt = `Sen deneyimli bir Türk Dili ve Edebiyatı akademisyeni ve şiir eleştirmenisin.
Kullanıcının yazdığı aşağıdaki şiiri Türkçe olarak derinlemesine ancak yapıcı bir dille analiz et.

Şiir Başlığı: ${String(title || 'Başlıksız').slice(0, 120)}
Tür: ${String(genre || 'Genel').slice(0, 50)}
Algoritmik Ön Ölçüm: ${String(algorithmicSummary || 'Yok').slice(0, 400)}

Şiir Metni:
${content.slice(0, 4000)}`;

      const res = await generateResilient(apiKey, prompt, {
        systemInstruction:
          'Türk edebiyatı terminolojisine uygun, yapıcı, şiiri zenginleştirmeye odaklı JSON çıktısı üret. Belirsiz kafiye veya redif durumlarını dürüstçe belirt.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            themeAndEmotion: { type: 'STRING' },
            imageryAnalysis: { type: 'ARRAY', items: { type: 'STRING' } },
            literaryDevices: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  device: { type: 'STRING' },
                  example: { type: 'STRING' },
                  explanation: { type: 'STRING' },
                },
                required: ['device', 'example', 'explanation'],
              },
            },
            rhymeAndRedifComment: { type: 'STRING' },
            meterComment: { type: 'STRING' },
            strengths: { type: 'ARRAY', items: { type: 'STRING' } },
            suggestions: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: [
            'themeAndEmotion',
            'imageryAnalysis',
            'literaryDevices',
            'rhymeAndRedifComment',
            'meterComment',
            'strengths',
            'suggestions',
          ],
        },
      });
      return jsonResponse({ analysis: safeParseJson(res.text) });
    }

    /* ---------------- POEM GENERATE ---------------- */
    if (route === 'ai/poem-generate') {
      const { theme, genre, emotion, lineCount, syllableMeter, rhymeScheme } = body;
      const lines = Math.max(4, Math.min(24, Number(lineCount) || 8));
      const prompt = `Aşağıdaki ölçütlere uygun, tamamen özgün, edebi değeri yüksek Türkçe bir şiir yaz.
Hiçbir şairin telifli metnini kopyalama.

Tema: ${String(theme || 'Doğa ve Zaman').slice(0, 80)}
Şiir Türü: ${String(genre || 'Lirik').slice(0, 40)}
Ana Duygu: ${String(emotion || 'Umut ve Huzur').slice(0, 60)}
Dize Sayısı: ${lines} dize
Hece Ölçüsü Hedefi: ${String(syllableMeter || '11li hece ölçüsü').slice(0, 40)}
Kafiye Düzeni Hedefi: ${String(rhymeScheme || 'abab (Çapraz)').slice(0, 40)}

Her dizenin hece sayısını seçilen ölçüye mümkün olduğunca tam uydur.`;

      const res = await generateResilient(apiKey, prompt, {
        systemInstruction: 'Yalnızca JSON şemasına uygun özgün Türkçe şiir ve kısa edebi not üret.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            poem: { type: 'STRING' },
            poeticNote: { type: 'STRING' },
          },
          required: ['title', 'poem', 'poeticNote'],
        },
      });
      return jsonResponse({ result: safeParseJson(res.text) });
    }

    /* ---------------- STUDENT ANALYSIS ---------------- */
    if (route === 'ai/student-analysis') {
      const { anonymousCode, gradeLevel, subjectAverages, recentGrades, attendanceSummary } = body;
      if (!anonymousCode || !Array.isArray(subjectAverages)) {
        return jsonResponse({ error: 'Geçersiz analiz isteği. Anonim öğrenci akademik verileri eksik.' }, 400);
      }
      const att = (attendanceSummary ?? {}) as Record<string, unknown>;
      const prompt = `Sen BİLGE AKADEMİ eğitim platformunun deneyimli bir eğitim danışmanı ve ölçme-değerlendirme uzmanısın.
Aşağıdaki tamamen anonimleştirilmiş öğrenci akademik verilerini Türkçe olarak analiz et.

Anonim Öğrenci Kodu: ${String(anonymousCode).slice(0, 32)}
Sınıf Seviyesi: ${Number(gradeLevel) || 'Belirtilmedi'}. Sınıf
Ders Bazlı Ortalamalar:
${subjectAverages
  .slice(0, 20)
  .map(
    (s: { subject?: string; average?: number; count?: number }) =>
      `- ${String(s.subject ?? '').slice(0, 60)}: ${Number(s.average ?? 0).toFixed(1)} (${Number(s.count ?? 0)} sınav)`
  )
  .join('\n')}

Son Sınav Seyri:
${
  (Array.isArray(recentGrades) ? recentGrades.slice(0, 15) : [])
    .map(
      (g: { date?: string; subject?: string; examType?: string; score?: number; maxScore?: number }) =>
        `- ${String(g.date ?? '').slice(0, 10)} | ${String(g.subject ?? '').slice(0, 40)} (${String(g.examType ?? '').slice(0, 20)}): ${Number(g.score ?? 0)}/${Number(g.maxScore ?? 100)}`
    )
    .join('\n') || 'Henüz sınav kaydı bulunmuyor.'
}

Devam Özeti: Katılım ${Number(att.present || 0)}, Mazeretli ${Number(att.excused || 0)}, Mazeretsiz ${Number(att.unexcused || 0)}, Geç ${Number(att.late || 0)}.`;

      const res = await generateResilient(apiKey, prompt, {
        systemInstruction:
          'Yalnızca istenen JSON şemasına uygun, yapıcı, bilimsel ve Türkçe pedagojik değerlendirme üret. Kesin tanı veya yargılayıcı ifadeler kullanma.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            summary: { type: 'STRING' },
            strengths: { type: 'ARRAY', items: { type: 'STRING' } },
            growthAreas: { type: 'ARRAY', items: { type: 'STRING' } },
            studyRecommendations: { type: 'ARRAY', items: { type: 'STRING' } },
            attendanceNote: { type: 'STRING' },
            pedagogicalDisclaimer: { type: 'STRING' },
          },
          required: [
            'summary',
            'strengths',
            'growthAreas',
            'studyRecommendations',
            'attendanceNote',
            'pedagogicalDisclaimer',
          ],
        },
      });
      return jsonResponse({ analysis: safeParseJson(res.text) });
    }

    /* ---------------- CLASS ANALYSIS ---------------- */
    if (route === 'ai/class-analysis') {
      const { className, gradeLevel, studentCount, overallAverage, subjectBreakdown, attendanceTotals } = body;
      if (!className || !Array.isArray(subjectBreakdown)) {
        return jsonResponse({ error: 'Sınıf analizi için gerekli özet veriler eksik.' }, 400);
      }
      const att = (attendanceTotals ?? {}) as Record<string, unknown>;
      const prompt = `Sen BİLGE AKADEMİ platformunun eğitim koordinatörüsün. Aşağıdaki toplulaştırılmış ve anonim sınıf verilerini inceleyerek öğretmene sınıf genelinde gelişim önerileri sun.

Sınıf: ${String(className).slice(0, 60)} (${Number(gradeLevel) || '?'}. Sınıf)
Öğrenci Sayısı: ${Number(studentCount) || 0}
Genel Not Ortalaması: ${Number(overallAverage || 0).toFixed(1)}

Ders Dağılımı:
${subjectBreakdown
  .slice(0, 20)
  .map(
    (item: { subject?: string; average?: number; examCount?: number }) =>
      `- ${String(item.subject ?? '').slice(0, 60)}: ${Number(item.average ?? 0).toFixed(1)} (${Number(item.examCount ?? 0)} not kaydı)`
  )
  .join('\n')}

Toplam Devam Özeti: Katılım ${Number(att.present || 0)}, Mazeretli ${Number(att.excused || 0)}, Mazeretsiz ${Number(att.unexcused || 0)}, Geç ${Number(att.late || 0)}.`;

      const res = await generateResilient(apiKey, prompt, {
        systemInstruction:
          'Öğretmene yönelik, somut, yapıcı, Türkçe pedagojik sınıf raporu üret. Yalnızca JSON şemasına uy.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            overview: { type: 'STRING' },
            strongSubjects: { type: 'ARRAY', items: { type: 'STRING' } },
            focusSubjects: { type: 'ARRAY', items: { type: 'STRING' } },
            teachingStrategies: { type: 'ARRAY', items: { type: 'STRING' } },
            disclaimer: { type: 'STRING' },
          },
          required: ['overview', 'strongSubjects', 'focusSubjects', 'teachingStrategies', 'disclaimer'],
        },
      });
      return jsonResponse({ analysis: safeParseJson(res.text) });
    }

    return jsonResponse({ error: `Bilinmeyen API uç noktası: /api/${route}` }, 404);
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    const formatted = formatGeminiError(raw);
    return jsonResponse({ error: formatted.message, code: formatted.code }, formatted.status);
  }
}
