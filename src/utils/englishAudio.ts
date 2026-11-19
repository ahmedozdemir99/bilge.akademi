import { secureAiFetch } from '../lib/secureAiFetch';
/**
 * Client-side audio playback helper supporting:
 * 1. Instant zero-latency browser SpeechSynthesis (en-US, en-GB, tr-TR)
 * 2. Studio-grade AI WAV generation via /api/ai/tts with in-memory Blob caching & .wav download
 */

export type SpeechAccent = 'en-US' | 'en-GB' | 'tr-TR';
export type StudioVoiceName = 'Kore' | 'Puck' | 'Zephyr' | 'Charon' | 'Fenrir';

const wavCache = new Map<string, { url: string; blob: Blob }>();
let activeHtmlAudio: HTMLAudioElement | null = null;

export function stopAllSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (activeHtmlAudio) {
    activeHtmlAudio.pause();
    activeHtmlAudio.currentTime = 0;
    activeHtmlAudio = null;
  }
}

export function speakInstant(
  text: string,
  options?: {
    lang?: SpeechAccent;
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (message: string) => void;
  }
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onError?.('Tarayıcınız yerleşik ses sentezlemeyi desteklemiyor; Stüdyo AI Ses butonunu deneyebilirsiniz.');
    return false;
  }

  stopAllSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  const lang = options?.lang ?? 'en-US';
  utterance.lang = lang;
  utterance.rate = options?.rate ?? 0.92;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const exactVoice =
    voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  if (exactVoice) {
    utterance.voice = exactVoice;
  }

  utterance.onstart = () => options?.onStart?.();
  utterance.onend = () => options?.onEnd?.();
  utterance.onerror = () => options?.onEnd?.();

  window.speechSynthesis.speak(utterance);
  return true;
}

function base64ToWavBlob(base64: string, mimeType = 'audio/wav'): Blob {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export async function generateOrGetStudioWav(
  text: string,
  voiceName: StudioVoiceName = 'Kore',
  style = 'Clear, warm English teacher voice with crisp pronunciation for middle school students'
): Promise<{ url: string; blob: Blob }> {
  const key = `${voiceName}::${text.trim()}`;
  const cached = wavCache.get(key);
  if (cached) {
    return cached;
  }

  const response = await secureAiFetch('/api/ai/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceName, style }),
  });
  const data = await response.json();
  if (!response.ok || !data.audioBase64) {
    throw new Error(data.error || 'Stüdyo ses dosyası oluşturulamadı.');
  }

  const blob = base64ToWavBlob(data.audioBase64, data.mimeType || 'audio/wav');
  const url = URL.createObjectURL(blob);
  const entry = { url, blob };
  wavCache.set(key, entry);
  return entry;
}

export async function playStudioAudio(
  text: string,
  options?: {
    voiceName?: StudioVoiceName;
    rate?: number;
    style?: string;
    onStart?: () => void;
    onEnd?: () => void;
  }
): Promise<{ url: string; blob: Blob }> {
  stopAllSpeech();
  const entry = await generateOrGetStudioWav(text, options?.voiceName ?? 'Kore', options?.style);
  const audio = new Audio(entry.url);
  audio.playbackRate = options?.rate ?? 1;
  activeHtmlAudio = audio;

  audio.onplay = () => options?.onStart?.();
  audio.onended = () => {
    if (activeHtmlAudio === audio) activeHtmlAudio = null;
    options?.onEnd?.();
  };
  audio.onerror = () => {
    if (activeHtmlAudio === audio) activeHtmlAudio = null;
    options?.onEnd?.();
  };

  await audio.play();
  return entry;
}

export function downloadAudioBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.wav') ? filename : `${filename}.wav`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
