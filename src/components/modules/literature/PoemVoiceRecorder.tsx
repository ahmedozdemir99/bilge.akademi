import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Download,
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  Trash2,
  Volume2,
} from 'lucide-react';

export interface PoemAudioRecording {
  id: string;
  poemTitle: string;
  createdAt: string;
  durationSec: number;
  mimeType: string;
  audioUrl: string;
  persisted: boolean;
}

const STORAGE_KEY = 'bilge_akademi_poem_recordings_v1';

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getPreferredMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
}

function extensionForMime(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'm4a';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
}

function loadSavedRecordings(): PoemAudioRecording[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PoemAudioRecording =>
        item &&
        typeof item.id === 'string' &&
        typeof item.poemTitle === 'string' &&
        typeof item.audioUrl === 'string'
    );
  } catch {
    return [];
  }
}

function persistRecordings(list: PoemAudioRecording[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const persistable = list.filter((r) => r.persisted).slice(0, 12);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    return true;
  } catch {
    return false;
  }
}

interface PoemVoiceRecorderProps {
  poemTitle: string;
  poemContent?: string;
  onNotify?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export function PoemVoiceRecorder({
  poemTitle,
  poemContent,
  onNotify,
}: PoemVoiceRecorderProps) {
  const [recordings, setRecordings] = useState<PoemAudioRecording[]>(() => loadSavedRecordings());
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [levels, setLevels] = useState<number[]>([8, 12, 10, 14, 10, 12, 8, 10, 14, 12, 8, 10]);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const cleanupAudioNodes = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      cleanupAudioNodes();
    };
  }, []);

  const startLiveVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateBars = () => {
        analyser.getByteFrequencyData(dataArray);
        const nextBars: number[] = [];
        for (let i = 0; i < 12; i += 1) {
          const val = dataArray[i * 2] ?? 0;
          nextBars.push(Math.max(8, Math.min(100, Math.round((val / 255) * 100))));
        }
        setLevels(nextBars);
        rafRef.current = window.requestAnimationFrame(updateBars);
      };
      updateBars();
    } catch {
      // Visualizer is optional enhancement
    }
  };

  const handleStartRecording = async () => {
    setErrorMsg('');
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErrorMsg('Tarayıcınız mikrofon kaydını desteklemiyor. Güncel Chrome, Edge veya Safari kullanın.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const mimeType = getPreferredMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          chunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: finalMime });
        const recordedDuration = Math.max(1, elapsedRef.current);
        cleanupAudioNodes();
        setStatus('idle');
        setLevels([8, 12, 10, 14, 10, 12, 8, 10, 14, 12, 8, 10]);

        if (blob.size < 100) {
          setErrorMsg('Kayıt çok kısa oldu. Lütfen birkaç saniye okuyarak tekrar deneyin.');
          return;
        }

        const safeTitle = poemTitle.trim() || 'Başlıksız Şiir Okuması';
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = typeof reader.result === 'string' ? reader.result : URL.createObjectURL(blob);
          const canPersist = typeof reader.result === 'string' && reader.result.length < 2_400_000;
          const newRec: PoemAudioRecording = {
            id: `rec-${Date.now()}`,
            poemTitle: safeTitle,
            createdAt: new Date().toLocaleString('tr-TR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            durationSec: recordedDuration,
            mimeType: finalMime,
            audioUrl: dataUrl,
            persisted: canPersist,
          };

          setRecordings((prev) => {
            const next = [newRec, ...prev];
            if (!persistRecordings(next)) {
              newRec.persisted = false;
            }
            return next;
          });
          onNotify?.(
            'success',
            'Şiir ses kaydı tamamlandı',
            `“${safeTitle}” (${formatTimer(recordedDuration)}) kaydedildi; aşağıdan dinleyip indirebilirsiniz.`
          );
        };
        reader.readAsDataURL(blob);
      };

      recorder.start(250);
      elapsedRef.current = 0;
      setElapsedSec(0);
      setStatus('recording');
      startLiveVisualizer(stream);

      timerRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        setElapsedSec(elapsedRef.current);
      }, 1000);
    } catch {
      cleanupAudioNodes();
      setStatus('idle');
      setErrorMsg(
        'Mikrofon izni alınamadı. Tarayıcı adres çubuğundan mikrofon erişimine izin verip tekrar deneyin.'
      );
    }
  };

  const handlePauseOrResume = () => {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    if (status === 'recording' && rec.state === 'recording') {
      rec.pause();
      setStatus('paused');
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (status === 'paused' && rec.state === 'paused') {
      rec.resume();
      setStatus('recording');
      timerRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        setElapsedSec(elapsedRef.current);
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      rec.stop();
    }
  };

  const handleDeleteRecording = (id: string) => {
    setRecordings((prev) => {
      const next = prev.filter((r) => r.id !== id);
      persistRecordings(next);
      return next;
    });
  };

  const handleDownloadRecording = (rec: PoemAudioRecording) => {
    const ext = extensionForMime(rec.mimeType);
    const slug = rec.poemTitle
      .toLocaleLowerCase('tr-TR')
      .replace(/[^a-z0-9ğüşıöç]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'siir-kaydi';
    const a = document.createElement('a');
    a.href = rec.audioUrl;
    a.download = `${slug}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 no-print">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2">
            <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm sm:text-base font-semibold text-navy-900 dark:text-white">
              Şiir Sesli Okuma ve Kayıt Stüdyosu
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Şiirinizi kendi sesinizle okuyarak kaydedin, diksiyon ve tonlamanızı tekrar dinleyin veya cihazınıza indirin.
          </p>
        </div>

        <span className="font-mono text-sm font-semibold tabular-nums text-navy-900 dark:text-teal-300 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          {formatTimer(elapsedSec)}
        </span>
      </div>

      {/* Live Microphone Controls + Real-Time Level Meter */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="control-grid gap-2">
            {status === 'idle' ? (
              <button
                type="button"
                onClick={() => void handleStartRecording()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Mic className="w-4 h-4" />
                <span>Sesli Kaydı Başlat</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePauseOrResume}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                >
                  {status === 'recording' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Duraklat</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Devam Et</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Durdur ve Kaydet</span>
                </button>
              </>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Aktif Şiir:{' '}
            <strong className="text-navy-900 dark:text-white">
              {poemTitle.trim() || 'Başlıksız Şiir'}
            </strong>
          </div>
        </div>

        {/* Real-time SVG audio level meter */}
        <svg
          viewBox="0 0 240 42"
          className="w-full max-w-xs h-10 mx-auto block"
          aria-hidden="true"
        >
          {levels.map((lv, idx) => {
            const barH = Math.max(5, Math.round((lv / 100) * 38));
            const x = 10 + idx * 19;
            const y = 40 - barH;
            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width="10"
                height={barH}
                rx="3"
                className={
                  status === 'recording'
                    ? 'fill-teal-600 dark:fill-teal-400 transition-all duration-75'
                    : status === 'paused'
                      ? 'fill-amber-500'
                      : 'fill-slate-300 dark:fill-slate-700'
                }
              />
            );
          })}
        </svg>

        {status !== 'idle' && poemContent && (
          <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto">
            <p className="text-[11px] font-medium text-teal-700 dark:text-teal-400 mb-1">
              Okuma Metni (Prompter)
            </p>
            <p className="text-sm font-display text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
              {poemContent}
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Saved Voice Recordings List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-navy-900 dark:text-white flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Ses Kayıtlarım ({recordings.length})</span>
          </h4>
          {recordings.length === 0 && (
            <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
              <MicOff className="w-3 h-3" />
              Henüz kayıt yok
            </span>
          )}
        </div>

        {recordings.length > 0 && (
          <div className="space-y-2.5">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-900 dark:text-white truncate">
                      {rec.poemTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {rec.createdAt} · Süre: {formatTimer(rec.durationSec)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadRecording(rec)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>İndir</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecording(rec.id)}
                      aria-label={`${rec.poemTitle} ses kaydını sil`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <audio controls src={rec.audioUrl} className="w-full h-9" preload="metadata" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
