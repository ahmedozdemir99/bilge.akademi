import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Square,
  Volume2,
} from 'lucide-react';
import {
  DAILY_PRAYER_TABLE,
  HAJJ_STAGES,
  PRAYER_POSTURE_STEPS,
  WUDU_STEPS,
  ZAKAT_RECIPIENTS,
  type PrayerPostureStep,
  type WuduStep,
} from '../../../data/religionRichData';
import {
  generateOrGetStudioWav,
  playStudioAudio,
  speakInstant,
  stopAllSpeech,
} from '../../../utils/englishAudio';
import wuduAthleteImg from '../../../assets/images/wudu_athlete_fullbody_1795091471521.jpg';
import namazQawmahImg from '../../../assets/images/namaz_athlete_qawmah_1795091453974.jpg';
import namazTakbirImg from '../../../assets/images/namaz_athlete_takbir_1795091788958.jpg';
import namazQiyamLowImg from '../../../assets/images/namaz_athlete_qiyam_inrug_1795108814356.jpg';
import namazRukuImg from '../../../assets/images/namaz_athlete_ruku_inrug_1795108812960.jpg';
import namazSujudInRugImg from '../../../assets/images/namaz_athlete_sujud_inrug_1795096354505.jpg';
import namazTashahhudInRugImg from '../../../assets/images/namaz_athlete_tashahhud_inrug_1795096355811.jpg';
import namazSalamRightImg from '../../../assets/images/namaz_athlete_salam_right_1795096355282.jpg';
import namazSalamLeftImg from '../../../assets/images/namaz_athlete_salam_left_1795096355274.jpg';

type WorshipLabTab = 'wudu' | 'prayer' | 'hajj' | 'fasting-zakat';

const TURKISH_WORSHIP_VOICE = 'Charon' as const;
const TURKISH_WORSHIP_STYLE =
  'Calm, warm, articulate native Turkish teacher voice with crisp pronunciation of Turkish and Islamic terms';

const WUDU_ATHLETE_PHOTO = wuduAthleteImg;

const NAMAZ_POSTURE_PHOTOS: Record<
  PrayerPostureStep['postureKey'],
  { src: string; flipX?: boolean; caption: string }
> = {
  niyyah: {
    src: namazQawmahImg,
    caption: 'Kıbleye yönelme ve niyet duruşu',
  },
  takbir: {
    src: namazTakbirImg,
    caption: 'İftitah tekbiri (Allâhu Ekber)',
  },
  qiyam: {
    src: namazQiyamLowImg,
    caption: 'Kıyam ve kıraat (eller göbek altında bağlı)',
  },
  ruku: {
    src: namazRukuImg,
    caption: 'Rükû (sırt düz, eller dizlerde)',
  },
  qawmah: {
    src: namazQawmahImg,
    caption: 'Kavme (rükûdan tam doğrulma)',
  },
  sujud1: {
    src: namazSujudInRugImg,
    caption: 'Birinci secde (tüm vücut seccade sınırları içinde)',
  },
  jalsa: {
    src: namazTashahhudInRugImg,
    caption: 'Celse (iki secde arası oturuş)',
  },
  sujud2: {
    src: namazSujudInRugImg,
    caption: 'İkinci secde (tüm vücut seccade sınırları içinde)',
  },
  tashahhud: {
    src: namazTashahhudInRugImg,
    caption: 'Ka’de-i Âhire (son oturuş)',
  },
  salam: {
    src: namazSalamRightImg,
    caption: 'Sağa ve sola selam verme',
  },
};

const SALAM_PHOTOS = {
  right: {
    src: namazSalamRightImg,
    label: '1. Sağa Selam',
    detail: 'Baş sağ omuza çevrilir: “Es-selâmü aleyküm ve rahmetullâh”',
  },
  left: {
    src: namazSalamLeftImg,
    label: '2. Sola Selam',
    detail: 'Baş sol omuza çevrilir: “Es-selâmü aleyküm ve rahmetullâh”',
  },
} as const;

