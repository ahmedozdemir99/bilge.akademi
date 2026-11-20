import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { onRequest as handlePagesApi } from './functions/api/[[path]].ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1.5mb' }));

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-3.8-flash';
const FALLBACK_MODEL_NAME = 'gemini-3.5-flash-lite';

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getGenAITtsClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(error: unknown): { status: number; message: string; code?: string } {
  const raw = error instanceof Error ? error.message : String(error);
  console.error('[BİLGE AKADEMİ Gemini Hatası]:', raw.slice(0, 600));
  if (raw.includes('API_KEY_INVALID') || raw.includes('PERMISSION_DENIED') || raw.includes('403')) {
    return {
      status: 403,
      code: 'AUTH_ERROR',
      message:
        'Gemini API anahtarı geçersiz veya yetkisiz görünüyor. Lütfen Ayarlar > Gizli Anahtarlar (Secrets) panelinden API anahtarınızı kontrol edin.',
    };
  }
  if (
    (error instanceof Error && error.name === 'AbortError') ||
    raw.includes('GEMINI_TIMEOUT') ||
    raw.includes('DEADLINE_EXCEEDED') ||
    raw.includes('504')
  ) {
    return {
      status: 504,
      code: 'TIMEOUT',
      message:
        'Yapay zekâ isteği zaman aşımına uğradı. Lütfen sorunuzu kısaltıp birkaç saniye sonra tekrar deneyin.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      status: 429,
      code: 'QUOTA_EXHAUSTED',
      message:
        'Yapay zekâ kullanım kotası geçici olarak doldu. Lütfen kısa bir süre bekleyip tekrar deneyin.',
    };
  }
  if (raw.includes('NOT_FOUND') || raw.includes('404')) {
    return {
      status: 404,
      code: 'MODEL_NOT_FOUND',
      message:
        'İstenen yapay zekâ modeli bulunamadı veya şu anda erişilemiyor. Lütfen daha sonra tekrar deneyin.',
    };
  }
  return {
    status: 500,
    code: raw.slice(0, 180).replace(/AIza[0-9A-Za-z_-]+/g, '[REDACTED]'),
    message:
      'Yapay zekâ servisine bağlanırken bir hata oluştu. Lütfen birkaç saniye sonra tekrar deneyin.',
  };
}

function isPermanentGeminiError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('API_KEY_INVALID') ||
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('INVALID_ARGUMENT')
  );
}

async function withGeminiRetry<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (isPermanentGeminiError(err) || attempt === maxAttempts) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 450 * attempt));
    }
  }
  throw lastError;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 24000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('GEMINI_TIMEOUT: Yanıt süresi aşıldı.')), timeoutMs);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function generateResilientContent(
  ai: GoogleGenAI,
  contents: string,
  config?: Record<string, unknown>
) {
  const primaryConfig = {
    ...(config ?? {}),
    thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
  };
  try {
    return await withGeminiRetry(
      () =>
        withTimeout(
          ai.models.generateContent({
            model: MODEL_NAME,
            contents,
            config: primaryConfig,
          }),
          22000
        ),
      2
    );
  } catch (primaryErr) {
    if (isPermanentGeminiError(primaryErr)) {
      throw primaryErr;
    }
    const rawMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
    console.warn(`[BİLGE AKADEMİ] ${MODEL_NAME} geçici hata (${rawMsg.slice(0, 120)}), ${FALLBACK_MODEL_NAME} ile deneniyor...`);
    return await withGeminiRetry(
      () =>
        withTimeout(
          ai.models.generateContent({
            model: FALLBACK_MODEL_NAME,
            contents,
            config: config ?? {},
          }),
          22000
        ),
      2
    );
  }
}

function safeParseJson<T = Record<string, unknown>>(rawText: string | undefined): T {
  const cleaned = (rawText ?? '{}')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned || '{}') as T;
}

function ensureClient(res: express.Response): GoogleGenAI | null {
  const ai = getGenAIClient();
  if (!ai) {
    res.status(503).json({
      error:
        'Gemini API anahtarı sunucuda yapılandırılmamış. Sunucu ortam değişkenlerinde GEMINI_API_KEY tanımlı olduğunda canlı yapay zekâ özellikleri çalışır.',
    });
    return null;
  }
  return ai;
}

