import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Headphones,
  Loader2,
  Play,
  Square,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  ENGLISH_LISTENING_TRACKS,
  type EnglishListeningTrack,
} from '../../../data/englishRichData';
import {
  downloadAudioBlob,
  generateOrGetStudioWav,
  playStudioAudio,
  speakInstant,
  stopAllSpeech,
  type SpeechAccent,
  type StudioVoiceName,
} from '../../../utils/englishAudio';

interface EnglishAudioLabPanelProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

const STUDIO_VOICES: { id: StudioVoiceName; label: string }[] = [
  { id: 'Kore', label: 'Kore (Kadın · Net Öğretmen)' },
  { id: 'Puck', label: 'Puck (Erkek · Enerjik)' },
  { id: 'Zephyr', label: 'Zephyr (Yumuşak · Akıcı)' },
  { id: 'Charon', label: 'Charon (Derin · Anlatıcı)' },
];

export function EnglishAudioLabPanel({ onNotify }: EnglishAudioLabPanelProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(ENGLISH_LISTENING_TRACKS[0].id);
  const [accent, setAccent] = useState<SpeechAccent>('en-US');
  const [rate, setRate] = useState<number>(0.9);
  const [studioVoice, setStudioVoice] = useState<StudioVoiceName>('Kore');
  const [hideScript, setHideScript] = useState<boolean>(false);
  const [showTurkish, setShowTurkish] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingLineIdx, setPlayingLineIdx] = useState<number | null>(null);
  const [loadingStudioId, setLoadingStudioId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const activeTrack: EnglishListeningTrack =
    ENGLISH_LISTENING_TRACKS.find((t) => t.id === selectedTrackId) ?? ENGLISH_LISTENING_TRACKS[0];

  const fullTrackText = activeTrack.lines.map((l) => l.en).join(' ');

  useEffect(() => () => stopAllSpeech(), []);

  const handleStop = () => {
    stopAllSpeech();
    setIsPlaying(false);
    setPlayingLineIdx(null);
  };

  const handlePlayInstantFull = () => {
    setPlayingLineIdx(null);
    speakInstant(fullTrackText, {
      lang: accent,
      rate,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: (msg) => {
        setIsPlaying(false);
        onNotify('error', 'Ses Çalınamadı', msg);
      },
    });
  };

  const handlePlayLineInstant = (text: string, idx: number) => {
    setPlayingLineIdx(idx);
    speakInstant(text, {
      lang: accent,
      rate,
      onStart: () => setIsPlaying(true),
      onEnd: () => {
        setIsPlaying(false);
        setPlayingLineIdx(null);
      },
      onError: (msg) => {
        setIsPlaying(false);
        setPlayingLineIdx(null);
        onNotify('error', 'Ses Çalınamadı', msg);
      },
    });
  };

  const handlePlayStudioFull = async () => {
    setLoadingStudioId(activeTrack.id);
    setPlayingLineIdx(null);
    try {
      await playStudioAudio(fullTrackText, {
        voiceName: studioVoice,
        rate,
        style: `Clear, natural ${accent === 'en-GB' ? 'British' : 'American'} English teacher reading a middle school listening dialogue`,
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
      });
    } catch (err) {
      setIsPlaying(false);
      onNotify(
        'info',
        'Tarayıcı Sesi Kullanılıyor',
        err instanceof Error
          ? `${err.message} — Anında dinleme için tarayıcı sesi başlatıldı.`
          : 'Stüdyo ses dosyası şu an oluşturulamadı; tarayıcı sesi başlatıldı.'
      );
      handlePlayInstantFull();
    } finally {
      setLoadingStudioId(null);
    }
  };

  const handleDownloadWav = async () => {
    setLoadingStudioId(`dl-${activeTrack.id}`);
    try {
      const entry = await generateOrGetStudioWav(
        fullTrackText,
        studioVoice,
        `Clear, natural ${accent === 'en-GB' ? 'British' : 'American'} English teacher voice`
      );
      downloadAudioBlob(entry.blob, `bilge-akademi-${activeTrack.id}-${studioVoice.toLowerCase()}.wav`);
      onNotify('success', 'Ses Dosyası İndirildi', `${activeTrack.title} (.wav) cihazınıza kaydedildi.`);
    } catch (err) {
      onNotify(
        'error',
        'WAV İndirilemedi',
        err instanceof Error ? err.message : 'Ses dosyası oluşturulamadı.'
      );
    } finally {
      setLoadingStudioId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Audio Settings Toolbar */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-navy-900 text-gold-400 dark:bg-teal-600/20 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-navy-900 dark:text-white">
              Sesli Dinleme Stüdyosu ve WAV Ses Dosyaları
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Anında telaffuz (US/UK aksanı + hız ayarı) veya indirilebilir Stüdyo AI .wav ses dosyaları
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            {(
              [
                { id: 'en-US', label: 'US Aksanı' },
                { id: 'en-GB', label: 'UK Aksanı' },
              ] as { id: SpeechAccent; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAccent(opt.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  accent === opt.id
                    ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            {[
              { value: 0.72, label: '0.7x Yavaş' },
              { value: 0.9, label: '0.9x Orta' },
              { value: 1.05, label: '1.0x Doğal' },
            ].map((spd) => (
              <button
                key={spd.value}
                type="button"
                onClick={() => setRate(spd.value)}
                className={`px-2.5 py-1 text-xs font-mono tabular-nums font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  rate === spd.value
                    ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

          <select
            aria-label="Stüdyo AI ses seçimi"
            value={studioVoice}
            onChange={(e) => setStudioVoice(e.target.value as StudioVoiceName)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
          >
            {STUDIO_VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                AI Ses: {v.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Two-Zone Layout: Track List (Left) + Audio Player, Script & Questions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 space-y-2.5">
          {ENGLISH_LISTENING_TRACKS.map((track) => {
            const isSelected = track.id === activeTrack.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  handleStop();
                  setSelectedTrackId(track.id);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-500 dark:bg-teal-600'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/60'
                }`}
              >
                <p
                  className={`text-[11px] font-mono tabular-nums ${
                    isSelected ? 'text-gold-300 dark:text-white/90' : 'text-teal-700 dark:text-teal-400'
                  }`}
                >
                  Track 0{track.trackNumber} · {track.level} · {track.durationLabel}
                </p>
                <h3
                  className={`mt-1 text-sm font-semibold ${
                    isSelected ? 'text-white' : 'text-navy-900 dark:text-white'
                  }`}
                >
                  {track.title}
                </h3>
                <p
                  className={`mt-0.5 text-xs leading-snug ${
                    isSelected ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {track.subtitle}
                </p>
              </button>
            );
          })}
        </aside>

        <section className="lg:col-span-8 space-y-5">
          {/* Active Audio Player & Script Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  {activeTrack.unit} · {activeTrack.level} · {activeTrack.durationLabel}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-navy-900 dark:text-white">
                  {activeTrack.title}
                </h3>
              </div>

              <div className="control-grid gap-2 sm:max-w-sm">
                <button
                  type="button"
                  onClick={() => setHideScript((h) => !h)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                >
                  {hideScript ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{hideScript ? 'Metni Göster' : 'Dinleme Sınavı (Metni Gizle)'}</span>
                </button>
                {!hideScript && (
                  <button
                    type="button"
                    onClick={() => setShowTurkish((s) => !s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                  >
                    {showTurkish ? 'Türkçeyi Gizle' : 'Türkçeyi Göster'}
                  </button>
                )}
              </div>
            </div>

            {/* Playback Action Bar */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="control-grid gap-2 sm:max-w-sm">
                <button
                  type="button"
                  onClick={handlePlayInstantFull}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Parçayı Hızlı Dinle</span>
                </button>

                <button
                  type="button"
                  disabled={loadingStudioId !== null}
                  onClick={() => void handlePlayStudioFull()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-gold-400 text-navy-950 hover:bg-gold-500 disabled:opacity-60 cursor-pointer whitespace-nowrap"
                >
                  {loadingStudioId === activeTrack.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span>Stüdyo AI Ses (.wav)</span>
                </button>

                <button
                  type="button"
                  disabled={loadingStudioId !== null}
                  onClick={() => void handleDownloadWav()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-60 cursor-pointer whitespace-nowrap"
                >
                  {loadingStudioId === `dl-${activeTrack.id}` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>.WAV İndir</span>
                </button>

                {isPlaying && (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer whitespace-nowrap"
                  >
                    <Square className="w-3 h-3" />
                    <span>Durdur</span>
                  </button>
                )}
              </div>

              {/* Clean Waveform Visual */}
              <div className="flex items-end gap-1 h-6" aria-hidden="true">
                {[10, 18, 13, 22, 16, 20, 11, 17].map((barH, idx) => (
                  <span
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isPlaying ? 'bg-teal-600 dark:bg-teal-400' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    style={{
                      height: isPlaying ? `${((barH + idx * 3) % 20) + 6}px` : '6px',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Dialogue / Transcript Lines */}
            {hideScript ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                <p className="text-sm font-medium text-navy-900 dark:text-white">
                  Dinleme Sınavı Modu Aktif — Metin Gizlendi
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Yukarıdaki oynatma butonlarıyla ses dosyasını dinleyip aşağıdaki 3 anlama sorusunu yanıtlayın.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeTrack.lines.map((line, idx) => {
                  const isLineActive = playingLineIdx === idx;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                        isLineActive
                          ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                          {line.speaker}
                        </p>
                        <p className="text-sm text-navy-900 dark:text-white leading-relaxed">
                          {line.en}
                        </p>
                        {showTurkish && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {line.tr}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlayLineInstant(line.en, idx)}
                        aria-label={`${line.speaker} satırını dinle`}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shrink-0 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3 Listening Comprehension Questions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Dinlediğini Anlama Kontrolü
              </p>
              <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                Bu Ses Parçasına Ait 3 Soru
              </h3>
            </div>

            <div className="space-y-4">
              {activeTrack.questions.map((q, qIdx) => {
                const chosen = answers[q.id];
                const isAnswered = chosen !== undefined;
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <p className="text-sm font-medium text-navy-900 dark:text-white">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isPicked = chosen === optIdx;
                        const isCorrect = optIdx === q.correctIndex;
                        let style =
                          'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-500';
                        if (isAnswered) {
                          if (isCorrect) {
                            style =
                              'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium';
                          } else if (isPicked) {
                            style =
                              'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
                          }
                        }
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => {
                              if (!isAnswered) {
                                setAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                              }
                            }}
                            className={`text-left px-3 py-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${style}`}
                          >
                            <span>{opt}</span>
                            {isAnswered && isCorrect && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            {isAnswered && isPicked && !isCorrect && (
                              <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {isAnswered && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
