import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
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
import { speakInstant, stopAllSpeech } from '../../../utils/englishAudio';

type WorshipLabTab = 'wudu' | 'prayer' | 'hajj' | 'fasting-zakat';

/* ---------- 1. ANIMATED WUDU SVG STAGE ---------- */
function WuduSvgStage({ step, waterPhase }: { step: WuduStep; waterPhase: number }) {
  const h = step.bodyHighlight;
  const activeColor = '#0D9488';
  const activeGlow = '#2DD4BF';
  const idleStroke = '#64748B';
  const dropOffset = (waterPhase % 24);

  const fillFor = (part: WuduStep['bodyHighlight']) =>
    h === part ? 'rgba(13, 148, 136, 0.28)' : 'rgba(148, 163, 184, 0.14)';
  const strokeFor = (part: WuduStep['bodyHighlight']) =>
    h === part ? activeColor : idleStroke;

  // Target coordinate for animated water droplets
  const dropletTarget: Record<WuduStep['bodyHighlight'], { x: number; y: number }> = {
    heart: { x: 180, y: 128 },
    hands: { x: 112, y: 185 },
    mouth: { x: 180, y: 78 },
    nose: { x: 180, y: 69 },
    face: { x: 180, y: 68 },
    arms: { x: 120, y: 150 },
    head: { x: 180, y: 40 },
    ears: { x: 210, y: 66 },
    feet: { x: 180, y: 274 },
  };
  const target = dropletTarget[h];

  return (
    <svg
      viewBox="0 0 360 320"
      className="w-full h-[300px] sm:h-[330px] select-none"
      role="img"
      aria-label={`Abdest Adım ${step.stepNumber}: ${step.title}`}
    >
      <defs>
        <linearGradient id="wuduBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1F3A" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#0D9488" stopOpacity="0.09" />
        </linearGradient>
      </defs>

      <rect x="8" y="8" width="344" height="304" rx="14" fill="url(#wuduBg)" />

      {/* Subtle architectural arch frame */}
      <path
        d="M 48 296 L 48 92 Q 180 12 312 92 L 312 296"
        fill="none"
        stroke="#C89B3C"
        strokeOpacity="0.3"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />

      {/* Head & Hair (Mesh) */}
      <path
        d="M 155 56 Q 180 28 205 56"
        fill={fillFor('head')}
        stroke={strokeFor('head')}
        strokeWidth={h === 'head' ? 3.5 : 2}
      />

      {/* Ears */}
      <ellipse
        cx="151"
        cy="66"
        rx="5"
        ry="9"
        fill={fillFor('ears')}
        stroke={strokeFor('ears')}
        strokeWidth={h === 'ears' ? 3 : 1.5}
      />
      <ellipse
        cx="209"
        cy="66"
        rx="5"
        ry="9"
        fill={fillFor('ears')}
        stroke={strokeFor('ears')}
        strokeWidth={h === 'ears' ? 3 : 1.5}
      />

      {/* Face */}
      <circle
        cx="180"
        cy="66"
        r="26"
        fill={fillFor('face')}
        stroke={strokeFor('face')}
        strokeWidth={h === 'face' ? 3.5 : 2}
      />

      {/* Nose */}
      <path
        d="M 180 61 L 177 70 L 183 70"
        fill="none"
        stroke={strokeFor('nose')}
        strokeWidth={h === 'nose' ? 3 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Mouth */}
      <path
        d="M 171 78 Q 180 84 189 78"
        fill="none"
        stroke={strokeFor('mouth')}
        strokeWidth={h === 'mouth' ? 3.2 : 1.6}
        strokeLinecap="round"
      />

      {/* Torso */}
      <rect
        x="148"
        y="98"
        width="64"
        height="96"
        rx="22"
        fill="rgba(148, 163, 184, 0.14)"
        stroke={idleStroke}
        strokeWidth="2"
      />

      {/* Heart (Niyet) */}
      <circle
        cx="180"
        cy="134"
        r={h === 'heart' ? 14 : 9}
        fill={h === 'heart' ? 'rgba(200, 155, 60, 0.35)' : 'rgba(148, 163, 184, 0.15)'}
        stroke={h === 'heart' ? '#C89B3C' : 'transparent'}
        strokeWidth="2.5"
      />

      {/* Arms (Dirseklerle beraber) */}
      <path
        d="M 148 112 L 116 154 L 112 184"
        fill="none"
        stroke={strokeFor('arms')}
        strokeWidth={h === 'arms' ? 13 : 10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 212 112 L 244 154 L 248 184"
        fill="none"
        stroke={strokeFor('arms')}
        strokeWidth={h === 'arms' ? 13 : 10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Hands */}
      <circle
        cx="112"
        cy="190"
        r="11"
        fill={fillFor('hands')}
        stroke={strokeFor('hands')}
        strokeWidth={h === 'hands' ? 3.5 : 2}
      />
      <circle
        cx="248"
        cy="190"
        r="11"
        fill={fillFor('hands')}
        stroke={strokeFor('hands')}
        strokeWidth={h === 'hands' ? 3.5 : 2}
      />

      {/* Legs */}
      <line x1="164" y1="194" x2="160" y2="262" stroke={idleStroke} strokeWidth="11" strokeLinecap="round" />
      <line x1="196" y1="194" x2="200" y2="262" stroke={idleStroke} strokeWidth="11" strokeLinecap="round" />

      {/* Feet (Topuklarla beraber) */}
      <ellipse
        cx="154"
        cy="274"
        rx="18"
        ry="10"
        fill={fillFor('feet')}
        stroke={strokeFor('feet')}
        strokeWidth={h === 'feet' ? 3.5 : 2}
      />
      <ellipse
        cx="206"
        cy="274"
        rx="18"
        ry="10"
        fill={fillFor('feet')}
        stroke={strokeFor('feet')}
        strokeWidth={h === 'feet' ? 3.5 : 2}
      />

      {/* Animated water ripples & droplets around active area */}
      <g>
        <circle
          cx={target.x}
          cy={target.y}
          r={18 + (waterPhase % 14)}
          fill="none"
          stroke={h === 'heart' ? '#C89B3C' : activeGlow}
          strokeOpacity={Math.max(0.15, 0.85 - (waterPhase % 14) / 16)}
          strokeWidth="2"
        />
        {h !== 'heart' && (
          <>
            <path
              d={`M ${target.x - 16} ${target.y - 26 + dropOffset * 0.7} q 4 7 0 11 q -4 -4 0 -11`}
              fill="#0EA5E9"
              opacity="0.85"
            />
            <path
              d={`M ${target.x + 18} ${target.y - 22 + ((dropOffset + 10) % 24) * 0.7} q 4 7 0 11 q -4 -4 0 -11`}
              fill="#0284C7"
              opacity="0.85"
            />
          </>
        )}
      </g>

      {/* Bottom Step Label */}
      <text
        x="180"
        y="303"
        textAnchor="middle"
        className="fill-slate-600 dark:fill-slate-300 text-[11px] font-medium"
      >
        Adım {step.stepNumber}/9 · {step.ruleType} · {step.repeatCount} Kez
      </text>
    </svg>
  );
}

/* ---------- 2. ARTICULATED NAMAZ POSTURE SVG STAGE ---------- */
interface FigureCoords {
  head: [number, number];
  shoulder: [number, number];
  hip: [number, number];
  knee: [number, number];
  foot: [number, number];
  elbow: [number, number];
  hand: [number, number];
  label: string;
}

const POSTURE_MAP: Record<PrayerPostureStep['postureKey'], FigureCoords> = {
  niyyah: {
    head: [190, 68],
    shoulder: [190, 96],
    hip: [190, 166],
    knee: [190, 218],
    foot: [184, 268],
    elbow: [186, 134],
    hand: [182, 164],
    label: 'Kıbleye Yönelme ve Niyet',
  },
  takbir: {
    head: [190, 68],
    shoulder: [190, 96],
    hip: [190, 166],
    knee: [190, 218],
    foot: [184, 268],
    elbow: [162, 114],
    hand: [168, 76],
    label: 'İftitah Tekbiri (Allâhu Ekber)',
  },
  qiyam: {
    head: [190, 68],
    shoulder: [190, 96],
    hip: [190, 166],
    knee: [190, 218],
    foot: [184, 268],
    elbow: [176, 132],
    hand: [164, 146],
    label: 'Kıyam ve Kıraat (Eller Bağlı)',
  },
  ruku: {
    head: [118, 146],
    shoulder: [144, 150],
    hip: [204, 152],
    knee: [198, 214],
    foot: [194, 268],
    elbow: [166, 184],
    hand: [194, 212],
    label: 'Rükû (Sırt Düz, Eller Dizlerde)',
  },
  qawmah: {
    head: [190, 68],
    shoulder: [190, 96],
    hip: [190, 166],
    knee: [190, 218],
    foot: [184, 268],
    elbow: [192, 134],
    hand: [192, 166],
    label: 'Kavme (Rükûdan Tam Doğrulma)',
  },
  sujud1: {
    head: [108, 254],
    shoulder: [138, 232],
    hip: [192, 198],
    knee: [198, 264],
    foot: [244, 264],
    elbow: [132, 256],
    hand: [118, 266],
    label: '1. Secde (Alın, Burun, Eller, Dizler Yerde)',
  },
  jalsa: {
    head: [186, 148],
    shoulder: [186, 174],
    hip: [196, 234],
    knee: [152, 262],
    foot: [232, 266],
    elbow: [176, 212],
    hand: [158, 246],
    label: 'Celse (İki Secde Arası Oturuş)',
  },
  sujud2: {
    head: [108, 254],
    shoulder: [138, 232],
    hip: [192, 198],
    knee: [198, 264],
    foot: [244, 264],
    elbow: [132, 256],
    hand: [118, 266],
    label: '2. Secde (Sübhâne Rabbiye’l-A’lâ)',
  },
  tashahhud: {
    head: [186, 148],
    shoulder: [186, 174],
    hip: [196, 234],
    knee: [152, 262],
    foot: [232, 266],
    elbow: [176, 212],
    hand: [156, 248],
    label: 'Ka’de-i Âhire (Ettehiyyâtü & Dualar)',
  },
  salam: {
    head: [186, 148],
    shoulder: [186, 174],
    hip: [196, 234],
    knee: [152, 262],
    foot: [232, 266],
    elbow: [176, 212],
    hand: [156, 248],
    label: 'Sağa ve Sola Selam',
  },
};

function PrayerPostureSvg({ step }: { step: PrayerPostureStep }) {
  const c = POSTURE_MAP[step.postureKey];

  return (
    <svg
      viewBox="0 0 360 310"
      className="w-full h-[290px] sm:h-[320px] select-none"
      role="img"
      aria-label={`Namaz Duruşu: ${step.title}`}
    >
      <rect x="8" y="8" width="344" height="294" rx="14" fill="rgba(11, 31, 58, 0.04)" />

      {/* Qibla direction arrow on left */}
      <g opacity="0.75">
        <line x1="68" y1="42" x2="36" y2="42" stroke="#C89B3C" strokeWidth="2" />
        <polyline points="44,36 36,42 44,48" fill="none" stroke="#C89B3C" strokeWidth="2" />
        <text x="76" y="46" className="fill-slate-500 dark:fill-slate-400 text-[10px] font-medium">
          Kıble Yönü
        </text>
      </g>

      {/* Prayer Mat (Seccade) */}
      <rect x="52" y="268" width="256" height="10" rx="5" fill="#0D9488" fillOpacity="0.85" />
      <rect x="56" y="271" width="248" height="4" rx="2" fill="#C89B3C" fillOpacity="0.65" />

      {/* Articulated Silhouette with smooth transitions */}
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Back leg / Shin */}
        <line
          x1={c.hip[0]}
          y1={c.hip[1]}
          x2={c.knee[0]}
          y2={c.knee[1]}
          stroke="#0B1F3A"
          className="dark:stroke-slate-200 transition-all duration-500"
          strokeWidth="12"
        />
        <line
          x1={c.knee[0]}
          y1={c.knee[1]}
          x2={c.foot[0]}
          y2={c.foot[1]}
          stroke="#0B1F3A"
          className="dark:stroke-slate-200 transition-all duration-500"
          strokeWidth="11"
        />

        {/* Torso */}
        <line
          x1={c.shoulder[0]}
          y1={c.shoulder[1]}
          x2={c.hip[0]}
          y2={c.hip[1]}
          stroke="#0D9488"
          className="transition-all duration-500"
          strokeWidth="18"
        />

        {/* Arm */}
        <line
          x1={c.shoulder[0]}
          y1={c.shoulder[1]}
          x2={c.elbow[0]}
          y2={c.elbow[1]}
          stroke="#C89B3C"
          className="transition-all duration-500"
          strokeWidth="9"
        />
        <line
          x1={c.elbow[0]}
          y1={c.elbow[1]}
          x2={c.hand[0]}
          y2={c.hand[1]}
          stroke="#C89B3C"
          className="transition-all duration-500"
          strokeWidth="8"
        />

        {/* Head */}
        <circle
          cx={c.head[0]}
          cy={c.head[1]}
          r="17"
          fill="#0B1F3A"
          className="dark:fill-slate-100 transition-all duration-500"
        />

        {/* Salam directional cue */}
        {step.postureKey === 'salam' && (
          <g>
            <path d="M 162 132 Q 186 116 210 132" fill="none" stroke="#C89B3C" strokeWidth="2.5" strokeDasharray="3 3" />
            <text x="186" y="112" textAnchor="middle" className="fill-gold-600 dark:fill-gold-400 text-[10px] font-semibold">
              Sağa ve Sola Selam
            </text>
          </g>
        )}
      </g>

      <text
        x="180"
        y="296"
        textAnchor="middle"
        className="fill-slate-600 dark:fill-slate-300 text-[11px] font-medium"
      >
        {c.label}
      </text>
    </svg>
  );
}

