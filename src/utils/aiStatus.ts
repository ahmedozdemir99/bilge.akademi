export async function isGeminiConfigured(signal: AbortSignal): Promise<boolean> {
  const response = await fetch('/api/health', { cache: 'no-store', signal });
  if (!response.ok) throw new Error('Gemini durumu alınamadı.');
  const data = await response.json() as { aiConfigured?: unknown };
  if (typeof data.aiConfigured !== 'boolean') throw new Error('Gemini durumu alınamadı.');
  return data.aiConfigured;
}