/* Precision hotspot targets on 300x400 (3:4) full-body tracksuit athlete photo */
interface HotspotPoint {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

const WUDU_PHOTO_HOTSPOTS: Record<WuduStep['bodyHighlight'], HotspotPoint[]> = {
  heart: [{ x: 154, y: 146, rx: 22, ry: 22 }],
  hands: [
    { x: 111, y: 226, rx: 18, ry: 22 },
    { x: 193, y: 226, rx: 18, ry: 22 },
  ],
  mouth: [{ x: 151, y: 78, rx: 14, ry: 9 }],
  nose: [{ x: 151, y: 68, rx: 11, ry: 11 }],
  face: [{ x: 150, y: 70, rx: 25, ry: 29 }],
  arms: [
    { x: 110, y: 185, rx: 16, ry: 34 },
    { x: 193, y: 185, rx: 16, ry: 34 },
  ],
  head: [{ x: 150, y: 46, rx: 32, ry: 17 }],
  ears: [
    { x: 132, y: 72, rx: 10, ry: 14 },
    { x: 169, y: 72, rx: 10, ry: 14 },
  ],
  feet: [
    { x: 122, y: 368, rx: 24, ry: 15 },
    { x: 182, y: 368, rx: 24, ry: 15 },
  ],
};

function StepProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.max(4, Math.min(100, (current / total) * 100));
  return (
    <svg
      viewBox="0 0 120 8"
      className="w-36 sm:w-44 h-2.5 shrink-0"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Adım ${current} / ${total}`}
    >
      <rect x="0" y="0" width="120" height="8" rx="4" className="fill-slate-200 dark:fill-slate-800" />
      <rect
        x="0"
        y="0"
        width={(120 * pct) / 100}
        height="8"
        rx="4"
        className="fill-teal-700 dark:fill-teal-500 transition-all duration-300"
      />
    </svg>
  );
}

/* ---------- 1. PHOTOREALISTIC FULL-BODY WUDU STAGE ---------- */
function WuduPhotoStage({ step, waterPhase }: { step: WuduStep; waterPhase: number }) {
  const hotspots = WUDU_PHOTO_HOTSPOTS[step.bodyHighlight];
  const isHeart = step.bodyHighlight === 'heart';
  const dropOffset = waterPhase % 24;
  const rippleExpand = waterPhase % 14;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-stone-100 dark:bg-slate-950 max-w-[380px] mx-auto w-full">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          src={WUDU_ATHLETE_PHOTO}
          alt={`Abdest Adım ${step.stepNumber}: ${step.title}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center select-none"
        />

        {/* Animated anatomical highlight & water droplets overlay */}
        <svg
          viewBox="0 0 300 400"
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          aria-hidden="true"
        >
          {hotspots.map((pt, idx) => (
            <g key={idx}>
              {/* Outer expanding ripple */}
              <ellipse
                cx={pt.x}
                cy={pt.y}
                rx={pt.rx + rippleExpand * 0.9}
                ry={pt.ry + rippleExpand * 0.9}
                fill="none"
                stroke={isHeart ? '#C89B3C' : '#38BDF8'}
                strokeWidth="2"
                strokeOpacity={Math.max(0.12, 0.85 - rippleExpand / 16)}
              />
              {/* Main glowing highlight ring */}
              <ellipse
                cx={pt.x}
                cy={pt.y}
                rx={pt.rx}
                ry={pt.ry}
                fill={isHeart ? 'rgba(200, 155, 60, 0.24)' : 'rgba(14, 165, 233, 0.24)'}
                stroke={isHeart ? '#F59E0B' : '#0284C7'}
                strokeWidth="2.8"
              />
              {/* Animated water droplets (for washing / wiping steps) */}
              {!isHeart && (
                <>
                  <path
                    d={`M ${pt.x - pt.rx * 0.65} ${pt.y - pt.ry - 8 + dropOffset * 0.85} q 4 7 0 11 q -4 -4 0 -11`}
                    fill="#38BDF8"
                    stroke="#FFFFFF"
                    strokeWidth="0.9"
                  />
                  <path
                    d={`M ${pt.x + pt.rx * 0.65} ${pt.y - pt.ry - 4 + ((dropOffset + 12) % 24) * 0.85} q 4 7 0 11 q -4 -4 0 -11`}
                    fill="#0284C7"
                    stroke="#FFFFFF"
                    strokeWidth="0.9"
                  />
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="px-4 py-2 text-center bg-stone-100/95 dark:bg-slate-900/95 border-t border-slate-200/70 dark:border-slate-800">
        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          Yapay zekâyla oluşturulmuş temsili görsel
        </p>
      </div>
    </div>
  );
}

/* ---------- 2. PHOTOREALISTIC NAMAZ POSTURE STAGE ---------- */
function PrayerPhotoStage({ step }: { step: PrayerPostureStep }) {
  const [salamSide, setSalamSide] = useState<'right' | 'left'>('right');
  const [salamAuto, setSalamAuto] = useState(true);

  useEffect(() => {
    if (step.postureKey !== 'salam') {
      setSalamSide('right');
      setSalamAuto(true);
      return;
    }
    if (!salamAuto) return;
    const timer = window.setInterval(() => {
      setSalamSide((prev) => (prev === 'right' ? 'left' : 'right'));
    }, 2400);
    return () => window.clearInterval(timer);
  }, [step.postureKey, salamAuto]);

  const photo = NAMAZ_POSTURE_PHOTOS[step.postureKey];
  const isSalam = step.postureKey === 'salam';
  const activeSrc = isSalam ? SALAM_PHOTOS[salamSide].src : photo.src;
  const activeAlt = isSalam
    ? `Namaz Adım ${step.stepNumber}: ${SALAM_PHOTOS[salamSide].label}`
    : `Namaz Adım ${step.stepNumber}: ${step.title} — ${photo.caption}`;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-stone-100 dark:bg-slate-950 max-w-[380px] mx-auto w-full">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          key={activeSrc}
          src={activeSrc}
          alt={activeAlt}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center select-none transition-opacity duration-300 ${
            photo.flipX ? '-scale-x-100' : ''
          }`}
        />

        {/* Live Salam Direction Indicator on Step 10 */}
        {isSalam && (
          <div className="absolute top-3 inset-x-3 flex justify-center pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900/90 text-white text-xs font-semibold shadow-sm">
              {salamSide === 'right' ? (
                <>
                  <span>1. Sağ Omuza Selam</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
                </>
              ) : (
                <>
                  <ArrowLeft className="w-3.5 h-3.5 text-gold-400" />
                  <span>2. Sol Omuza Selam</span>
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Right / Left Salam Toggle on Step 10 */}
      {isSalam && (
        <div className="px-3 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            {(['right', 'left'] as const).map((side) => {
              const active = salamSide === side;
              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => {
                    setSalamAuto(false);
                    setSalamSide(side);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-navy-900 text-white dark:bg-teal-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {SALAM_PHOTOS[side].label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-center text-slate-600 dark:text-slate-300">
            {SALAM_PHOTOS[salamSide].detail}
          </p>
        </div>
      )}

      <div className="px-4 py-2 text-center bg-stone-100/95 dark:bg-slate-900/95 border-t border-slate-200/70 dark:border-slate-800">
        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          Yapay zekâyla oluşturulmuş temsili görsel
        </p>
      </div>
    </div>
  );
}

/* ---------- 3. KAABA TAWAF & SA'Y ANIMATION ---------- */
function HajjTawafSvg({ angleDeg, shawt }: { angleDeg: number; shawt: number }) {
  const rad = (angleDeg * Math.PI) / 180;
  // Counter-clockwise orbit around Kaaba (cx=180, cy=135, r=76)
  const px = 180 + Math.cos(-rad) * 76;
  const py = 135 + Math.sin(-rad) * 76;
  const sayProgress = (angleDeg % 360) / 360;
  const sayX = 76 + (shawt % 2 === 1 ? sayProgress : 1 - sayProgress) * 208;

  return (
    <svg
      viewBox="0 0 360 300"
      className="w-full h-[290px] sm:h-[320px] select-none"
      role="img"
      aria-label={`Kâbe Tavaf Animasyonu: ${shawt}. Şavt`}
    >
      <rect x="8" y="8" width="344" height="284" rx="14" fill="rgba(11, 31, 58, 0.04)" />

      {/* Mataf concentric circles */}
      <circle cx="180" cy="135" r="98" fill="none" stroke="#94A3B8" strokeOpacity="0.25" strokeWidth="1" />
      <circle cx="180" cy="135" r="76" fill="none" stroke="#0D9488" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="5 5" />
      <circle cx="180" cy="135" r="54" fill="none" stroke="#94A3B8" strokeOpacity="0.25" strokeWidth="1" />

      {/* Counter-clockwise direction arrow */}
      <path d="M 248 92 A 76 76 0 0 0 218 68" fill="none" stroke="#C89B3C" strokeWidth="2.5" />
      <polygon points="215,66 226,64 222,74" fill="#C89B3C" />

      {/* Kaaba Cube */}
      <rect x="158" y="113" width="44" height="44" rx="4" fill="#0F172A" stroke="#C89B3C" strokeWidth="2" />
      <rect x="158" y="124" width="44" height="6" fill="#C89B3C" />
      {/* Hajar al-Aswad corner marker */}
      <circle cx="202" cy="157" r="4.5" fill="#EAB308" stroke="#FFFFFF" strokeWidth="1.5" />
      <text x="210" y="166" className="fill-slate-500 dark:fill-slate-400 text-[9px] font-medium">
        Hacerü’l-Esved
      </text>

      {/* Orbiting Pilgrim Marker */}
      <circle cx={px} cy={py} r="9" fill="#0D9488" stroke="#FFFFFF" strokeWidth="2.5" />
      <text x={px} y={py + 3} textAnchor="middle" fill="#FFFFFF" className="text-[9px] font-mono font-bold">
        {shawt}
      </text>

      <text x="180" y="30" textAnchor="middle" className="fill-navy-900 dark:fill-white text-[12px] font-semibold">
        Tavaf (Saat Yönünün Tersine 7 Şavt) · Şavt {shawt}/7
      </text>

      {/* Safa - Marwa Sa'y Track */}
      <line x1="76" y1="262" x2="284" y2="262" stroke="#0D9488" strokeOpacity="0.4" strokeWidth="4" strokeLinecap="round" />
      <circle cx="76" cy="262" r="7" fill="#0B1F3A" />
      <circle cx="284" cy="262" r="7" fill="#0B1F3A" />
      <circle cx={sayX} cy="262" r="6" fill="#C89B3C" stroke="#FFFFFF" strokeWidth="2" />
      <text x="76" y="282" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 text-[10px] font-medium">
        Safa Tepesi
      </text>
      <text x="180" y="250" textAnchor="middle" className="fill-teal-700 dark:fill-teal-400 text-[10px] font-medium">
        Sa’y Parkuru (7 Gidiş-Geliş)
      </text>
      <text x="284" y="282" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 text-[10px] font-medium">
        Merve Tepesi
      </text>
    </svg>
  );
}

/* ---------- MAIN WORSHIP ANIMATIONS LAB ---------- */
export function WorshipAnimationsLab({ onOpenSurahs }: { onOpenSurahs?: () => void }) {
  const [activeLab, setActiveLab] = useState<WorshipLabTab>('wudu');

  // Wudu state
  const [wuduIdx, setWuduIdx] = useState(0);
  const [wuduNarrationActive, setWuduNarrationActive] = useState(false);
  const [showAllWuduSteps, setShowAllWuduSteps] = useState(false);
  const [waterPhase, setWaterPhase] = useState(0);
  const wuduNarrateCancelRef = useRef(false);

  // Prayer state
  const [prayerIdx, setPrayerIdx] = useState(0);
  const [prayerNarrationActive, setPrayerNarrationActive] = useState(false);
  const [showAllPrayerSteps, setShowAllPrayerSteps] = useState(false);
  const prayerNarrateCancelRef = useRef(false);

  // Hajj state
  const [hajjStageIdx, setHajjStageIdx] = useState(4);
  const [tawafPlaying, setTawafPlaying] = useState(true);
  const [tawafAngle, setTawafAngle] = useState(0);

  // Fasting & Zakat state
  const [hourOfDay, setHourOfDay] = useState(12.5);
  const [wealthTry, setWealthTry] = useState(420000);
  const [goldGramPrice, setGoldGramPrice] = useState(3200);
  const [cropMode, setCropMode] = useState<'cash' | 'rainCrop' | 'irrigatedCrop'>('cash');

  // Audio loading state for Studio TTS
  const [stepAudioLoading, setStepAudioLoading] = useState(false);

  // Subtle animation loop for water droplets & Tawaf orbit
  useEffect(() => {
    if (activeLab === 'wudu') {
      const id = window.setInterval(() => setWaterPhase((p) => (p + 1) % 240), 90);
      return () => window.clearInterval(id);
    }
    if (activeLab === 'hajj' && tawafPlaying) {
      const id = window.setInterval(() => setTawafAngle((a) => (a + 3) % (360 * 7)), 60);
      return () => window.clearInterval(id);
    }
    return undefined;
  }, [activeLab, tawafPlaying]);

  const stopAllGuidedNarration = () => {
    wuduNarrateCancelRef.current = true;
    prayerNarrateCancelRef.current = true;
    setWuduNarrationActive(false);
    setPrayerNarrationActive(false);
    setStepAudioLoading(false);
    stopAllSpeech();
  };

  useEffect(() => () => stopAllGuidedNarration(), []);

  const buildWuduSpeechText = (st: WuduStep) =>
    `Adım ${st.stepNumber}. ${st.title}. ${st.description} ${st.duaOrNote}`;

  const buildPrayerSpeechText = (st: PrayerPostureStep) =>
    `Adım ${st.stepNumber}. ${st.title}. ${st.howToPerform} Okunuşu: ${st.recitationTr}.`;

  const speakTurkishStudio = async (text: string, onEnd?: () => void) => {
    setStepAudioLoading(true);
    try {
      await playStudioAudio(text, {
        voiceName: TURKISH_WORSHIP_VOICE,
        rate: 0.98,
        style: TURKISH_WORSHIP_STYLE,
        onStart: () => setStepAudioLoading(false),
        onEnd: () => {
          setStepAudioLoading(false);
          onEnd?.();
        },
      });
    } catch {
      setStepAudioLoading(false);
      // Graceful fallback to browser TTS only if server TTS is unavailable
      speakInstant(text, { lang: 'tr-TR', rate: 0.94, onEnd });
    }
  };

  const handleListenSingleWudu = () => {
    stopAllGuidedNarration();
    void speakTurkishStudio(buildWuduSpeechText(WUDU_STEPS[wuduIdx]));
  };

  const handleListenSinglePrayer = () => {
    stopAllGuidedNarration();
    void speakTurkishStudio(buildPrayerSpeechText(PRAYER_POSTURE_STEPS[prayerIdx]));
  };

  const handleListenAllWudu = () => {
    if (wuduNarrationActive) {
      stopAllGuidedNarration();
      return;
    }
    stopAllGuidedNarration();
    wuduNarrateCancelRef.current = false;
    setWuduNarrationActive(true);

    const runStep = (idx: number) => {
      if (wuduNarrateCancelRef.current || idx >= WUDU_STEPS.length) {
        setWuduNarrationActive(false);
        return;
      }
      setWuduIdx(idx);
      const st = WUDU_STEPS[idx];
      // Prefetch next step WAV in background for seamless flow
      if (idx + 1 < WUDU_STEPS.length) {
        void generateOrGetStudioWav(
          buildWuduSpeechText(WUDU_STEPS[idx + 1]),
          TURKISH_WORSHIP_VOICE,
          TURKISH_WORSHIP_STYLE
        ).catch(() => undefined);
      }
      void speakTurkishStudio(buildWuduSpeechText(st), () => {
        if (!wuduNarrateCancelRef.current) {
          window.setTimeout(() => runStep(idx + 1), 450);
        }
      });
    };
    runStep(0);
  };

  const handleListenAllPrayer = () => {
    if (prayerNarrationActive) {
      stopAllGuidedNarration();
      return;
    }
    stopAllGuidedNarration();
    prayerNarrateCancelRef.current = false;
    setPrayerNarrationActive(true);

    const runStep = (idx: number) => {
      if (prayerNarrateCancelRef.current || idx >= PRAYER_POSTURE_STEPS.length) {
        setPrayerNarrationActive(false);
        return;
      }
      setPrayerIdx(idx);
      const st = PRAYER_POSTURE_STEPS[idx];
      if (idx + 1 < PRAYER_POSTURE_STEPS.length) {
        void generateOrGetStudioWav(
          buildPrayerSpeechText(PRAYER_POSTURE_STEPS[idx + 1]),
          TURKISH_WORSHIP_VOICE,
          TURKISH_WORSHIP_STYLE
        ).catch(() => undefined);
      }
      void speakTurkishStudio(buildPrayerSpeechText(st), () => {
        if (!prayerNarrateCancelRef.current) {
          window.setTimeout(() => runStep(idx + 1), 500);
        }
      });
    };
    runStep(0);
  };

  const currentWudu = WUDU_STEPS[wuduIdx];
  const currentPrayer = PRAYER_POSTURE_STEPS[prayerIdx];
  const currentHajj = HAJJ_STAGES[hajjStageIdx];
  const currentShawt = Math.floor(tawafAngle / 360) + 1;

  // Fasting phase derived from hourOfDay (0..24)
  const fastingPhase = useMemo(() => {
    if (hourOfDay < 4.5) {
      return {
        label: 'Sahur Vakti',
        detail: 'İmsak vaktinden önce niyet edilir ve sahur yemeği yenir.',
        isFasting: false,
      };
    }
    if (hourOfDay < 19.75) {
      return {
        label: 'Oruç Vakti (İmsak – İftar)',
        detail: 'Tan yerinin ağarmasından güneşin batışına kadar yeme-içmeden ve kötü sözden uzak durulur.',
        isFasting: true,
      };
    }
    if (hourOfDay < 21.25) {
      return {
        label: 'İftar Vakti (Akşam Ezanı)',
        detail: 'Güneşin batmasıyla şükür ve dua ile oruç açılır.',
        isFasting: false,
      };
    }
    return {
      label: 'Yatsı ve Teravih Vakti',
      detail: 'Ramazan gecelerinde cemaatle veya bireysel olarak Teravih namazı kılınır, Kur’an okunur.',
      isFasting: false,
    };
  }, [hourOfDay]);

  const nisapTry = Math.round(80.18 * goldGramPrice);
  const zakatAmount = useMemo(() => {
    if (cropMode === 'rainCrop') return Math.round(wealthTry / 10);
    if (cropMode === 'irrigatedCrop') return Math.round(wealthTry / 20);
    return wealthTry >= nisapTry ? Math.round(wealthTry / 40) : 0;
  }, [cropMode, nisapTry, wealthTry]);

  const formatHour = (h: number) => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${String(hh).padStart(2, '0')}:${String(mm === 60 ? 0 : mm).padStart(2, '0')}`;
  };

  // Sun/Moon arc coordinates for fasting diagram
  const sunProgress = Math.max(0, Math.min(1, (hourOfDay - 4.5) / (19.75 - 4.5)));
  const isDay = hourOfDay >= 4.5 && hourOfDay <= 19.75;
  const celestialX =
    44 + (isDay ? sunProgress : hourOfDay < 4.5 ? hourOfDay / 4.5 : (hourOfDay - 19.75) / 4.25) * 272;
  const celestialY = isDay
    ? 175 - Math.sin(sunProgress * Math.PI) * 115
    : 120 - Math.sin((hourOfDay < 4.5 ? hourOfDay / 4.5 : (hourOfDay - 19.75) / 4.25) * Math.PI) * 50;

  return (
    <div className="space-y-6">
      {/* Sub-lab selector */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-fit">
        {(
          [
            { id: 'wudu', label: 'Abdest Rehberi (9 Adım)' },
            { id: 'prayer', label: 'Namaz Rehberi (10 Aşama)' },
            { id: 'hajj', label: 'Hac & Kâbe Tavaf Animasyonu' },
            { id: 'fasting-zakat', label: 'Oruç Döngüsü & Zekât Hesaplayıcı' },
          ] as { id: WorshipLabTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              stopAllGuidedNarration();
              setActiveLab(tab.id);
            }}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeLab === tab.id
                ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. WUDU STEP-BY-STEP PHOTO GUIDE */}
      {activeLab === 'wudu' && (
        <section className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
          {/* Top Step Counter & Progress Bar */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-teal-800 dark:text-teal-400 font-mono tabular-nums">
              Adım {currentWudu.stepNumber} / {WUDU_STEPS.length}
            </span>
            <StepProgressBar current={currentWudu.stepNumber} total={WUDU_STEPS.length} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Photorealistic Full-Body Athlete Stage */}
            <div className="lg:col-span-6">
              <WuduPhotoStage step={currentWudu} waterPhase={waterPhase} />
            </div>

            {/* Clean Step Card matching Screenshots */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                  Abdest · {currentWudu.ruleType} · {currentWudu.repeatCount} Kez
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white tracking-tight">
                  {currentWudu.title}
                </h2>
                <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed">
                  {currentWudu.description}
                </p>
                <p className="text-sm font-semibold text-navy-900 dark:text-slate-100 leading-relaxed">
                  {currentWudu.duaOrNote}
                </p>

                <div className="p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700">
                  <p className="text-sm font-semibold text-teal-900 dark:text-teal-300">
                    {currentWudu.arabicOrShort}
                  </p>
                </div>
              </div>

              {/* Audio Action Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={stepAudioLoading && !wuduNarrationActive}
                  onClick={handleListenSingleWudu}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-navy-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
                >
                  {stepAudioLoading && !wuduNarrationActive ? (
                    <Loader2 className="w-4 h-4 animate-spin text-teal-700 dark:text-teal-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  )}
                  <span>{stepAudioLoading && !wuduNarrationActive ? 'Ses hazırlanıyor...' : 'Adımı dinle'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleListenAllWudu}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    wuduNarrationActive
                      ? 'bg-teal-700 text-white hover:bg-teal-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-navy-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {wuduNarrationActive ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Dinlemeyi durdur</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                      <span>Baştan sona dinle</span>
                    </>
                  )}
                </button>
              </div>

              {/* Prev / Next Navigation Row */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    stopAllGuidedNarration();
                    setWuduIdx((i) => (i - 1 + WUDU_STEPS.length) % WUDU_STEPS.length);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-navy-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Önceki</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopAllGuidedNarration();
                    setWuduIdx((i) => (i + 1) % WUDU_STEPS.length);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
                >
                  <span>Sonraki</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Collapsible All Steps List */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAllWuduSteps((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-navy-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                >
                  <span>Tüm adımları göster ({WUDU_STEPS.length})</span>
                  {showAllWuduSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAllWuduSteps && (
                  <div className="mt-2 space-y-1">
                    {WUDU_STEPS.map((st, idx) => (
                      <button
                        key={st.stepNumber}
                        type="button"
                        onClick={() => {
                          stopAllGuidedNarration();
                          setWuduIdx(idx);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          idx === wuduIdx
                            ? 'bg-navy-900 text-white dark:bg-teal-600'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">
                          <span className="font-mono tabular-nums mr-1.5">{st.stepNumber}.</span>
                          {st.title}
                        </span>
                        <span
                          className={`text-[11px] font-medium shrink-0 ${
                            idx === wuduIdx
                              ? 'text-gold-300 dark:text-white/90'
                              : st.ruleType === 'Farz'
                                ? 'text-amber-700 dark:text-gold-400'
                                : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {st.ruleType}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. PRAYER POSTURES STEP-BY-STEP PHOTO GUIDE + DAILY TABLE */}
      {activeLab === 'prayer' && (
        <div className="space-y-6">
          <section className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
            {/* Top Step Counter & Progress Bar */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-teal-800 dark:text-teal-400 font-mono tabular-nums">
                Adım {currentPrayer.stepNumber} / {PRAYER_POSTURE_STEPS.length}
              </span>
              <StepProgressBar current={currentPrayer.stepNumber} total={PRAYER_POSTURE_STEPS.length} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Photorealistic Namaz Posture Image */}
              <div className="lg:col-span-6">
                <PrayerPhotoStage step={currentPrayer} />
              </div>

              {/* Clean Step Card matching Screenshots */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    1. Rekat &amp; Namazın Rükünleri · {currentPrayer.ruleType}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white tracking-tight">
                    {currentPrayer.title}
                  </h2>
                  <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed">
                    {currentPrayer.howToPerform}
                  </p>

                  {/* Recitation Box */}
                  <div className="p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 space-y-1">
                    <p className="text-sm font-semibold text-teal-900 dark:text-teal-300">
                      {currentPrayer.recitationTr}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Anlamı: {currentPrayer.meaningTr}
                    </p>
                  </div>

                  {/* Direct "Sureleri aç ->" shortcut on Qiyam & Tashahhud */}
                  {onOpenSurahs &&
                    (currentPrayer.postureKey === 'qiyam' || currentPrayer.postureKey === 'tashahhud') && (
                      <button
                        type="button"
                        onClick={onOpenSurahs}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-teal-50/90 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 text-sm font-semibold text-teal-900 dark:text-teal-200 hover:bg-teal-100/80 dark:hover:bg-teal-950/70 transition-colors cursor-pointer"
                      >
                        <span>Sureleri ve duaları aç (Gerçek Kâri Tilavet)</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>
                    )}
                </div>

                {/* Audio Action Row */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={stepAudioLoading && !prayerNarrationActive}
                    onClick={handleListenSinglePrayer}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-navy-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
                  >
                    {stepAudioLoading && !prayerNarrationActive ? (
                      <Loader2 className="w-4 h-4 animate-spin text-teal-700 dark:text-teal-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    )}
                    <span>{stepAudioLoading && !prayerNarrationActive ? 'Ses hazırlanıyor...' : 'Adımı dinle'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleListenAllPrayer}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      prayerNarrationActive
                        ? 'bg-teal-700 text-white hover:bg-teal-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-navy-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {prayerNarrationActive ? (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Dinlemeyi durdur</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                        <span>Baştan sona dinle</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Prev / Next Navigation Row */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopAllGuidedNarration();
                      setPrayerIdx(
                        (i) => (i - 1 + PRAYER_POSTURE_STEPS.length) % PRAYER_POSTURE_STEPS.length
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-navy-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Önceki</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopAllGuidedNarration();
                      setPrayerIdx((i) => (i + 1) % PRAYER_POSTURE_STEPS.length);
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
                  >
                    <span>Sonraki</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Collapsible All Steps List */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAllPrayerSteps((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-navy-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                  >
                    <span>Tüm adımları göster ({PRAYER_POSTURE_STEPS.length})</span>
                    {showAllPrayerSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAllPrayerSteps && (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {PRAYER_POSTURE_STEPS.map((st, idx) => (
                        <button
                          key={st.stepNumber}
                          type="button"
                          onClick={() => {
                            stopAllGuidedNarration();
                            setPrayerIdx(idx);
                          }}
                          className={`text-left px-3 py-2 rounded-lg text-xs truncate transition-colors cursor-pointer ${
                            idx === prayerIdx
                              ? 'bg-navy-900 text-white dark:bg-teal-600'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="font-mono tabular-nums mr-1">{st.stepNumber}.</span>
                          {st.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 5 Daily Prayers Rekat Table */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                5 Vakit Namaz Rekat Tablosu (Toplam 40 Rekat)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Namazın 12 Farzı: 6 Dışından (Hadesten Taharet, Necasetten Taharet, Setr-i Avret, İstikbal-i Kıble, Vakit, Niyet) + 6 İçinden (İftitah Tekbiri, Kıyam, Kıraat, Rükû, Secde, Ka’de-i Âhire)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-4 font-medium">Vakit</th>
                    <th className="py-2.5 px-4 font-medium text-right">İlk Sünnet</th>
                    <th className="py-2.5 px-4 font-medium text-right">Farz</th>
                    <th className="py-2.5 px-4 font-medium text-right">Son Sünnet</th>
                    <th className="py-2.5 px-4 font-medium text-right">Vitir (Vacip)</th>
                    <th className="py-2.5 px-4 font-medium text-right">Toplam</th>
                    <th className="py-2.5 px-4 font-medium">Vakit Aralığı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {DAILY_PRAYER_TABLE.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-medium text-navy-900 dark:text-white whitespace-nowrap">{row.name}</td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums">{row.sunnahBefore || '—'}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-teal-700 dark:text-teal-400">{row.fard}</td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums">{row.sunnahAfter || '—'}</td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums">{row.wajib || '—'}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-navy-900 dark:text-white">{row.total}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500 dark:text-slate-400">{row.timeNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 3. HAJJ & KAABA TAWAF ANIMATION */}
      {activeLab === 'hajj' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  Hac ve Umre Menasiki · Canlı Tavaf ve Sa’y Görselleştirmesi
                </p>
                <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                  Kâbe Tavafı ve Safa–Merve Sa’y Animasyonu
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTawafPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer whitespace-nowrap"
                >
                  {tawafPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{tawafPlaying ? 'Duraklat' : 'Devam Et'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTawafAngle(0)}
                  aria-label="Şavtı sıfırla"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <HajjTawafSvg angleDeg={tawafAngle} shawt={currentShawt} />

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Haccın 3 Farzı: <strong>İhrama girmek</strong>, <strong>Arafat Vakfesi</strong> ve{' '}
              <strong>Ziyaret Tavafı</strong>. Umrede ise Arafat, Müzdelife, Mina ve Kurban bulunmaz; yılın her zamanı yapılabilir.
            </p>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs text-teal-700 dark:text-teal-400">
                Aşama {currentHajj.step}/6 · {currentHajj.ruleType} · {currentHajj.location}
              </p>
              <h3 className="mt-1 text-base font-semibold text-navy-900 dark:text-white">
                {currentHajj.name}
              </h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentHajj.summary}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong>Manevi Hikmeti:</strong> {currentHajj.spiritualMeaning}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              {HAJJ_STAGES.map((stage, idx) => (
                <button
                  key={stage.step}
                  type="button"
                  onClick={() => setHajjStageIdx(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    idx === hajjStageIdx
                      ? 'bg-navy-900 text-white dark:bg-teal-600'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>
                    <span className="font-mono tabular-nums mr-1.5">{stage.step}.</span>
                    {stage.name}
                  </span>
                  <span className="text-[11px] opacity-80">{stage.ruleType}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. FASTING SUN CYCLE & ZAKAT CALCULATOR */}
      {activeLab === 'fasting-zakat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Fasting 24h Interactive Arc */}
          <section className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Oruç İbadeti · 24 Saatlik İmsak – İftar Döngüsü
              </p>
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                {fastingPhase.label} · <span className="font-mono tabular-nums">{formatHour(hourOfDay)}</span>
              </h2>
            </div>

            <svg viewBox="0 0 360 205" className="w-full h-[200px] select-none" role="img" aria-label="Oruç vakitleri güneş ve ay döngüsü">
              <rect
                x="6"
                y="6"
                width="348"
                height="193"
                rx="12"
                fill={isDay ? 'rgba(14, 165, 233, 0.12)' : 'rgba(11, 31, 58, 0.88)'}
              />
              {/* Horizon */}
              <line x1="24" y1="175" x2="336" y2="175" stroke="#94A3B8" strokeWidth="1.5" />
              {/* Arc */}
              <path d="M 44 175 Q 180 28 316 175" fill="none" stroke="#C89B3C" strokeDasharray="4 4" strokeOpacity="0.6" />
              {/* Sun or Crescent */}
              {isDay ? (
                <circle cx={celestialX} cy={celestialY} r="15" fill="#F59E0B" stroke="#FDE68A" strokeWidth="3" />
              ) : (
                <g>
                  <circle cx={celestialX} cy={celestialY} r="13" fill="#FDE68A" />
                  <circle cx={celestialX + 5} cy={celestialY - 3} r="11" fill="#0B1F3A" />
                </g>
              )}
              <text x="44" y="191" textAnchor="middle" className="fill-slate-500 text-[10px] font-mono">
                04:30 İmsak
              </text>
              <text x="180" y="191" textAnchor="middle" className="fill-slate-500 text-[10px] font-mono">
                12:30 Öğle
              </text>
              <text x="316" y="191" textAnchor="middle" className="fill-slate-500 text-[10px] font-mono">
                19:45 İftar
              </text>
            </svg>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="fasting-hour-slider" className="font-medium text-slate-700 dark:text-slate-300">
                  Günün Saatini Kaydırın
                </label>
                <span className="font-mono tabular-nums text-navy-900 dark:text-white">
                  {formatHour(hourOfDay)} ({fastingPhase.isFasting ? 'Oruçlu' : 'Sahur / İftar Serbest'})
                </span>
              </div>
              <input
                id="fasting-hour-slider"
                type="range"
                min={0}
                max={23.75}
                step={0.25}
                value={hourOfDay}
                onChange={(e) => setHourOfDay(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {fastingPhase.detail}
            </p>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>
                <strong>Orucu Bozmayan Durumlar:</strong> Unutarak yiyip içmek, uyurken ihtilam olmak, kan aldırmak, göz damlası/gül koklamak.
              </p>
              <p>
                <strong>Ramazan Kavramları:</strong> Mukabele (karşılıklı Kur’an okumak), Fitre (fıtır sadakası), Kadir Gecesi (bin aydan hayırlı gece).
              </p>
            </div>
          </section>

          {/* Interactive Zakat & Kurban Calculator */}
          <section className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Zekât, Öşür ve Paylaşım Hesaplayıcısı
              </p>
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                Etkileşimli Zekât ve Nisap Simülatörü
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'cash', label: 'Altın / Para (1/40 · %2,5)' },
                  { id: 'rainCrop', label: 'Yağmurla Sulanan Ürün (1/10)' },
                  { id: 'irrigatedCrop', label: 'Masraflı Sulanan Ürün (1/20)' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setCropMode(mode.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    cropMode === mode.id
                      ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-500 dark:bg-teal-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1 text-xs">
                <span className="text-slate-600 dark:text-slate-300">
                  Birikim / Ürün Değeri (TL)
                </span>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={wealthTry}
                  onChange={(e) => setWealthTry(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono tabular-nums text-sm"
                />
              </label>
              <label className="block space-y-1 text-xs">
                <span className="text-slate-600 dark:text-slate-300">
                  Gram Altın Fiyatı (TL · Nisap 80,18 g)
                </span>
                <input
                  type="number"
                  min={500}
                  step={100}
                  value={goldGramPrice}
                  onChange={(e) => setGoldGramPrice(Math.max(500, Number(e.target.value) || 3000))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono tabular-nums text-sm"
                />
              </label>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nisap Sınırı (80,18 g)</p>
                <p className="mt-1 text-lg font-semibold font-mono tabular-nums text-navy-900 dark:text-white">
                  {nisapTry.toLocaleString('tr-TR')} TL
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Verilecek Zekât Tutarı</p>
                <p className="mt-1 text-lg font-semibold font-mono tabular-nums text-teal-700 dark:text-teal-400">
                  {zakatAmount.toLocaleString('tr-TR')} TL
                </p>
                {cropMode === 'cash' && wealthTry < nisapTry && (
                  <p className="text-[11px] text-amber-700 dark:text-gold-400 mt-0.5">
                    Nisap sınırının altında (Zekât farz değil; gönüllü sadaka verilebilir)
                  </p>
                )}
              </div>
            </div>

            {/* Kur'an'da Zekat Verilecek 8 Grup & Kurban 1/3 */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-navy-900 dark:text-white">
                Tevbe Suresi 60. Ayete Göre Zekât Verilecek 8 Grup
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {ZAKAT_RECIPIENTS.map((r) => (
                  <div key={r.group} className="p-2 rounded-lg bg-slate-50/80 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                    <p className="font-medium text-navy-900 dark:text-white">{r.group}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{r.note}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                <strong>Kurban Paylaşımı (Sünnet):</strong> 1/3 İhtiyaç sahipleri · 1/3 Komşu ve akrabalar · 1/3 Ev halkı.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