/* ---------- 3. KAABA TAWAF & SA'Y ANIMATION ---------- */
function HajjTawafSvg({ angleDeg, shawt }: { angleDeg: number; shawt: number }) {
  const rad = (angleDeg * Math.PI) / 180;
  // Counter-clockwise orbit around Kaaba (cx=180, cy=135, r=76)
  const px = 180 + Math.cos(-rad) * 76;
  const py = 135 + Math.sin(-rad) * 76;
  const sayProgress = ((angleDeg % 360) / 360);
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
export function WorshipAnimationsLab() {
  const [activeLab, setActiveLab] = useState<WorshipLabTab>('wudu');

  // Wudu state
  const [wuduIdx, setWuduIdx] = useState(0);
  const [wuduPlaying, setWuduPlaying] = useState(true);
  const [waterPhase, setWaterPhase] = useState(0);

  // Prayer state
  const [prayerIdx, setPrayerIdx] = useState(0);
  const [prayerPlaying, setPrayerPlaying] = useState(false);

  // Hajj state
  const [hajjStageIdx, setHajjStageIdx] = useState(4);
  const [tawafPlaying, setTawafPlaying] = useState(true);
  const [tawafAngle, setTawafAngle] = useState(0);

  // Fasting & Zakat state
  const [hourOfDay, setHourOfDay] = useState(12.5);
  const [wealthTry, setWealthTry] = useState(420000);
  const [goldGramPrice, setGoldGramPrice] = useState(3200);
  const [cropMode, setCropMode] = useState<'cash' | 'rainCrop' | 'irrigatedCrop'>('cash');

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

  // Auto-advance Wudu steps when playing
  useEffect(() => {
    if (activeLab !== 'wudu' || !wuduPlaying) return undefined;
    const id = window.setInterval(() => {
      setWuduIdx((i) => (i + 1) % WUDU_STEPS.length);
    }, 3600);
    return () => window.clearInterval(id);
  }, [activeLab, wuduPlaying]);

  // Auto-advance Prayer steps when playing
  useEffect(() => {
    if (activeLab !== 'prayer' || !prayerPlaying) return undefined;
    const id = window.setInterval(() => {
      setPrayerIdx((i) => (i + 1) % PRAYER_POSTURE_STEPS.length);
    }, 3400);
    return () => window.clearInterval(id);
  }, [activeLab, prayerPlaying]);

  useEffect(() => () => stopAllSpeech(), []);

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
  const celestialX = 44 + (isDay ? sunProgress : (hourOfDay < 4.5 ? hourOfDay / 4.5 : (hourOfDay - 19.75) / 4.25)) * 272;
  const celestialY = isDay
    ? 175 - Math.sin(sunProgress * Math.PI) * 115
    : 120 - Math.sin(((hourOfDay < 4.5 ? hourOfDay / 4.5 : (hourOfDay - 19.75) / 4.25)) * Math.PI) * 50;

  return (
    <div className="space-y-6">
      {/* Sub-lab selector */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-fit">
        {(
          [
            { id: 'wudu', label: 'Abdest Animasyonu (9 Adım)' },
            { id: 'prayer', label: 'Namaz Hareketleri (10 Aşama)' },
            { id: 'hajj', label: 'Hac & Kâbe Tavaf Animasyonu' },
            { id: 'fasting-zakat', label: 'Oruç Döngüsü & Zekât Hesaplayıcı' },
          ] as { id: WorshipLabTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveLab(tab.id)}
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

      {/* 1. WUDU ANIMATION LAB */}
      {activeLab === 'wudu' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Stage */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  Abdest Rehberi · 4 Farz + 5 Sünnet Aşaması
                </p>
                <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                  {currentWudu.stepNumber}. {currentWudu.title}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setWuduPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
                >
                  {wuduPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{wuduPlaying ? 'Duraklat' : 'Oynat'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWuduPlaying(false);
                    setWuduIdx(0);
                  }}
                  aria-label="Başa dön"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <WuduSvgStage step={currentWudu} waterPhase={waterPhase} />

            {/* Step Controls */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setWuduPlaying(false);
                  setWuduIdx((i) => (i - 1 + WUDU_STEPS.length) % WUDU_STEPS.length);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Önceki Adım</span>
              </button>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                Adım {currentWudu.stepNumber} / {WUDU_STEPS.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  setWuduPlaying(false);
                  setWuduIdx((i) => (i + 1) % WUDU_STEPS.length);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
              >
                <span>Sonraki Adım</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Control & Concept Deck */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5">
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hüküm:{' '}
                <strong
                  className={
                    currentWudu.ruleType === 'Farz'
                      ? 'text-amber-700 dark:text-gold-400'
                      : 'text-teal-700 dark:text-teal-400'
                  }
                >
                  {currentWudu.ruleType}
                </strong>{' '}
                · Tekrar: <strong className="font-mono tabular-nums">{currentWudu.repeatCount} kez</strong> ·{' '}
                {currentWudu.arabicOrShort}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {currentWudu.description}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                <strong>Not:</strong> {currentWudu.duaOrNote}
              </p>
              <button
                type="button"
                onClick={() =>
                  speakInstant(`${currentWudu.title}. ${currentWudu.description}`, { lang: 'tr-TR', rate: 0.95 })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              >
                <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Bu Adımı Sesli Dinle</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <p className="text-xs font-semibold text-navy-900 dark:text-white mb-2">
                Tüm Abdest Adımları
              </p>
              {WUDU_STEPS.map((st, idx) => (
                <button
                  key={st.stepNumber}
                  type="button"
                  onClick={() => {
                    setWuduPlaying(false);
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
          </div>
        </section>
      )}

      {/* 2. PRAYER POSTURES ANIMATION + DAILY TABLE */}
      {activeLab === 'prayer' && (
        <div className="space-y-6">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                    Canlı Rekat Simülasyonu · Namazın Rükünleri
                  </p>
                  <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                    {currentPrayer.stepNumber}. {currentPrayer.title}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPrayerPlaying((p) => !p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
                  >
                    {prayerPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{prayerPlaying ? 'Duraklat' : 'Otomatik Oynat'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrayerPlaying(false);
                      setPrayerIdx(0);
                    }}
                    aria-label="Başa dön"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <PrayerPostureSvg step={currentPrayer} />

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setPrayerPlaying(false);
                    setPrayerIdx((i) => (i - 1 + PRAYER_POSTURE_STEPS.length) % PRAYER_POSTURE_STEPS.length);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Önceki Hareket</span>
                </button>
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  Aşama {currentPrayer.stepNumber} / {PRAYER_POSTURE_STEPS.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPrayerPlaying(false);
                    setPrayerIdx((i) => (i + 1) % PRAYER_POSTURE_STEPS.length);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer whitespace-nowrap"
                >
                  <span>Sonraki Hareket</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hüküm: <strong className="text-teal-700 dark:text-teal-400">{currentPrayer.ruleType}</strong>
                </p>
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="text-xs font-semibold text-navy-900 dark:text-white">Okunan Tesbih / Dua</p>
                  <p className="text-sm font-medium text-teal-800 dark:text-teal-300">{currentPrayer.recitationTr}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Anlamı: {currentPrayer.meaningTr}</p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentPrayer.howToPerform}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    speakInstant(
                      `${currentPrayer.title}. ${currentPrayer.howToPerform} Okunuşu: ${currentPrayer.recitationTr}`,
                      { lang: 'tr-TR', rate: 0.95 }
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                >
                  <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Anlatımı Sesli Dinle</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1.5">
                {PRAYER_POSTURE_STEPS.map((st, idx) => (
                  <button
                    key={st.stepNumber}
                    type="button"
                    onClick={() => {
                      setPrayerPlaying(false);
                      setPrayerIdx(idx);
                    }}
                    className={`text-left px-2.5 py-2 rounded-lg text-xs truncate transition-colors cursor-pointer ${
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