app.get('/api/health', (_req, res) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const hasKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
  res.set('Cache-Control', 'no-store');
  res.json({
    ok: true,
    runtime: 'node-express',
    aiConfigured: hasKey,
    model: MODEL_NAME,
    fallbackModel: FALLBACK_MODEL_NAME,
    ttsModel: 'gemini-3.8-flash-lite-tts',
  });
});

app.post('/api/ai/connection', async (_req, res) => {
  const result = await handlePagesApi({
    request: new Request('http://localhost/api/ai/connection', { method: 'POST' }),
    env: { GEMINI_API_KEY: process.env.GEMINI_API_KEY },
    params: {},
  });
  res.set('Cache-Control', 'no-store').status(result.status).json(await result.json());
});

/* ---------------- MODULE 1: STUDENT & CLASS AI ANALYSIS ---------------- */

app.post('/api/ai/student-analysis', async (req, res) => {
  const ai = ensureClient(res);
  if (!ai) return;

  const { anonymousCode, gradeLevel, subjectAverages, recentGrades, attendanceSummary } = req.body ?? {};
  if (!anonymousCode || !Array.isArray(subjectAverages)) {
    res.status(400).json({ error: 'Geçersiz analiz isteği. Anonim öğrenci akademik verileri eksik.' });
    return;
  }

  const sanitizedPrompt = `
Sen BİLGE AKADEMİ eğitim platformunun deneyimli bir eğitim danışmanı ve ölçme-değerlendirme uzmanısın.
Aşağıdaki tamamen anonimleştirilmiş öğrenci akademik verilerini Türkçe olarak analiz et.

ÖNEMLİ PEDAGOJİK KURALLAR:
- Değerlendirmelerini kesin teşhis, etiketleme veya değişmez yargılar olarak SUNMA.
- Yapıcı, destekleyici, somut ve gözlemlere dayalı bir eğitim dili kullan.
- Tüm yanıt tamamen Türkçe olsun.

Anonim Öğrenci Kodu: ${String(anonymousCode).slice(0, 32)}
Sınıf Seviyesi: ${Number(gradeLevel) || 'Belirtilmedi'}. Sınıf
Ders Bazlı Ortalamalar:
${subjectAverages
  .slice(0, 20)
  .map((s: { subject: string; average: number; count: number }) => `- ${String(s.subject).slice(0, 60)}: ${Number(s.average).toFixed(1)} (${Number(s.count)} sınav)`)
  .join('\n')}

Son Sınav Seyri:
${(Array.isArray(recentGrades) ? recentGrades.slice(0, 15) : [])
  .map((g: { date: string; subject: string; examType: string; score: number; maxScore: number }) => `- ${String(g.date).slice(0, 10)} | ${String(g.subject).slice(0, 40)} (${String(g.examType).slice(0, 20)}): ${Number(g.score)}/${Number(g.maxScore)}`)
  .join('\n') || 'Henüz sınav kaydı bulunmuyor.'}

Devam Özeti:
- Katılım: ${Number(attendanceSummary?.present || 0)} gün
- Mazeretli Devamsızlık: ${Number(attendanceSummary?.excused || 0)} gün
- Mazeretsiz Devamsızlık: ${Number(attendanceSummary?.unexcused || 0)} gün
- Geç Kalma: ${Number(attendanceSummary?.late || 0)} gün
`;

  try {
    const response = await generateResilientContent(ai, sanitizedPrompt, {
      systemInstruction:
        'Yalnızca istenen JSON şemasına uygun, yapıcı, bilimsel ve Türkçe pedagojik değerlendirme üret. Kesin tanı veya yargılayıcı ifadeler kullanma.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          growthAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
          studyRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          attendanceNote: { type: Type.STRING },
          pedagogicalDisclaimer: { type: Type.STRING },
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
    res.json({ analysis: safeParseJson(response.text) });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

app.post('/api/ai/class-analysis', async (req, res) => {
  const ai = ensureClient(res);
  if (!ai) return;

  const { className, gradeLevel, studentCount, overallAverage, subjectBreakdown, attendanceTotals } =
    req.body ?? {};
  if (!className || !Array.isArray(subjectBreakdown)) {
    res.status(400).json({ error: 'Sınıf analizi için gerekli özet veriler eksik.' });
    return;
  }

  const prompt = `
Sen BİLGE AKADEMİ platformunun eğitim koordinatörüsün. Aşağıdaki toplulaştırılmış ve anonim sınıf verilerini inceleyerek öğretmene sınıf genelinde gelişim önerileri sun.
Kesin yargılar yerine pedagojik stratejiler ve uygulanabilir sınıf içi etkinlikler öner.

Sınıf: ${String(className).slice(0, 60)} (${Number(gradeLevel) || '?'}. Sınıf)
Öğrenci Sayısı: ${Number(studentCount) || 0}
Genel Not Ortalaması: ${Number(overallAverage || 0).toFixed(1)}

Ders Dağılımı:
${subjectBreakdown
  .slice(0, 20)
  .map((item: { subject: string; average: number; examCount: number }) => `- ${String(item.subject).slice(0, 60)}: ${Number(item.average).toFixed(1)} (${Number(item.examCount)} not kaydı)`)
  .join('\n')}

Toplam Devam Özeti: Katılım ${Number(attendanceTotals?.present || 0)}, Mazeretli ${Number(attendanceTotals?.excused || 0)}, Mazeretsiz ${Number(attendanceTotals?.unexcused || 0)}, Geç ${Number(attendanceTotals?.late || 0)}.
`;

  try {
    const response = await generateResilientContent(ai, prompt, {
      systemInstruction:
        'Öğretmene yönelik, somut, yapıcı, Türkçe pedagojik sınıf raporu üret. Yalnızca JSON şemasına uy.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING },
          strongSubjects: { type: Type.ARRAY, items: { type: Type.STRING } },
          focusSubjects: { type: Type.ARRAY, items: { type: Type.STRING } },
          teachingStrategies: { type: Type.ARRAY, items: { type: Type.STRING } },
          disclaimer: { type: Type.STRING },
        },
        required: ['overview', 'strongSubjects', 'focusSubjects', 'teachingStrategies', 'disclaimer'],
      },
    });
    res.json({ analysis: safeParseJson(response.text) });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

/* ---------------- MODULE 2: POETRY & LITERATURE ---------------- */

app.post('/api/ai/poem-analysis', async (req, res) => {
  const ai = ensureClient(res);
  if (!ai) return;

  const { title, genre, content, algorithmicSummary } = req.body ?? {};
  if (!content || typeof content !== 'string' || content.trim().length < 5) {
    res.status(400).json({ error: 'Analiz edilecek şiir metni çok kısa.' });
    return;
  }

  const prompt = `
Sen deneyimli bir Türk Dili ve Edebiyatı akademisyeni ve şiir eleştirmenisin.
Kullanıcının yazdığı aşağıdaki şiiri Türkçe olarak derinlemesine ancak yapıcı bir dille analiz et.

Şiir Başlığı: ${String(title || 'Başlıksız').slice(0, 120)}
Tür: ${String(genre || 'Genel').slice(0, 50)}
Algoritmik Ön Ölçüm: ${String(algorithmicSummary || 'Yok').slice(0, 400)}

Şiir Metni:
${content.slice(0, 4000)}
`;

  try {
    const response = await generateResilientContent(ai, prompt, {
      systemInstruction:
        'Türk edebiyatı terminolojisine uygun, yapıcı, şiiri zenginleştirmeye odaklı JSON çıktısı üret. Belirsiz kafiye veya redif durumlarını dürüstçe belirt.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          themeAndEmotion: { type: Type.STRING },
          imageryAnalysis: { type: Type.ARRAY, items: { type: Type.STRING } },
          literaryDevices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                device: { type: Type.STRING },
                example: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['device', 'example', 'explanation'],
            },
          },
          rhymeAndRedifComment: { type: Type.STRING },
          meterComment: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
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
    res.json({ analysis: safeParseJson(response.text) });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

app.post('/api/ai/poem-generate', async (req, res) => {
  const ai = ensureClient(res);
  if (!ai) return;

  const { theme, genre, emotion, lineCount, syllableMeter, rhymeScheme } = req.body ?? {};
  const lines = Math.max(4, Math.min(24, Number(lineCount) || 8));

  const prompt = `
Aşağıdaki ölçütlere uygun, tamamen özgün, edebi değeri yüksek Türkçe bir şiir yaz.
Hiçbir şairin telifli metnini kopyalama.

Tema: ${String(theme || 'Doğa ve Zaman').slice(0, 80)}
Şiir Türü: ${String(genre || 'Lirik').slice(0, 40)}
Ana Duygu: ${String(emotion || 'Umut ve Huzur').slice(0, 60)}
Dize Sayısı: ${lines} dize
Hece Ölçüsü Hedefi: ${String(syllableMeter || '11li hece ölçüsü').slice(0, 40)}
Kafiye Düzeni Hedefi: ${String(rhymeScheme || 'abab (Çapraz)').slice(0, 40)}

Her dizenin hece sayısını seçilen ölçüye mümkün olduğunca tam uydur.
`;

  try {
    const response = await generateResilientContent(ai, prompt, {
      systemInstruction: 'Yalnızca JSON şemasına uygun özgün Türkçe şiir ve kısa edebi not üret.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          poem: { type: Type.STRING },
          poeticNote: { type: Type.STRING },
        },
        required: ['title', 'poem', 'poeticNote'],
      },
    });
    res.json({ result: safeParseJson(response.text) });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

/* ---------------- MODULE 3: INTERACTIVE HISTORY ATLAS ---------------- */

app.post('/api/ai/history-tutor', async (req, res) => {
  const ai = ensureClient(res);
  if (!ai) return;

  const { mode, level, topic, periodA, periodB } = req.body ?? {};
  const safeLevel = String(level || 'Ortaokul (5–8. Sınıf)').slice(0, 40);

  let prompt = '';
  if (mode === 'compare') {
    prompt = `İki tarihî dönemi "${safeLevel}" düzeyinde karşılaştır:
Dönem 1: ${String(periodA || 'Anadolu Selçuklu Devleti').slice(0, 100)}
Dönem 2: ${String(periodB || 'Osmanlı Devleti').slice(0, 100)}
Siyasi yapı, kültür-bilim, ekonomi ve toplumsal dönüşüm eksenlerinde ortak ve farklı yönleri açıkla.`;
  } else {
    prompt = `Şu tarihî olay/konuyu "${safeLevel}" seviyesine uygun biçimde anlat:
Konu: ${String(topic || '').slice(0, 300)}
Nedenler, gelişim süreci, kısa ve uzun vadeli sonuçlar, tarihsel önem ve güvenilir akademik kaynak önerilerini sun.`;
  }

  try {
    const response = await generateResilientContent(ai, prompt, {
      systemInstruction:
        'Sen nesnel, bilimsel ve Türkçe çalışan bir tarih öğretmenisin. Kaynaklarla kesin doğrulanmayan veya tarihçiler arasında tartışmalı olan noktaları kesin gerçek gibi sunma; akademik ihtiyatla belirt. Yalnızca JSON şemasına uy.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          overview: { type: Type.STRING },
          causesAndContext: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyDevelopments: { type: Type.ARRAY, items: { type: Type.STRING } },
          consequences: { type: Type.ARRAY, items: { type: Type.STRING } },
          historicalCaution: { type: Type.STRING },
          recommendedSources: { type: Type.ARRAY, items: { type: Type.STRING } },
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
    res.json({ lesson: safeParseJson(response.text) });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

/* ---------------- MODULE 4: AI MATH TUTOR ---------------- */

app.post('/api/ai/math-solve', async (req, res) => {
  const ai = ensureClient(res);
  if (!ai) return;

  const { problem, topic, gradeLevel } = req.body ?? {};
  if (!problem || typeof problem !== 'string' || problem.trim().length < 2) {
    res.status(400).json({ error: 'Lütfen çözülecek bir matematik problemi yazın.' });
    return;
  }

  const prompt = `
Sen BİLGE AKADEMİ Ortaokul (5–8. Sınıf & LGS) Matematik Öğretmenisin. Aşağıdaki matematik problemini MEB ortaokul müfredatına uygun 6 aşamalı yöntemle Türkçe çöz.
Matematiksel ifadeler için geçerli LaTeX sözdizimi kullan (ör. 3x + 5 = 20, a^2 + b^2 = c^2, \\sqrt{64} = 8, \\text{EBOB}(36, 48) = 12).
Her adımın hem Türkçe açıklamasını hem de saf LaTeX formülünü (dolar işareti olmadan) ver. Lise düzeyinde kapsam dışı kavramlar (parabol, fonksiyon, türev, integral, trigonometri) kullanma.

Konu: ${String(topic || 'Ortaokul Matematik').slice(0, 60)}
Seviye: ${String(gradeLevel || '8. Sınıf (LGS)').slice(0, 40)}
Problem: ${problem.slice(0, 1200)}
`;

  try {
    const response = await generateResilientContent(ai, prompt, {
      systemInstruction:
        'İşlem hatası yapma; sonucu mutlaka yerine koyarak doğrula. Saf LaTeX ifadelerini $ veya $$ sarmalayıcısı olmadan latex alanına yaz. Yalnızca JSON döndür.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          givens: { type: Type.ARRAY, items: { type: Type.STRING } },
          targets: { type: Type.ARRAY, items: { type: Type.STRING } },
          method: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                latex: { type: Type.STRING },
              },
              required: ['title', 'explanation', 'latex'],
            },
          },
          finalAnswerLatex: { type: Type.STRING },
          finalAnswerText: { type: Type.STRING },
          verification: { type: Type.STRING },
          alternativeMethod: { type: Type.STRING },
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
    res.json({ solution: safeParseJson(response.text) });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

app.post('/api/ai/math-exercise', async (req, res) => {
  const ai = ensureClient(res);
  if (!ai) return;

  const { gradeLevel, topic, difficulty } = req.body ?? {};

  const prompt = `
MEB Ortaokul müfredatına (5–8. Sınıf & LGS) tam uyumlu olacak şekilde "${String(gradeLevel || '8. Sınıf (LGS)').slice(0, 30)}" seviyesinde, "${String(topic || 'Birinci Dereceden Denklemler').slice(0, 60)}" konusunda, "${String(difficulty || 'orta').slice(0, 20)}" zorluk derecesinde TEK bir özgün Türkçe matematik alıştırma sorusu üret.
Lise konularına (parabol, fonksiyon, ikinci dereceden denklem, trigonometri) kesinlikle girme.
Cevabı net sayısal veya kısa cebirsel ifade olsun.
Ayrıca öğrenci yanlış cevap verirse aşamalı gösterilecek 3 kademeli ipucu (1. ipucu genel yönlendirme, 2. ipucu formül/yöntem, 3. ipucu son adıma yaklaştıran rehberlik) ve eksiksiz adım adım çözüm açıklaması üret.
`;

  try {
    const response = await generateResilientContent(ai, prompt, {
      systemInstruction:
        'Doğru cevabın kesin doğruluğunu kontrol et. expressionLatex alanına $ işareti olmadan geçerli LaTeX yaz. Yalnızca JSON döndür.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questionText: { type: Type.STRING },
          expressionLatex: { type: Type.STRING },
          acceptedAnswers: { type: Type.ARRAY, items: { type: Type.STRING } },
          answerDisplayLatex: { type: Type.STRING },
          hints: { type: Type.ARRAY, items: { type: Type.STRING } },
          fullSolution: { type: Type.STRING },
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
    res.json({ exercise: safeParseJson(response.text) });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

/* ---------------- MODULE 5: PHILOSOPHY ACADEMY ---------------- */

app.post('/api/ai/socratic-dialogue', async (req, res) => {
  const ai = ensureClient(res);
  if (!ai) return;

  const { topic, philosopherPersona, message, history } = req.body ?? {};
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Lütfen bir düşünce veya argüman yazın.' });
    return;
  }

  const personaText = philosopherPersona && philosopherPersona !== 'Sokratik Rehber'
    ? `Tarihî filozof ${String(philosopherPersona).slice(0, 60)} düşünce çizgisini eğitim amaçlı bir simülasyon olarak temsil ediyorsun. Yanıtında bunun tarihî bir simülasyon olduğunu hissettir, dogma dayatma.`
    : 'Tarafsız ve sorgulayıcı bir Sokratik felsefe rehberisin.';

  const historyLines = Array.isArray(history)
    ? history
        .slice(-8)
        .map((m: { role: string; text: string }) => `${m.role === 'user' ? 'Katılımcı' : 'Rehber'}: ${String(m.text).slice(0, 600)}`)
        .join('\n')
    : '';

  const prompt = `Felsefi Konu: ${String(topic || 'Bilgi ve Hakikat').slice(0, 120)}
${historyLines ? `Önceki Diyalog:\n${historyLines}\n\n` : ''}Katılımcının Yeni Argümanı: ${message.slice(0, 1500)}`;

  try {
    const response = await generateResilientContent(ai, prompt, {
      systemInstruction: `${personaText}
Türkçe yanıt ver. Görevlerin:
1. Katılımcının argümanındaki temel varsayımı nazikçe özetle.
2. Varsa gizli bir çelişkiyi veya sınır durumunu kibar biçimde işaret et.
3. Farklı bir felsefi akımdan kısa bir karşıt bakış açısı sun.
4. Katılımcıyı daha derine düşünmeye davet eden 1–2 güçlü Sokratik soru sor.`,
    });
    res.json({ reply: response.text ?? 'Yanıt oluşturulamadı.' });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

app.post('/api/ai/philosopher-compare', async (req, res) => {
  const ai = ensureClient(res);
  if (!ai) return;

  const { philosopherA, philosopherB } = req.body ?? {};
  if (!philosopherA || !philosopherB) {
    res.status(400).json({ error: 'Karşılaştırma için iki filozof seçilmelidir.' });
    return;
  }

  const prompt = `${String(philosopherA).slice(0, 60)} ve ${String(philosopherB).slice(0, 60)} filozoflarını Türkçe olarak şu 5 başlıkta akademik düzeyde karşılaştır:
1. Bilgi anlayışı (epistemoloji)
2. Varlık anlayışı (ontoloji)
3. Ahlak anlayışı (etik)
4. Toplum ve siyaset görüşleri
5. Ortak ve farklı düşünceleri`;

  try {
    const response = await generateResilientContent(ai, prompt, {
      systemInstruction: 'Nesnel, akademik ve anlaşılır Türkçe felsefe karşılaştırması yap. Yalnızca JSON döndür.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          epistemology: { type: Type.STRING },
          ontology: { type: Type.STRING },
          ethics: { type: Type.STRING },
          politicsAndSociety: { type: Type.STRING },
          commonalities: { type: Type.ARRAY, items: { type: Type.STRING } },
          differences: { type: Type.ARRAY, items: { type: Type.STRING } },
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
    res.json({ comparison: safeParseJson(response.text) });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

/* ---------------- COMMON AI ASSISTANT ---------------- */

app.post('/api/ai/assistant', async (req, res) => {
  const ai = ensureClient(res);
  if (!ai) return;

  const { message, moduleContext, roleView, history } = req.body ?? {};
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({ error: 'Lütfen bir soru veya talep yazın.' });
    return;
  }

  const safeModule = String(moduleContext || 'Genel Platform').slice(0, 60);
  const safeRole = roleView === 'student' ? 'Öğrenci' : 'Öğretmen';

  const conversationLines = Array.isArray(history)
    ? history
        .slice(-8)
        .map((m: { role: string; text: string }) => `${m.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${String(m.text).slice(0, 800)}`)
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

  try {
    const response = await generateResilientContent(ai, fullPrompt, { systemInstruction });
    res.json({ reply: response.text ?? 'Yanıt oluşturulamadı.' });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

/* ---------------- TEXT-TO-SPEECH AUDIO GENERATION (GEMINI TTS) ---------------- */

const ALLOWED_TTS_VOICES = new Set(['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr']);
const ttsCache = new Map<string, { audioBase64: string; mimeType: string; voiceName: string }>();

app.post('/api/ai/tts', async (req, res) => {
  const ai = getGenAITtsClient();
  if (!ai) {
    res.status(503).json({
      error:
        'Gemini API anahtarı sunucuda yapılandırılmamış. Sunucu ortam değişkenlerinde GEMINI_API_KEY tanımlı olduğunda seslendirme çalışır.',
    });
    return;
  }

  const { text, voiceName, style } = req.body ?? {};
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({ error: 'Seslendirilecek metin boş olamaz.' });
    return;
  }

  const cleanText = text.trim().slice(0, 1200);
  const selectedVoice =
    typeof voiceName === 'string' && ALLOWED_TTS_VOICES.has(voiceName) ? voiceName : 'Kore';
  const styleKey = typeof style === 'string' ? style.trim().slice(0, 140) : '';
  const cacheKey = `${selectedVoice}::${styleKey}::${cleanText}`;
  const cached = ttsCache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const response = await withGeminiRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              styleKey
                ? {
                    text: cleanText,
                    speechMetadata: {
                      style: styleKey,
                    },
                  }
                : { text: cleanText },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      })
    );

    const audioPart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const base64Audio = audioPart?.data;
    if (!base64Audio) {
      res.status(502).json({ error: 'Ses verisi oluşturulamadı. Lütfen tekrar deneyin.' });
      return;
    }

    const payload = {
      audioBase64: base64Audio,
      mimeType: audioPart?.mimeType || 'audio/wav',
      voiceName: selectedVoice,
    };

    if (ttsCache.size >= 80) {
      const oldestKey = ttsCache.keys().next().value;
      if (oldestKey) ttsCache.delete(oldestKey);
    }
    ttsCache.set(cacheKey, payload);

    res.json(payload);
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

/* ---------------- QURAN ARABIC SCRIPT PROXY (ALQURAN CLOUD) ---------------- */

const quranTextCache = new Map<string, { arabicText: string; basmala?: string }>();
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function toArabicIndicNumber(n: number): string {
  return String(n)
    .split('')
    .map((ch) => ARABIC_DIGITS[Number(ch)] ?? ch)
    .join('');
}

app.get('/api/quran/arabic', async (req, res) => {
  const type = String(req.query.type || '');
  const ref = String(req.query.ref || '');

  if (type !== 'surah' && type !== 'ayah') {
    res.status(400).json({ error: 'Geçersiz tür. surah veya ayah bekleniyor.' });
    return;
  }
  if (!/^\d+(:\d+)?$/.test(ref)) {
    res.status(400).json({ error: 'Geçersiz sure/ayet referansı.' });
    return;
  }

  const cacheKey = `${type}:${ref}`;
  const cached = quranTextCache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const endpoint =
      type === 'surah'
        ? `https://api.alquran.cloud/v1/surah/${ref}/quran-uthmani`
        : `https://api.alquran.cloud/v1/ayah/${ref}/quran-uthmani`;
    const upstream = await fetch(endpoint);
    if (!upstream.ok) {
      res.status(502).json({ error: 'Arapça mushaf metni alınamadı.' });
      return;
    }
    const payload = (await upstream.json()) as {
      data?: {
        number?: number;
        text?: string;
        ayahs?: Array<{ numberInSurah: number; text: string }>;
      };
    };

    if (type === 'ayah' && payload.data?.text) {
      const result = { arabicText: payload.data.text.trim() };
      quranTextCache.set(cacheKey, result);
      res.json(result);
      return;
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
      const result = { arabicText: formattedAyahs.join(' '), basmala };
      quranTextCache.set(cacheKey, result);
      res.json(result);
      return;
    }

    res.status(502).json({ error: 'Beklenmeyen API yanıtı.' });
  } catch {
    res.status(502).json({ error: 'Arapça metin sunucusuna ulaşılamadı.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BİLGE AKADEMİ sunucusu http://0.0.0.0:${PORT} adresinde çalışıyor.`);
  });
}

startServer();
