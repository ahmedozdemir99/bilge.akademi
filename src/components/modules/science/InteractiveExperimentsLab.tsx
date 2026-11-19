import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Droplets,
  Flame,
  Info,
  Pause,
  Play,
  RotateCcw,
  Scale,
  Sun,
  Zap,
} from 'lucide-react';
import { PH_SUBSTANCES } from '../../../data/scienceRichData';

type ExperimentId = 'circuit' | 'ph' | 'lever' | 'photosynthesis' | 'seasons';

const EXPERIMENT_TABS: { id: ExperimentId; label: string; grade: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'circuit', label: 'Elektrik Devresi', grade: '6–8. Sınıf', icon: Zap },
  { id: 'ph', label: 'Asit, Baz ve pH', grade: '8. Sınıf', icon: Droplets },
  { id: 'lever', label: 'Kaldıraç Dengesi', grade: '8. Sınıf', icon: Scale },
  { id: 'photosynthesis', label: 'Fotosentez Hızı', grade: '8. Sınıf', icon: Flame },
  { id: 'seasons', label: 'Mevsimler & Eksen', grade: '8. Sınıf', icon: Sun },
];

type LightColorKey = 'purple' | 'blue' | 'green' | 'red' | 'white';

const LIGHT_COLORS: Record<
  LightColorKey,
  { label: string; hex: string; efficiency: number; note: string }
> = {
  purple: { label: 'Mor Işık', hex: '#7C3AED', efficiency: 1.0, note: 'Klorofil mor ışığı en yüksek oranda soğurur (En hızlı fotosentez).' },
  red: { label: 'Kırmızı Işık', hex: '#DC2626', efficiency: 0.92, note: 'Kırmızı dalga boyu klorofil tarafından çok verimli soğurulur.' },
  blue: { label: 'Mavi Işık', hex: '#2563EB', efficiency: 0.85, note: 'Mavi ışık fotosentez için yüksek enerji sağlar.' },
  white: { label: 'Beyaz (Güneş) Işığı', hex: '#F59E0B', efficiency: 0.88, note: 'Tüm renkleri içerdiği için dengeli ve yüksek fotosentez sağlar.' },
  green: { label: 'Yeşil Işık', hex: '#16A34A', efficiency: 0.16, note: 'Klorofil yeşil ışığın çoğunu yansıttığı için fotosentez en yavaş düzeydedir.' },
};

export function InteractiveExperimentsLab() {
  const [activeExp, setActiveExp] = useState<ExperimentId>('circuit');

  // --- 1. Circuit & Ohm's Law state ---
  const [circuitMode, setCircuitMode] = useState<'series' | 'parallel'>('series');
  const [voltage, setVoltage] = useState(12);
  const [bulbResistance, setBulbResistance] = useState(4);
  const [bulbCount, setBulbCount] = useState(2);
  const [switchClosed, setSwitchClosed] = useState(true);

  const circuitStats = useMemo(() => {
    const rEq =
      circuitMode === 'series'
        ? bulbResistance * bulbCount
        : bulbResistance / bulbCount;
    const totalCurrent = switchClosed ? voltage / rEq : 0;
    const bulbCurrent = switchClosed
      ? circuitMode === 'series'
        ? totalCurrent
        : voltage / bulbResistance
      : 0;
    const bulbVoltage = switchClosed
      ? circuitMode === 'series'
        ? voltage / bulbCount
        : voltage
      : 0;
    const power = switchClosed ? voltage * totalCurrent : 0;
    const brightnessPct = Math.min(100, Math.round((bulbCurrent / 4) * 100));
    const statusLabel = !switchClosed
      ? 'Devre Açık (Akım Geçmiyor)'
      : brightnessPct >= 75
        ? 'Yüksek Parlaklık (Güçlü Akım)'
        : brightnessPct >= 35
          ? 'İdeal Parlaklık'
          : 'Düşük Parlaklık';
    return { rEq, totalCurrent, bulbCurrent, bulbVoltage, power, brightnessPct, statusLabel };
  }, [bulbCount, bulbResistance, circuitMode, switchClosed, voltage]);

  // --- 2. Acid-Base & pH Lab state ---
  const [phMode, setPhMode] = useState<'substances' | 'neutralize'>('substances');
  const [selectedSubstanceId, setSelectedSubstanceId] = useState(PH_SUBSTANCES[1].id);
  const [customPh, setCustomPh] = useState<number>(2.2);
  const [acidMl, setAcidMl] = useState<number>(50);
  const [baseMl, setBaseMl] = useState<number>(50);

  const activePhInfo = useMemo(() => {
    if (phMode === 'neutralize') {
      const diff = baseMl - acidMl; // -100..+100
      const computedPh = Math.max(1, Math.min(13, Number((7 + (diff / 100) * 5.5).toFixed(1))));
      const type: 'Asit' | 'Nötr' | 'Baz' =
        computedPh < 6.7 ? 'Asit' : computedPh > 7.3 ? 'Baz' : 'Nötr';
      const liquidColor =
        computedPh < 3.5
          ? '#EF4444'
          : computedPh < 6.7
            ? '#F59E0B'
            : computedPh <= 7.3
              ? '#10B981'
              : computedPh < 10.5
                ? '#0284C7'
                : '#4F46E5';
      return {
        name:
          type === 'Nötr'
            ? 'Tam Nötralleşme (Tuz + Su)'
            : type === 'Asit'
              ? 'Asit Fazlası İçeren Karışım'
              : 'Baz Fazlası İçeren Karışım',
        ph: computedPh,
        type,
        liquidColor,
        redLitmus: type === 'Baz' ? 'Maviye döner' : 'Kırmızı kalır',
        blueLitmus: type === 'Asit' ? 'Kırmızıya döner' : 'Mavi kalır',
        phenolphthalein: type === 'Baz' ? 'Pembeleşir' : 'Renksiz kalır',
        methylOrange: type === 'Asit' ? 'Kırmızıya döner' : type === 'Baz' ? 'Sarıya döner' : 'Turuncu kalır',
        note:
          type === 'Nötr'
            ? 'HCl (Asit) + NaOH (Baz) → NaCl (Tuz) + H₂O (Su). Eşit hacimde kuvvetli asit ve baz birbirini nötrledi!'
            : 'Eşit miktarda asit ve baz karıştırdığınızda pH tam 7,0’a yaklaşır ve nötr tuz + su oluşur.',
      };
    }

    const found = PH_SUBSTANCES.find((s) => s.id === selectedSubstanceId);
    const phVal = customPh;
    const type: 'Asit' | 'Nötr' | 'Baz' = phVal < 6.8 ? 'Asit' : phVal > 7.2 ? 'Baz' : 'Nötr';
    const liquidColor =
      phVal < 3
        ? '#EF4444'
        : phVal < 5.5
          ? '#F97316'
          : phVal < 6.8
            ? '#F59E0B'
            : phVal <= 7.2
              ? '#10B981'
              : phVal < 9.5
                ? '#14B8A6'
                : phVal < 11.5
                  ? '#0284C7'
                  : '#4F46E5';
    return {
      name: found && Math.abs(found.ph - phVal) < 0.05 ? found.name : `Özel Çözelti (pH ${phVal.toFixed(1)})`,
      ph: phVal,
      type,
      liquidColor,
      redLitmus: type === 'Baz' ? 'Maviye döner' : 'Kırmızı kalır',
      blueLitmus: type === 'Asit' ? 'Kırmızıya döner' : 'Mavi kalır',
      phenolphthalein: type === 'Baz' ? 'Pembeleşir' : 'Renksiz kalır',
      methylOrange: type === 'Asit' ? 'Kırmızıya döner' : type === 'Baz' ? 'Sarıya döner' : 'Turuncu kalır',
      note:
        found && Math.abs(found.ph - phVal) < 0.05
          ? found.note
          : type === 'Asit'
            ? 'pH < 7 olduğu için çözeltide H⁺ iyonu baskındır ve asidik özellik gösterir.'
            : type === 'Baz'
              ? 'pH > 7 olduğu için çözeltide OH⁻ iyonu baskındır ve bazik özellik gösterir.'
              : 'pH = 7 olan nötr çözeltidir; turnusol kâğıdının rengini değiştirmez.',
    };
  }, [acidMl, baseMl, customPh, phMode, selectedSubstanceId]);

  // --- 3. Lever (Basit Makineler) state ---
  const [loadForce, setLoadForce] = useState(60); // N
  const [loadArm, setLoadArm] = useState(2); // m
  const [effortArm, setEffortArm] = useState(4); // m
  const [appliedForce, setAppliedForce] = useState(30); // N

  const leverStats = useMemo(() => {
    const loadMoment = loadForce * loadArm;
    const effortMoment = appliedForce * effortArm;
    const idealForce = Number((loadMoment / effortArm).toFixed(1));
    const advantage = Number((effortArm / loadArm).toFixed(2));
    const diff = effortMoment - loadMoment;
    const tiltDeg = Math.max(-16, Math.min(16, (diff / Math.max(100, loadMoment)) * 18));
    const state: 'balanced' | 'loadHeavy' | 'effortHeavy' =
      Math.abs(diff) <= 2 ? 'balanced' : diff < 0 ? 'loadHeavy' : 'effortHeavy';
    return { loadMoment, effortMoment, idealForce, advantage, tiltDeg, state };
  }, [appliedForce, effortArm, loadArm, loadForce]);

  // --- 4. Photosynthesis Lab state ---
  const [lightIntensity, setLightIntensity] = useState(80);
  const [lightColor, setLightColor] = useState<LightColorKey>('purple');
  const [temperature, setTemperature] = useState(28);
  const [co2Level, setCo2Level] = useState(75);
  const [photoPlaying, setPhotoPlaying] = useState(true);
  const [bubbleTick, setBubbleTick] = useState(0);

  useEffect(() => {
    if (!photoPlaying || activeExp !== 'photosynthesis') return;
    const timer = window.setInterval(() => {
      setBubbleTick((t) => (t + 1) % 1000);
    }, 120);
    return () => window.clearInterval(timer);
  }, [activeExp, photoPlaying]);

  const photoStats = useMemo(() => {
    const colorFactor = LIGHT_COLORS[lightColor].efficiency;
    const lightFactor = lightIntensity / 100;
    const co2Factor = co2Level / 100;
    // Optimum enzyme bell curve around 30°C; denatures past 48°C
    let tempFactor = 0;
    if (temperature <= 4 || temperature >= 52) {
      tempFactor = 0.04;
    } else if (temperature <= 30) {
      tempFactor = Math.max(0.08, (temperature - 4) / 26);
    } else {
      tempFactor = Math.max(0.04, 1 - (temperature - 30) / 22);
    }

    const rate = Math.round(lightFactor * colorFactor * co2Factor * tempFactor * 60);
    const factors = [
      { key: 'Işık Şiddeti', val: lightFactor },
      { key: 'Işık Rengi (Klorofil Soğurumu)', val: colorFactor },
      { key: 'Sıcaklık (Enzim Verimi)', val: tempFactor },
      { key: 'CO₂ Yoğunluğu', val: co2Factor },
    ];
    const limiting = factors.reduce((min, item) => (item.val < min.val ? item : min), factors[0]);
    return { rate, limiting: limiting.key, tempFactor };
  }, [co2Level, lightColor, lightIntensity, temperature]);

  // --- 5. Seasons & Axial Tilt state ---
  const [orbitAngle, setOrbitAngle] = useState(90); // 0=21 Mart, 90=21 Haziran, 180=23 Eylül, 270=21 Aralık
  const [axialTiltOn, setAxialTiltOn] = useState(true);
  const [orbitPlaying, setOrbitPlaying] = useState(false);

  useEffect(() => {
    if (!orbitPlaying || activeExp !== 'seasons') return;
    const timer = window.setInterval(() => {
      setOrbitAngle((a) => (a + 2) % 360);
    }, 90);
    return () => window.clearInterval(timer);
  }, [activeExp, orbitPlaying]);

  const seasonInfo = useMemo(() => {
    // sin(orbitAngle): +1 at 90° (June 21), -1 at 270° (Dec 21)
    const rad = (orbitAngle * Math.PI) / 180;
    const tiltEffect = axialTiltOn ? Math.sin(rad) : 0;
    // Turkey ~40°N: noon sun angle = 90 - 40 + 23.5*tiltEffect
    const turkeySunAngle = Math.round(50 + 23.5 * tiltEffect);
    const daylightHours = Number((12 + 3.1 * tiltEffect).toFixed(1));
    const nightHours = Number((24 - daylightHours).toFixed(1));

    let dateLabel = '21 Mart (İlkbahar Ekinoksu)';
    let northSeason = 'İlkbahar';
    let southSeason = 'Sonbahar';
    if (!axialTiltOn) {
      northSeason = 'Mevsim Oluşmaz (Sabit)';
      southSeason = 'Mevsim Oluşmaz (Sabit)';
      dateLabel = 'Eksen Eğikliği 0° (Karşılaştırma Modu)';
    } else if (orbitAngle >= 45 && orbitAngle < 135) {
      dateLabel = orbitAngle === 90 ? '21 Haziran (Yaz Gündönümü)' : 'Haziran – Temmuz Dönemi';
      northSeason = 'Yaz';
      southSeason = 'Kış';
    } else if (orbitAngle >= 135 && orbitAngle < 225) {
      dateLabel = orbitAngle === 180 ? '23 Eylül (Sonbahar Ekinoksu)' : 'Eylül – Ekim Dönemi';
      northSeason = 'Sonbahar';
      southSeason = 'İlkbahar';
    } else if (orbitAngle >= 225 && orbitAngle < 315) {
      dateLabel = orbitAngle === 270 ? '21 Aralık (Kış Gündönümü)' : 'Aralık – Ocak Dönemi';
      northSeason = 'Kış';
      southSeason = 'Yaz';
    } else {
      dateLabel = orbitAngle === 0 ? '21 Mart (İlkbahar Ekinoksu)' : 'Mart – Nisan Dönemi';
      northSeason = 'İlkbahar';
      southSeason = 'Sonbahar';
    }

    const earthX = 210 + Math.cos(rad) * 125;
    const earthY = 135 - Math.sin(rad) * 78;
    return {
      dateLabel,
      northSeason,
      southSeason,
      turkeySunAngle,
      daylightHours,
      nightHours,
      earthX,
      earthY,
      tiltEffect,
    };
  }, [axialTiltOn, orbitAngle]);

  return (
    <div className="space-y-6">
      {/* Experiment Selector Strip */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {EXPERIMENT_TABS.map((exp) => {
          const Icon = exp.icon;
          const active = activeExp === exp.id;
          return (
            <button
              key={exp.id}
              type="button"
              onClick={() => setActiveExp(exp.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-navy-900 text-white dark:bg-teal-600'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{exp.label}</span>
              <span className={`text-[11px] ${active ? 'text-gold-300 dark:text-white/80' : 'text-slate-400'}`}>
                · {exp.grade}
              </span>
            </button>
          );
        })}
      </div>

      {/* EXPERIMENT 1: ELECTRIC CIRCUIT & OHM'S LAW */}
      {activeExp === 'circuit' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Interactive Stage (Left 7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  Deney 01 · Ohm Yasası &amp; Devre Bağlantıları (V = I · R)
                </p>
                <h2 className="text-lg font-semibold text-navy-900 dark:text-white mt-0.5">
                  Canlı Elektrik Devresi Simülatörü
                </h2>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                  !switchClosed
                    ? 'text-slate-500 dark:text-slate-400'
                    : circuitStats.brightnessPct >= 75
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-teal-700 dark:text-teal-400'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{circuitStats.statusLabel}</span>
              </span>
            </div>

            {/* Animated SVG Circuit Diagram */}
            <div className="my-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 overflow-hidden">
              <svg
                viewBox="0 0 560 280"
                className="w-full h-auto max-h-[290px]"
                role="img"
                aria-label="Etkileşimli elektrik devresi çizimi"
              >
                {/* Outer main wire rectangle */}
                <rect
                  x="65"
                  y="45"
                  width="430"
                  height="190"
                  rx="16"
                  fill="none"
                  stroke={switchClosed ? '#0D9488' : '#94A3B8'}
                  strokeWidth="4"
                />

                {/* Animated electron pulse overlay when closed */}
                {switchClosed && (
                  <rect
                    x="65"
                    y="45"
                    width="430"
                    height="190"
                    rx="16"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    strokeDasharray="8 22"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-120"
                      dur={`${Math.max(0.45, 3.2 / Math.max(0.4, circuitStats.totalCurrent))}s`}
                      repeatCount="indefinite"
                    />
                  </rect>
                )}

                {/* Parallel extra branches if parallel mode */}
                {circuitMode === 'parallel' && bulbCount >= 2 && (
                  <line
                    x1="165"
                    y1="108"
                    x2="395"
                    y2="108"
                    stroke={switchClosed ? '#0D9488' : '#94A3B8'}
                    strokeWidth="3.5"
                  />
                )}
                {circuitMode === 'parallel' && bulbCount >= 3 && (
                  <line
                    x1="165"
                    y1="168"
                    x2="395"
                    y2="168"
                    stroke={switchClosed ? '#0D9488' : '#94A3B8'}
                    strokeWidth="3.5"
                  />
                )}
                {circuitMode === 'parallel' && bulbCount >= 2 && (
                  <>
                    <line x1="165" y1="45" x2="165" y2={bulbCount === 3 ? 168 : 108} stroke={switchClosed ? '#0D9488' : '#94A3B8'} strokeWidth="3.5" />
                    <line x1="395" y1="45" x2="395" y2={bulbCount === 3 ? 168 : 108} stroke={switchClosed ? '#0D9488' : '#94A3B8'} strokeWidth="3.5" />
                  </>
                )}

                {/* Battery (Left Vertical Side) */}
                <g transform="translate(65, 140)">
                  <rect x="-24" y="-34" width="48" height="68" rx="6" className="fill-white dark:fill-slate-900" stroke="#0B1F3A" strokeWidth="2" />
                  <line x1="-14" y1="-10" x2="14" y2="-10" stroke="#DC2626" strokeWidth="4" />
                  <line x1="-8" y1="10" x2="8" y2="10" stroke="#0B1F3A" strokeWidth="4" />
                  <text x="-18" y="-16" className="fill-red-600 text-[11px] font-bold">+</text>
                  <text x="-18" y="24" className="fill-slate-500 text-[11px] font-bold">−</text>
                  <text x="-38" y="48" className="fill-slate-700 dark:fill-slate-200 text-[11px] font-mono font-semibold">
                    Pil: {voltage} V
                  </text>
                </g>

                {/* Switch (Bottom Wire) */}
                <g
                  transform="translate(280, 235)"
                  onClick={() => setSwitchClosed((s) => !s)}
                  className="cursor-pointer"
                >
                  <rect x="-42" y="-16" width="84" height="32" rx="6" className="fill-slate-50 dark:fill-slate-950" />
                  <circle cx="-24" cy="0" r="5" fill="#0B1F3A" />
                  <circle cx="24" cy="0" r="5" fill="#0B1F3A" />
                  <line
                    x1="-24"
                    y1="0"
                    x2="22"
                    y2={switchClosed ? '0' : '-20'}
                    stroke={switchClosed ? '#0D9488' : '#DC2626'}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <text x="-38" y="26" className="fill-slate-700 dark:fill-slate-300 text-[11px] font-medium">
                    Anahtar: {switchClosed ? 'Kapalı' : 'Açık'}
                  </text>
                </g>

                {/* Ammeter (Right Vertical Side) */}
                <g transform="translate(495, 140)">
                  <circle r="24" className="fill-white dark:fill-slate-900" stroke="#0D9488" strokeWidth="3" />
                  <text x="0" y="-3" textAnchor="middle" className="fill-teal-700 dark:fill-teal-400 text-[11px] font-bold">
                    A
                  </text>
                  <text x="0" y="12" textAnchor="middle" className="fill-navy-900 dark:fill-white text-[10px] font-mono font-semibold">
                    {circuitStats.totalCurrent.toFixed(2)}A
                  </text>
                </g>

                {/* Bulbs */}
                {Array.from({ length: bulbCount }).map((_, idx) => {
                  const cx =
                    circuitMode === 'series'
                      ? bulbCount === 1
                        ? 280
                        : bulbCount === 2
                          ? 215 + idx * 130
                          : 175 + idx * 105
                      : 280;
                  const cy =
                    circuitMode === 'series' ? 45 : 45 + idx * 62;
                  const glowOpacity = switchClosed ? Math.max(0.18, circuitStats.brightnessPct / 100) : 0;
                  return (
                    <g key={idx} transform={`translate(${cx}, ${cy})`}>
                      {switchClosed && (
                        <circle
                          r={24 + (circuitStats.brightnessPct / 100) * 14}
                          fill="#F59E0B"
                          opacity={glowOpacity * 0.42}
                        />
                      )}
                      <circle
                        r="18"
                        fill={switchClosed ? '#FEF08A' : '#E2E8F0'}
                        fillOpacity={switchClosed ? Math.max(0.35, glowOpacity) : 0.85}
                        stroke="#0B1F3A"
                        strokeWidth="2.5"
                      />
                      <line x1="-10" y1="-10" x2="10" y2="10" stroke="#0B1F3A" strokeWidth="2" />
                      <line x1="10" y1="-10" x2="-10" y2="10" stroke="#0B1F3A" strokeWidth="2" />
                      <text
                        x="0"
                        y="-24"
                        textAnchor="middle"
                        className="fill-slate-700 dark:fill-slate-300 text-[10px] font-mono"
                      >
                        L{idx + 1} ({bulbResistance}Ω)
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Live Quantitative Telemetry Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Eşdeğer Direnç</p>
                <p className="mt-0.5 text-lg font-semibold font-mono tabular-nums text-navy-900 dark:text-white">
                  {circuitStats.rEq.toFixed(2)} Ω
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Ana Kol Akımı (I)</p>
                <p className="mt-0.5 text-lg font-semibold font-mono tabular-nums text-teal-700 dark:text-teal-400">
                  {circuitStats.totalCurrent.toFixed(2)} A
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Ampul Başına Gerilim</p>
                <p className="mt-0.5 text-lg font-semibold font-mono tabular-nums text-navy-900 dark:text-white">
                  {circuitStats.bulbVoltage.toFixed(1)} V
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Devre Gücü (P)</p>
                <p className="mt-0.5 text-lg font-semibold font-mono tabular-nums text-gold-600 dark:text-gold-400">
                  {circuitStats.power.toFixed(1)} W
                </p>
              </div>
            </div>
          </div>

          {/* Control & Concept Deck (Right 5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-navy-900 dark:text-white">
                  Deney Kontrol Paneli
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setCircuitMode('series');
                    setVoltage(12);
                    setBulbResistance(4);
                    setBulbCount(2);
                    setSwitchClosed(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-navy-900 dark:hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>

              {/* Series vs Parallel Toggle */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Bağlantı Türü
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setCircuitMode('series')}
                    className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      circuitMode === 'series'
                        ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Seri Bağlı Devre
                  </button>
                  <button
                    type="button"
                    onClick={() => setCircuitMode('parallel')}
                    className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      circuitMode === 'parallel'
                        ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Paralel Bağlı Devre
                  </button>
                </div>
              </div>

              {/* Switch Button */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Devre Anahtarı Durumu
                </span>
                <button
                  type="button"
                  onClick={() => setSwitchClosed((s) => !s)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    switchClosed
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {switchClosed ? 'Kapalı (Akım Var)' : 'Açık (Akım Yok)'}
                </button>
              </div>

              {/* Sliders with explicit units */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="sci-volt" className="text-slate-600 dark:text-slate-300 font-medium">
                    Pil Gerilimi (V)
                  </label>
                  <span className="font-mono font-semibold tabular-nums text-navy-900 dark:text-white">
                    {voltage} Volt
                  </span>
                </div>
                <input
                  id="sci-volt"
                  type="range"
                  min={3}
                  max={24}
                  step={3}
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="sci-res" className="text-slate-600 dark:text-slate-300 font-medium">
                    Her Ampulün Direnci (R)
                  </label>
                  <span className="font-mono font-semibold tabular-nums text-navy-900 dark:text-white">
                    {bulbResistance} Ohm (Ω)
                  </span>
                </div>
                <input
                  id="sci-res"
                  type="range"
                  min={2}
                  max={12}
                  step={2}
                  value={bulbResistance}
                  onChange={(e) => setBulbResistance(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="sci-bulbs" className="text-slate-600 dark:text-slate-300 font-medium">
                    Ampul Sayısı
                  </label>
                  <span className="font-mono font-semibold tabular-nums text-navy-900 dark:text-white">
                    {bulbCount} Adet
                  </span>
                </div>
                <input
                  id="sci-bulbs"
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  value={bulbCount}
                  onChange={(e) => setBulbCount(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-semibold text-navy-900 dark:text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Bilimsel Gözlem Notu</span>
              </p>
              <p>
                {circuitMode === 'series'
                  ? 'Seri devrede ampul sayısı arttıkça toplam direnç artar, akım azalır ve ampuller daha sönük yanar.'
                  : 'Paralel devrede her ampul pilin tam gerilimini (V) aldığı için ampul eklemek parlaklığı azaltmaz; ancak pilden çekilen toplam akım artar.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* EXPERIMENT 2: ACID-BASE & pH LAB */}
      {activeExp === 'ph' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  Deney 02 · Asitler, Bazlar, Belirteçler ve Nötralleşme
                </p>
                <h2 className="text-lg font-semibold text-navy-900 dark:text-white mt-0.5">
                  Sanal pH Ölçer ve Turnusol Laboratuvarı
                </h2>
              </div>
              <span className="text-xs font-mono font-semibold tabular-nums text-navy-900 dark:text-gold-400">
                pH {activePhInfo.ph.toFixed(1)} · {activePhInfo.type}
              </span>
            </div>

            {/* Interactive Beaker & Litmus Visual */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              <div className="sm:col-span-6 flex justify-center">
                <svg viewBox="0 0 260 220" className="w-full max-w-[260px] h-auto" role="img" aria-label="Sanal pH beherglass ve turnusol kâğıtları">
                  {/* Beaker glass */}
                  <path
                    d="M50 35 L50 180 Q50 198 68 198 L192 198 Q210 198 210 180 L210 35"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Liquid */}
                  <path
                    d="M54 96 L54 178 Q54 193 69 193 L191 193 Q206 193 206 178 L206 96 Z"
                    fill={activePhInfo.liquidColor}
                    fillOpacity="0.65"
                  />
                  <ellipse cx="130" cy="96" rx="76" ry="8" fill={activePhInfo.liquidColor} fillOpacity="0.85" />

                  {/* Measurement ticks */}
                  {[120, 145, 170].map((y) => (
                    <line key={y} x1="56" y1={y} x2="72" y2={y} stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
                  ))}

                  {/* Red Litmus Strip dipped in liquid */}
                  <rect x="92" y="18" width="16" height="68" rx="2" fill="#EF4444" />
                  <rect
                    x="92"
                    y="86"
                    width="16"
                    height="56"
                    rx="2"
                    fill={activePhInfo.type === 'Baz' ? '#2563EB' : '#EF4444'}
                  />
                  <text x="100" y="12" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 text-[9px] font-medium">
                    Kırmızı
                  </text>

                  {/* Blue Litmus Strip dipped in liquid */}
                  <rect x="150" y="18" width="16" height="68" rx="2" fill="#2563EB" />
                  <rect
                    x="150"
                    y="86"
                    width="16"
                    height="56"
                    rx="2"
                    fill={activePhInfo.type === 'Asit' ? '#EF4444' : '#2563EB'}
                  />
                  <text x="158" y="12" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 text-[9px] font-medium">
                    Mavi
                  </text>

                  {/* pH label inside beaker */}
                  <text x="130" y="176" textAnchor="middle" className="fill-white text-[16px] font-mono font-bold">
                    pH {activePhInfo.ph.toFixed(1)}
                  </text>
                </svg>
              </div>

              <div className="sm:col-span-6 space-y-2.5 text-xs">
                <p className="text-sm font-semibold text-navy-900 dark:text-white">{activePhInfo.name}</p>
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Kırmızı Turnusol:</span>
                    <span className="font-semibold text-navy-900 dark:text-white">{activePhInfo.redLitmus}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Mavi Turnusol:</span>
                    <span className="font-semibold text-navy-900 dark:text-white">{activePhInfo.blueLitmus}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Fenolftalein:</span>
                    <span className="font-semibold text-navy-900 dark:text-white">{activePhInfo.phenolphthalein}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Metil Oranj:</span>
                    <span className="font-semibold text-navy-900 dark:text-white">{activePhInfo.methylOrange}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 0–14 pH Spectrum Scale */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span>0 · Kuvvetli Asit</span>
                <span>7 · Nötr</span>
                <span>14 · Kuvvetli Baz</span>
              </div>
              <div className="relative h-4 rounded-lg overflow-hidden bg-gradient-to-r from-red-600 via-amber-400 via-emerald-500 via-sky-500 to-indigo-700">
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white border border-navy-950 shadow-sm transition-transform"
                  style={{ left: `calc(${(activePhInfo.ph / 14) * 100}% - 3px)` }}
                />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                {activePhInfo.note}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setPhMode('substances')}
                className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  phMode === 'substances'
                    ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Madde &amp; pH Ölçümü
              </button>
              <button
                type="button"
                onClick={() => setPhMode('neutralize')}
                className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  phMode === 'neutralize'
                    ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Nötralleşme Tepkimesi
              </button>
            </div>

            {phMode === 'substances' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {PH_SUBSTANCES.map((sub) => {
                    const selected = selectedSubstanceId === sub.id && Math.abs(customPh - sub.ph) < 0.05;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubstanceId(sub.id);
                          setCustomPh(sub.ph);
                        }}
                        className={`text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          selected
                            ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-500 dark:bg-teal-600'
                            : 'border-slate-200 dark:border-slate-800 hover:border-teal-500 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <p className="font-semibold truncate">{sub.name}</p>
                        <p className={`text-[11px] font-mono tabular-nums ${selected ? 'text-gold-300 dark:text-white/80' : 'text-slate-500'}`}>
                          pH {sub.ph} · {sub.type}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <label htmlFor="sci-ph-slider" className="font-medium text-slate-600 dark:text-slate-300">
                      Serbest pH Ayarı
                    </label>
                    <span className="font-mono font-semibold tabular-nums text-navy-900 dark:text-white">
                      pH {customPh.toFixed(1)}
                    </span>
                  </div>
                  <input
                    id="sci-ph-slider"
                    type="range"
                    min={0.5}
                    max={13.5}
                    step={0.1}
                    value={customPh}
                    onChange={(e) => setCustomPh(Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Kuvvetli asit (HCl) ile kuvvetli baz (NaOH) hacimlerini değiştirerek nötralleşme tepkimesini (pH = 7,0) gözlemleyin.
                </p>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <label htmlFor="sci-acid-ml" className="font-medium text-red-700 dark:text-red-400">
                      Asit Hacmi (HCl)
                    </label>
                    <span className="font-mono font-semibold tabular-nums">{acidMl} mL</span>
                  </div>
                  <input
                    id="sci-acid-ml"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={acidMl}
                    onChange={(e) => setAcidMl(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <label htmlFor="sci-base-ml" className="font-medium text-sky-700 dark:text-sky-400">
                      Baz Hacmi (NaOH)
                    </label>
                    <span className="font-mono font-semibold tabular-nums">{baseMl} mL</span>
                  </div>
                  <input
                    id="sci-base-ml"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={baseMl}
                    onChange={(e) => setBaseMl(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAcidMl(50);
                    setBaseMl(50);
                  }}
                  className="w-full py-2 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer"
                >
                  Eşit Hacimde Nötrleştir (50 mL + 50 mL)
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* EXPERIMENT 3: LEVER / SIMPLE MACHINES */}
      {activeExp === 'lever' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  Deney 03 · Basit Makineler (Yük × Yük Kolu = Kuvvet × Kuvvet Kolu)
                </p>
                <h2 className="text-lg font-semibold text-navy-900 dark:text-white mt-0.5">
                  Kaldıraç Denge ve Kuvvet Kazancı Simülatörü
                </h2>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                  leverStats.state === 'balanced'
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {leverStats.state === 'balanced'
                    ? 'Sistem Dengede'
                    : leverStats.state === 'loadHeavy'
                      ? 'Yük Tarafı Ağır Bastı'
                      : 'Kuvvet Tarafı Ağır Bastı'}
                </span>
              </span>
            </div>

            <div className="my-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4">
              <svg viewBox="0 0 560 250" className="w-full h-auto max-h-[260px]" role="img" aria-label="Kaldıraç denge çizimi">
                {/* Ground line */}
                <line x1="30" y1="215" x2="530" y2="215" stroke="#94A3B8" strokeWidth="2" />
                {/* Fulcrum triangle */}
                <polygon points="280,152 256,215 304,215" fill="#0B1F3A" />
                <text x="280" y="234" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 text-[11px] font-medium">
                  Destek Noktası
                </text>

                {/* Rotating Beam */}
                <g
                  style={{
                    transformOrigin: '280px 152px',
                    transform: `rotate(${leverStats.tiltDeg}deg)`,
                    transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <rect x="60" y="144" width="440" height="14" rx="4" fill="#0D9488" />
                  {/* Ruler marks */}
                  {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((tick) => (
                    <line
                      key={tick}
                      x1={280 + tick * 40}
                      y1="144"
                      x2={280 + tick * 40}
                      y2="158"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  ))}

                  {/* Load Box (Left of fulcrum) */}
                  <g transform={`translate(${280 - loadArm * 40}, 144)`}>
                    <rect x="-28" y="-48" width="56" height="48" rx="6" fill="#C89B3C" stroke="#0B1F3A" strokeWidth="2" />
                    <text x="0" y="-27" textAnchor="middle" className="fill-navy-950 text-[11px] font-bold">
                      YÜK
                    </text>
                    <text x="0" y="-12" textAnchor="middle" className="fill-navy-950 text-[11px] font-mono font-bold">
                      {loadForce} N
                    </text>
                  </g>

                  {/* Applied Force Arrow (Right of fulcrum) */}
                  <g transform={`translate(${280 + effortArm * 40}, 144)`}>
                    <line x1="0" y1="-64" x2="0" y2="-8" stroke="#DC2626" strokeWidth="4" />
                    <polygon points="0,-2 -8,-16 8,-16" fill="#DC2626" />
                    <text x="0" y="-72" textAnchor="middle" className="fill-red-600 dark:fill-red-400 text-[12px] font-mono font-bold">
                      F = {appliedForce} N
                    </text>
                  </g>
                </g>
              </svg>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500">Yük Momenti</p>
                <p className="text-base font-mono font-semibold tabular-nums text-navy-900 dark:text-white">
                  {leverStats.loadMoment} N·m
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500">Kuvvet Momenti</p>
                <p className="text-base font-mono font-semibold tabular-nums text-teal-700 dark:text-teal-400">
                  {leverStats.effortMoment} N·m
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500">Kuvvet Kazancı</p>
                <p className="text-base font-mono font-semibold tabular-nums text-gold-600 dark:text-gold-400">
                  {leverStats.advantage}×
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500">Denge Kuvveti</p>
                <p className="text-base font-mono font-semibold tabular-nums text-navy-900 dark:text-white">
                  {leverStats.idealForce} N
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-navy-900 dark:text-white">Kaldıraç Değişkenleri</h3>
                <button
                  type="button"
                  onClick={() => setAppliedForce(Math.round(leverStats.idealForce))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer whitespace-nowrap"
                >
                  Otomatik Dengele
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="lv-load" className="text-slate-600 dark:text-slate-300 font-medium">Yük Ağırlığı (P)</label>
                  <span className="font-mono font-semibold tabular-nums">{loadForce} N</span>
                </div>
                <input id="lv-load" type="range" min={10} max={120} step={10} value={loadForce} onChange={(e) => setLoadForce(Number(e.target.value))} className="w-full accent-teal-600 cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="lv-larm" className="text-slate-600 dark:text-slate-300 font-medium">Yük Kolu Uzunluğu</label>
                  <span className="font-mono font-semibold tabular-nums">{loadArm} metre</span>
                </div>
                <input id="lv-larm" type="range" min={1} max={5} step={1} value={loadArm} onChange={(e) => setLoadArm(Number(e.target.value))} className="w-full accent-teal-600 cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="lv-earm" className="text-slate-600 dark:text-slate-300 font-medium">Kuvvet Kolu Uzunluğu</label>
                  <span className="font-mono font-semibold tabular-nums">{effortArm} metre</span>
                </div>
                <input id="lv-earm" type="range" min={1} max={5} step={1} value={effortArm} onChange={(e) => setEffortArm(Number(e.target.value))} className="w-full accent-teal-600 cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="lv-force" className="text-slate-600 dark:text-slate-300 font-medium">Uygulanan Kuvvet (F)</label>
                  <span className="font-mono font-semibold tabular-nums text-red-600 dark:text-red-400">{appliedForce} N</span>
                </div>
                <input id="lv-force" type="range" min={5} max={150} step={5} value={appliedForce} onChange={(e) => setAppliedForce(Number(e.target.value))} className="w-full accent-red-600 cursor-pointer" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-navy-900 dark:text-white">LGS Kuralı:</strong> Kuvvet kolu yük kolundan ne kadar uzunsa kuvvetten o kadar kazanç sağlanır; ancak hiçbir basit makinede <strong>işten ve enerjiden kazanç</strong> olmaz!
            </div>
          </div>
        </section>
      )}

      {/* EXPERIMENT 4: PHOTOSYNTHESIS LAB */}
      {activeExp === 'photosynthesis' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  Deney 04 · 6CO₂ + 6H₂O → Besin (C₆H₁₂O₆) + 6O₂
                </p>
                <h2 className="text-lg font-semibold text-navy-900 dark:text-white mt-0.5">
                  Elodea Su Bitkisi ile Fotosentez Hızı Deneyi
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPhotoPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {photoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{photoPlaying ? 'Duraklat' : 'Devam Et'}</span>
              </button>
            </div>

            <div className="my-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4">
              <svg viewBox="0 0 520 250" className="w-full h-auto max-h-[260px]" role="img" aria-label="Fotosentez oksijen kabarcığı deneyi">
                {/* Light Lamp on Left */}
                <g transform="translate(65, 115)">
                  <rect x="-24" y="-14" width="32" height="28" rx="6" fill="#0B1F3A" />
                  <circle cx="14" cy="0" r="14" fill={LIGHT_COLORS[lightColor].hex} fillOpacity={Math.max(0.2, lightIntensity / 100)} />
                  {/* Light beams */}
                  <polygon
                    points="26,-16 200,-68 200,68 26,16"
                    fill={LIGHT_COLORS[lightColor].hex}
                    fillOpacity={(lightIntensity / 100) * 0.22}
                  />
                  <text x="-20" y="34" className="fill-slate-600 dark:fill-slate-300 text-[10px] font-medium">
                    {LIGHT_COLORS[lightColor].label}
                  </text>
                </g>

                {/* Water Beaker */}
                <rect x="210" y="55" width="170" height="165" rx="10" fill="#0EA5E9" fillOpacity="0.16" stroke="#64748B" strokeWidth="3" />
                {/* Inverted Glass Funnel & Test Tube */}
                <path d="M245 205 L283 125 L283 32 L307 32 L307 125 L345 205 Z" fill="none" stroke="#94A3B8" strokeWidth="2.5" />
                {/* Aquatic Elodea Plant */}
                <g stroke="#15803D" strokeWidth="3" fill="#22C55E">
                  <line x1="295" y1="205" x2="295" y2="145" />
                  <ellipse cx="283" cy="186" rx="11" ry="5" transform="rotate(-25 283 186)" />
                  <ellipse cx="307" cy="178" rx="11" ry="5" transform="rotate(25 307 178)" />
                  <ellipse cx="284" cy="166" rx="10" ry="4.5" transform="rotate(-20 284 166)" />
                  <ellipse cx="306" cy="158" rx="10" ry="4.5" transform="rotate(20 306 158)" />
                </g>

                {/* Rising O2 Bubbles */}
                {photoStats.rate > 1 &&
                  Array.from({ length: Math.min(8, Math.max(1, Math.ceil(photoStats.rate / 7))) }).map((_, idx) => {
                    const y = 140 - (((bubbleTick * (1 + photoStats.rate / 25) + idx * 18) % 98));
                    const x = 295 + Math.sin(idx * 2 + bubbleTick * 0.2) * 5;
                    return (
                      <circle key={idx} cx={x} cy={y} r="3.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                    );
                  })}

                {/* O2 Collection Label */}
                <text x="360" y="48" className="fill-teal-700 dark:fill-teal-400 text-[12px] font-mono font-bold">
                  O₂ Gazı: {photoStats.rate} kabarcık/dk
                </text>
                <text x="360" y="68" className="fill-slate-500 dark:fill-slate-400 text-[10px]">
                  Sıcaklık: {temperature}°C · CO₂: %{co2Level}
                </text>
              </svg>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 dark:text-slate-300">
                <strong>Sınırlayıcı Etken:</strong> {photoStats.limiting}
              </span>
              <span className="font-mono font-semibold tabular-nums text-teal-700 dark:text-teal-400">
                Üretim Hızı: {photoStats.rate} O₂ / dk
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-navy-900 dark:text-white">Fotosentez Etkenleri</h3>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Işık Rengi Seçimi</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {(Object.keys(LIGHT_COLORS) as LightColorKey[]).map((key) => {
                  const active = lightColor === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLightColor(key)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-500 dark:bg-teal-600'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {LIGHT_COLORS[key].label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{LIGHT_COLORS[lightColor].note}</p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="ph-light" className="text-slate-600 dark:text-slate-300 font-medium">Işık Şiddeti</label>
                <span className="font-mono font-semibold tabular-nums">%{lightIntensity}</span>
              </div>
              <input id="ph-light" type="range" min={0} max={100} step={5} value={lightIntensity} onChange={(e) => setLightIntensity(Number(e.target.value))} className="w-full accent-teal-600 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="ph-temp" className="text-slate-600 dark:text-slate-300 font-medium">Ortam Sıcaklığı (Enzim Opt. 25–35°C)</label>
                <span className="font-mono font-semibold tabular-nums">{temperature} °C</span>
              </div>
              <input id="ph-temp" type="range" min={5} max={55} step={1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full accent-amber-600 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="ph-co2" className="text-slate-600 dark:text-slate-300 font-medium">Karbondioksit (CO₂) Miktarı</label>
                <span className="font-mono font-semibold tabular-nums">%{co2Level}</span>
              </div>
              <input id="ph-co2" type="range" min={0} max={100} step={5} value={co2Level} onChange={(e) => setCo2Level(Number(e.target.value))} className="w-full accent-teal-600 cursor-pointer" />
            </div>
          </div>
        </section>
      )}

      {/* EXPERIMENT 5: SEASONS & AXIAL TILT */}
      {activeExp === 'seasons' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  Deney 05 · Mevsimlerin Oluşumu ve 23° 27′ Eksen Eğikliği
                </p>
                <h2 className="text-lg font-semibold text-navy-900 dark:text-white mt-0.5">
                  {seasonInfo.dateLabel}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOrbitPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer"
              >
                {orbitPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{orbitPlaying ? 'Yörüngeyi Durdur' : 'Yörüngeyi Oynat'}</span>
              </button>
            </div>

            <div className="my-4 rounded-xl bg-slate-950 border border-slate-800 p-4">
              <svg viewBox="0 0 420 270" className="w-full h-auto max-h-[265px]" role="img" aria-label="Dünya Güneş etrafında yörünge simülasyonu">
                {/* Elliptical Orbit */}
                <ellipse cx="210" cy="135" rx="125" ry="78" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="5 5" />

                {/* Cardinal Date Markers */}
                <text x="348" y="139" className="fill-slate-400 text-[10px]">21 Mart</text>
                <text x="210" y="42" textAnchor="middle" className="fill-amber-300 text-[10px] font-semibold">21 Haziran</text>
                <text x="28" y="139" className="fill-slate-400 text-[10px]">23 Eylül</text>
                <text x="210" y="236" textAnchor="middle" className="fill-sky-300 text-[10px] font-semibold">21 Aralık</text>

                {/* Sun */}
                <circle cx="210" cy="135" r="28" fill="#F59E0B" />
                <circle cx="210" cy="135" r="36" fill="#F59E0B" fillOpacity="0.22" />
                <text x="210" y="139" textAnchor="middle" className="fill-navy-950 text-[10px] font-bold">GÜNEŞ</text>

                {/* Earth with axial tilt */}
                <g transform={`translate(${seasonInfo.earthX}, ${seasonInfo.earthY})`}>
                  <circle r="16" fill="#0284C7" stroke="#93C5FD" strokeWidth="1.5" />
                  {/* Axis Line */}
                  <g transform={`rotate(${axialTiltOn ? 23.5 : 0})`}>
                    <line x1="0" y1="-24" x2="0" y2="24" stroke="#FDE047" strokeWidth="2" />
                    <line x1="-15" y1="0" x2="15" y2="0" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="6" y="-20" className="fill-amber-300 text-[9px] font-bold">K</text>
                  </g>
                </g>
              </svg>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500">Kuzey (Türkiye)</p>
                <p className="text-sm font-semibold text-navy-900 dark:text-white">{seasonInfo.northSeason}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500">Güney Yarım Küre</p>
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">{seasonInfo.southSeason}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500">Öğle Işın Açısı</p>
                <p className="text-sm font-mono font-semibold tabular-nums text-gold-600 dark:text-gold-400">
                  {seasonInfo.turkeySunAngle}°
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500">Gündüz / Gece</p>
                <p className="text-sm font-mono font-semibold tabular-nums text-navy-900 dark:text-white">
                  {seasonInfo.daylightHours}s / {seasonInfo.nightHours}s
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-navy-900 dark:text-white">Tarih ve Eksen Kontrolleri</h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '21 Mart', angle: 0 },
                { label: '21 Haziran', angle: 90 },
                { label: '23 Eylül', angle: 180 },
                { label: '21 Aralık', angle: 270 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setOrbitPlaying(false);
                    setOrbitAngle(preset.angle);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    orbitAngle === preset.angle
                      ? 'border-navy-900 bg-navy-900 text-white dark:border-teal-500 dark:bg-teal-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="sci-orbit" className="text-slate-600 dark:text-slate-300 font-medium">Yörünge Konumu</label>
                <span className="font-mono font-semibold tabular-nums">{orbitAngle}°</span>
              </div>
              <input id="sci-orbit" type="range" min={0} max={359} step={1} value={orbitAngle} onChange={(e) => setOrbitAngle(Number(e.target.value))} className="w-full accent-teal-600 cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Eksen Eğikliği (23° 27′)
              </span>
              <button
                type="button"
                onClick={() => setAxialTiltOn((t) => !t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  axialTiltOn
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                {axialTiltOn ? '23,5° Aktif' : '0° (Eğiklik Yok)'}
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Eksen eğikliğini <strong>0°</strong> yaparak test edin: Eksen eğik olmasaydı Dünya’nın her yerinde yıl boyunca gece-gündüz daima 12 saat eşit olur ve <strong>mevsimler hiç oluşmazdı!</strong>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
