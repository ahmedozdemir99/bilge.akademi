import { useEffect, useState } from 'react';
import { Crown, Feather, Info, Pause, Play, RotateCcw, ScrollText, Shield, Swords } from 'lucide-react';
import {
  HISTORY_ANECDOTES_WISDOM,
  MILITARY_CAMPAIGNS,
  SULTAN_PROFILES,
  type HistoryWisdomItem,
  type SultanProfile,
} from '../../../data/historyRichData';

/* ---------------- 1. ANIMATED CAMPAIGNS MAP ---------------- */

export function AnimatedCampaignsMap() {
  const [selectedId, setSelectedId] = useState(MILITARY_CAMPAIGNS[0].id);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPlaying, setIsPlaying] = useState(false);

  const campaign = MILITARY_CAMPAIGNS.find((c) => c.id === selectedId) ?? MILITARY_CAMPAIGNS[0];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return Math.min(100, prev + 2.5);
      });
    }, 80);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleSelectCampaign = (id: string) => {
    setSelectedId(id);
    setProgress(0);
    setIsPlaying(true);
  };

  // Compute interpolated moving marker position along campaign.waypoints
  const pts = campaign.waypoints;
  const totalSegments = Math.max(1, pts.length - 1);
  const scaled = (progress / 100) * totalSegments;
  const segIndex = Math.min(totalSegments - 1, Math.floor(scaled));
  const localT = scaled - segIndex;
  const startPt = pts[segIndex];
  const endPt = pts[Math.min(pts.length - 1, segIndex + 1)];
  const markerX = startPt.x + (endPt.x - startPt.x) * localT;
  const markerY = startPt.y + (endPt.y - startPt.y) * localT;

  // Build path string up to current animated point
  const activePathPoints: string[] = [];
  for (let i = 0; i <= segIndex; i += 1) {
    activePathPoints.push(`${pts[i].x},${pts[i].y}`);
  }
  activePathPoints.push(`${markerX.toFixed(1)},${markerY.toFixed(1)}`);

  const fullPathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const currentStageIndex = Math.min(pts.length - 1, Math.round((progress / 100) * (pts.length - 1)));
  const currentWaypoint = pts[currentStageIndex];

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <span>
          <strong>Tarihsel Harita Notu:</strong> Sefer rotaları modern siyasi sınırlar olmadan,
          tarihî güzergâhların yaklaşık coğrafi yönünü eğitim amaçlı görselleştirir.
        </span>
      </div>

      {/* Campaign Selector Strip */}
      <div className="control-grid gap-2">
        {MILITARY_CAMPAIGNS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => handleSelectCampaign(c.id)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
              c.id === campaign.id
                ? 'bg-navy-900 text-white border-navy-900 dark:bg-teal-600 dark:border-teal-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-600/60'
            }`}
          >
            {c.name} ({c.year.slice(-4)})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Animated Map Stage */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-mono text-teal-700 dark:text-teal-400">
                {campaign.era} · {campaign.battleType}
              </p>
              <h3 className="text-base font-semibold text-navy-900 dark:text-white">
                {campaign.name}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (progress >= 100) setProgress(0);
                  setIsPlaying((p) => !p);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer whitespace-nowrap"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Duraklat' : 'Seferi Oynat'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setProgress(0);
                }}
                aria-label="Sıfırla"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Colorful Cartographic Map: Distinct Seas, Coasts, Landmasses, Rivers & Islands */}
          <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-[#0B6A94] shadow-xs">
            <svg
              viewBox="330 118 290 198"
              className="w-full h-auto block select-none"
              role="img"
              aria-label={`${campaign.name} animasyonlu tarihî sefer haritası`}
            >
              <defs>
                {/* Vibrant Mediterranean & Black Sea Ocean Gradient */}
                <linearGradient id="seaOceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0C7AA8" />
                  <stop offset="50%" stopColor="#0E88B8" />
                  <stop offset="100%" stopColor="#09608A" />
                </linearGradient>

                {/* Fertile Europe & Balkans Land Gradient */}
                <linearGradient id="europeLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#CFE0B2" />
                  <stop offset="55%" stopColor="#DFDEBA" />
                  <stop offset="100%" stopColor="#D7CCA0" />
                </linearGradient>

                {/* Anatolian Plateau & Eastern Highlands Gradient */}
                <linearGradient id="anatoliaLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#DCE0B4" />
                  <stop offset="45%" stopColor="#E6D29E" />
                  <stop offset="100%" stopColor="#D6B57D" />
                </linearGradient>

                {/* Levant, Sinai & Egypt Desert-Oasis Gradient */}
                <linearGradient id="desertLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EFE0B5" />
                  <stop offset="60%" stopColor="#E8CFA0" />
                  <stop offset="100%" stopColor="#DFBF88" />
                </linearGradient>

                {/* Subtle Latitude / Longitude Cartographic Grid */}
                <pattern id="atlasGraticule" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path
                    d="M 24 0 L 0 0 0 24"
                    fill="none"
                    stroke="#BAE6FD"
                    strokeOpacity="0.18"
                    strokeWidth="0.45"
                  />
                </pattern>

                {/* Soft Shallow-Water Coastal Glow */}
                <filter id="coastHalo" x="-8%" y="-8%" width="116%" height="116%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2.1" floodColor="#67E8F9" floodOpacity="0.52" />
                </filter>
              </defs>

              {/* 1. OCEAN BACKDROP */}
              <rect x="330" y="118" width="290" height="198" fill="url(#seaOceanGrad)" />
              <rect x="330" y="118" width="290" height="198" fill="url(#atlasGraticule)" />

              {/* 2. DISTINCT CONTINENTAL LANDMASSES WITH COASTAL SHALLOW HALO */}
              <g filter="url(#coastHalo)">
                {/* Italian Boot Tip (West edge for Mediterranean orientation) */}
                <path
                  d="M 330 156 L 351 174 L 364 195 L 357 204 L 348 193 L 341 214 L 330 218 Z"
                  fill="url(#europeLandGrad)"
                  stroke="#6E5D3E"
                  strokeWidth="0.85"
                  strokeLinejoin="round"
                />

                {/* Central Europe, Balkans, Greece & Northern Black Sea Coast + Crimea */}
                <path
                  d="M 330 118 L 620 118 L 620 185 L 588 182 L 568 175 L 550 158 L 534 148 L 516 140 L 502 146 L 486 144 L 478 136 L 466 138 L 454 150 L 448 164 L 452 178 L 460 190 L 456 196 L 444 198 L 434 196 L 424 202 L 422 213 L 425 221 L 414 226 L 407 219 L 404 209 L 394 196 L 382 184 L 367 170 L 356 155 L 344 146 L 330 144 Z"
                  fill="url(#europeLandGrad)"
                  stroke="#6E5D3E"
                  strokeWidth="0.9"
                  strokeLinejoin="round"
                />

                {/* Anatolia, Caucasus, Mesopotamia & Levant (separated from Balkans by Marmara & Straits!) */}
                <path
                  d="M 464 192 L 478 184 L 502 180 L 528 182 L 552 187 L 574 185 L 594 181 L 620 183 L 620 316 L 528 316 L 515 288 L 506 274 L 500 282 L 495 272 L 508 256 L 514 242 L 508 236 L 494 239 L 478 239 L 464 235 L 451 232 L 445 224 L 444 214 L 442 204 L 447 199 L 456 198 Z"
                  fill="url(#anatoliaLandGrad)"
                  stroke="#6E5D3E"
                  strokeWidth="0.95"
                  strokeLinejoin="round"
                />

                {/* Sinai Peninsula, Nile Valley, Egypt & North African Coast (separated by Mediterranean & Red Sea!) */}
                <path
                  d="M 330 278 L 365 276 L 398 282 L 428 281 L 458 279 L 480 275 L 496 274 L 506 286 L 500 296 L 492 288 L 495 304 L 502 316 L 330 316 Z"
                  fill="url(#desertLandGrad)"
                  stroke="#6E5D3E"
                  strokeWidth="0.9"
                  strokeLinejoin="round"
                />

                {/* Crete (Girit) Island */}
                <path
                  d="M 424 231 L 436 229 L 447 231 L 444 235 L 427 235 Z"
                  fill="#DDD1A6"
                  stroke="#6E5D3E"
                  strokeWidth="0.75"
                />

                {/* Cyprus (Kıbrıs) Island */}
                <path
                  d="M 486 252 L 496 249 L 503 248 L 499 254 L 489 255 Z"
                  fill="#DFCFA0"
                  stroke="#6E5D3E"
                  strokeWidth="0.75"
                />

                {/* Rhodes & Major Aegean Islands */}
                <circle cx="451" cy="234" r="1.8" fill="#DFCFA0" stroke="#6E5D3E" strokeWidth="0.5" />
                <circle cx="436" cy="212" r="1.4" fill="#DFCFA0" stroke="#6E5D3E" strokeWidth="0.45" />
                <circle cx="439" cy="220" r="1.3" fill="#DFCFA0" stroke="#6E5D3E" strokeWidth="0.45" />
              </g>

              {/* 3. MAJOR RIVERS & FERTILE NILE DELTA */}
              <g fill="none" stroke="#38BDF8" strokeOpacity="0.65" strokeLinecap="round">
                {/* Tuna (Danube) */}
                <path d="M 366 136 Q 388 156 410 168 T 451 168" strokeWidth="1.05" />
                {/* Kızılırmak / Sakarya */}
                <path d="M 516 184 Q 512 204 526 205" strokeWidth="0.8" />
                <path d="M 476 188 Q 480 202 486 206" strokeWidth="0.75" />
                {/* Fırat & Dicle */}
                <path d="M 552 205 Q 542 232 560 264" strokeWidth="0.9" />
                <path d="M 564 214 Q 570 242 582 268" strokeWidth="0.9" />
                {/* Nil & Nile Delta */}
                <path d="M 479 316 L 478 288 L 472 276" strokeWidth="1.35" />
                <path d="M 478 288 L 485 276" strokeWidth="1.05" />
              </g>
              {/* Nile Delta green oasis tint */}
              <polygon points="478,288 470,276 486,276" fill="#84B86E" fillOpacity="0.38" />

              {/* Subtle Topographic Mountain Ridges (Toroslar & Doğu Anadolu) */}
              <g fill="none" stroke="#9A8259" strokeWidth="0.75" strokeOpacity="0.55" strokeLinecap="round">
                <path d="M 476 231 l 3 -3 l 3 3 m 5 0 l 3 -3 l 3 3 m 6 -1 l 3 -3 l 3 3" />
                <path d="M 550 198 l 3 -3.5 l 3 3.5 m 5 -1 l 3 -3.5 l 3 3.5 m 5 1 l 3 -3.5 l 3 3.5" />
                <path d="M 505 189 l 3 -2.5 l 3 2.5 m 6 -1 l 3 -2.5 l 3 2.5" />
              </g>

              {/* 4. CLEAR GEOGRAPHIC WATER & LAND LABELS */}
              <g className="pointer-events-none select-none">
                {/* Sea Labels (Crisp italic pale aqua) */}
                <text x="506" y="164" fill="#E0F2FE" fontSize="6.6" fontStyle="italic" fontWeight="600" letterSpacing="0.8" textAnchor="middle">
                  KARADENİZ
                </text>
                <text x="419" y="256" fill="#E0F2FE" fontSize="7.4" fontStyle="italic" fontWeight="600" letterSpacing="1.1" textAnchor="middle">
                  AKDENİZ
                </text>
                <text x="433" y="218" fill="#E0F2FE" fontSize="4.8" fontStyle="italic" fontWeight="600" textAnchor="middle">
                  Ege
                </text>
                <text x="512" y="305" fill="#E0F2FE" fontSize="5" fontStyle="italic" fontWeight="600" textAnchor="middle">
                  Kızıldeniz
                </text>

                {/* Land Region Labels (Warm muted sepia-brown) */}
                <text x="514" y="216" fill="#6B5634" fontSize="6.8" fontWeight="700" letterSpacing="0.9" textAnchor="middle" opacity="0.72">
                  ANADOLU
                </text>
                <text x="392" y="139" fill="#52603C" fontSize="6.2" fontWeight="700" letterSpacing="0.6" textAnchor="middle" opacity="0.75">
                  ORTA AVRUPA
                </text>
                <text x="424" y="179" fill="#52603C" fontSize="5.4" fontWeight="600" letterSpacing="0.5" textAnchor="middle" opacity="0.72">
                  Balkanlar
                </text>
                <text x="458" y="302" fill="#785E33" fontSize="6.2" fontWeight="700" letterSpacing="0.8" textAnchor="middle" opacity="0.78">
                  MISIR
                </text>
                <text x="548" y="258" fill="#785E33" fontSize="5.6" fontWeight="600" letterSpacing="0.5" textAnchor="middle" opacity="0.72">
                  Suriye &amp; Mezopotamya
                </text>
              </g>

              {/* 5. CAMPAIGN TRAJECTORY (PLANNED + ANIMATED TRAVERSED ROUTE) */}
              <path
                d={fullPathD}
                fill="none"
                stroke="#0F172A"
                strokeWidth="2.8"
                strokeOpacity="0.22"
                strokeDasharray="3.5 3"
                strokeLinecap="round"
              />
              <path
                d={fullPathD}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.4"
                strokeOpacity="0.8"
                strokeDasharray="3.5 3"
                strokeLinecap="round"
              />

              {/* Animated illuminated route with white contrast halo */}
              <polyline
                points={activePathPoints.join(' ')}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="4.6"
                strokeOpacity="0.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={activePathPoints.join(' ')}
                fill="none"
                stroke="#C81E1E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 6. CLICKABLE NUMBERED WAYPOINTS WITH HALOED LABELS */}
              {pts.map((pt, idx) => {
                const reached = progress >= (idx / totalSegments) * 100 - 1;
                const isFinal = idx === pts.length - 1;
                const placeLeft = pt.x > 540;
                const labelDx = placeLeft ? -8 : 8;
                const labelDy = idx % 2 === 0 ? -5.5 : 10.5;
                return (
                  <g
                    key={pt.label}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    onClick={() => {
                      setIsPlaying(false);
                      setProgress((idx / totalSegments) * 100);
                    }}
                    className="cursor-pointer"
                  >
                    {isFinal && reached && (
                      <circle r="8.5" fill="#C81E1E" fillOpacity="0.22" stroke="#C81E1E" strokeWidth="0.8" />
                    )}
                    <circle
                      r={isFinal ? 5.2 : 4.4}
                      fill={isFinal ? '#B91C1C' : reached ? '#0F766E' : '#475569'}
                      stroke="#FFFFFF"
                      strokeWidth="1.4"
                    />
                    <text
                      x="0"
                      y="2.1"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="5.2"
                      fontWeight="700"
                    >
                      {idx + 1}
                    </text>
                    <text
                      x={labelDx}
                      y={labelDy}
                      textAnchor={placeLeft ? 'end' : 'start'}
                      fill="#0B1F3A"
                      stroke="#FFFFFF"
                      strokeWidth="2.6"
                      paintOrder="stroke"
                      strokeLinejoin="round"
                      fontSize="6.8"
                      fontWeight={reached ? '700' : '600'}
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}

              {/* 7. ANIMATED EXPEDITION EMBLEM (NAVAL GALLEY FOR SEA / BANNER FOR LAND) */}
              <g transform={`translate(${markerX}, ${markerY})`}>
                <circle r="8.5" fill="#F59E0B" fillOpacity="0.28" />
                <circle r="5.6" fill="#0B1F3A" stroke="#FCD34D" strokeWidth="1.4" />
                {campaign.battleType === 'Deniz Savaşı' ? (
                  /* Crisp Ottoman Galley / Ship Icon */
                  <g transform="translate(-3.4, -3)">
                    <path d="M 0.5 4.2 L 6.3 4.2 L 5.2 6 L 1.6 6 Z" fill="#FCD34D" />
                    <path d="M 3.4 0.5 L 3.4 4.1 L 5.9 3.6 Z" fill="#FFFFFF" />
                    <path d="M 3.1 1.2 L 3.1 4.1 L 1.1 3.7 Z" fill="#E0F2FE" />
                  </g>
                ) : (
                  /* Crisp Army Banner / Standard Icon */
                  <g transform="translate(-2.6, -3.2)">
                    <line x1="1" y1="0.4" x2="1" y2="6.4" stroke="#FCD34D" strokeWidth="1" strokeLinecap="round" />
                    <path d="M 1.4 0.7 L 5.6 1.8 L 1.4 3.4 Z" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.45" />
                  </g>
                )}
              </g>

              {/* 8. COMPASS ROSE (TOP-RIGHT CORNER) */}
              <g transform="translate(604, 134)" className="pointer-events-none">
                <circle r="9.5" fill="#0B1F3A" fillOpacity="0.72" stroke="#FCD34D" strokeWidth="0.7" />
                <polygon points="0,-6.2 1.8,0 0,6.2 -1.8,0" fill="#FFFFFF" />
                <polygon points="0,-6.2 1.8,0 0,-1 -1.8,0" fill="#EF4444" />
                <polygon points="-6.2,0 0,-1.6 6.2,0 0,1.6" fill="#CBD5E1" />
                <text x="0" y="-7.2" textAnchor="middle" fill="#FCD34D" fontSize="4.6" fontWeight="700">
                  K
                </text>
              </g>
            </svg>
          </div>

          {/* Clean 4-item Cartographic Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-1 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#E2D2A2] border border-[#6E5D3E]" />
                <span>Kara / Topografya</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#0E88B8] border border-[#09608A]" />
                <span>Denizler &amp; Boğazlar</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-1 rounded-full bg-[#C81E1E]" />
                <span>İlerlenen Rota</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B91C1C] border border-white ring-1 ring-[#B91C1C]" />
                <span>Muharebe / Hedef</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Durak numaralarına tıklayarak atlayabilirsiniz</span>
          </div>

          {/* Scrub slider + active stage caption */}
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => {
                setIsPlaying(false);
                setProgress(Number(e.target.value));
              }}
              aria-label="Sefer ilerleme çubuğu"
              className="w-full accent-teal-600"
            />
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
              <p className="font-semibold text-navy-900 dark:text-gold-400">
                Durak {currentStageIndex + 1}/{pts.length}: {currentWaypoint.label} ({currentWaypoint.date})
              </p>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">{currentWaypoint.note}</p>
            </div>
          </div>
        </div>

        {/* Battle Outcome Card (Galip / Mağlup & Tactics) */}
        <aside className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>GALİP TARAF</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-navy-900 dark:text-white">
                {campaign.winnerSide}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Komutan: {campaign.winnerCommander}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-red-50/70 dark:bg-red-950/25 border border-red-200 dark:border-red-900/60">
              <p className="text-[11px] font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" />
                <span>MAĞLUP TARAF</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-navy-900 dark:text-white">
                {campaign.defeatedSide}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Komutan: {campaign.defeatedCommander}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <p className="font-semibold text-navy-900 dark:text-white">Savaş Taktiği</p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{campaign.tactics}</p>
          </div>

          <div className="space-y-2 text-xs">
            <p className="font-semibold text-teal-700 dark:text-teal-400">Dönüm Noktası</p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {campaign.turningPoint}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
            <p className="font-semibold text-navy-900 dark:text-white">Tarihsel Sonuçları</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
              {campaign.consequences.map((res, i) => (
                <li key={i}>{res}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- 2. SULTANS, BATTLES & HIDDEN TALENTS ---------------- */

export function SultansGalleryPanel() {
  const [periodFilter, setPeriodFilter] = useState<'all' | SultanProfile['period']>('all');
  const [selectedId, setSelectedId] = useState(SULTAN_PROFILES[0].id);

  const filtered = SULTAN_PROFILES.filter(
    (s) => periodFilter === 'all' || s.period === periodFilter
  );
  const selected = filtered.find((s) => s.id === selectedId) ?? filtered[0] ?? SULTAN_PROFILES[0];

  return (
    <div className="space-y-5">
      <div className="control-grid gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {(['all', 'Kuruluş', 'Yükselme', 'Duraklama & Yenileşme'] as const).map((per) => (
          <button
            key={per}
            type="button"
            onClick={() => setPeriodFilter(per)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
              periodFilter === per
                ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {per === 'all' ? 'Tüm Padişahlar' : per}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-1.5">
          {filtered.map((s) => {
            const active = s.id === selected.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={`w-full text-left p-3.5 rounded-lg transition-colors cursor-pointer ${
                  active
                    ? 'bg-navy-900 text-white dark:bg-teal-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <p className={`text-[11px] font-mono ${active ? 'text-gold-400 dark:text-white/90' : 'text-teal-700 dark:text-teal-400'}`}>
                  {s.reign} · {s.period}
                </p>
                <p className={`mt-0.5 text-sm font-semibold ${active ? 'text-white' : 'text-navy-900 dark:text-white'}`}>
                  {s.name}
                </p>
                <p className={`text-xs mt-0.5 ${active ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                  Mahlas / Unvan: {s.mahlas}
                </p>
              </button>
            );
          })}
        </aside>

        <article className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Saltanat: {selected.reign} · Dönem: {selected.period} · Şiir Mahlası: {selected.mahlas}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-navy-900 dark:text-white">
                {selected.name}
              </h2>
            </div>
            <Crown className="w-7 h-7 text-gold-500 shrink-0" />
          </div>

          {/* Hidden Talents */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-navy-900 dark:text-gold-400">
              Gizli Yetenekleri, Sanatı ve İlgi Alanları
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700 dark:text-slate-200">
              {selected.hiddenTalents.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-200/70 dark:border-slate-800">
              {selected.talentStory}
            </p>
          </div>

          {/* Poem / Couplet Showcase */}
          <div className="p-5 rounded-xl bg-navy-900 text-white space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-gold-400">
              <Feather className="w-4 h-4" />
              <span>{selected.poemTitle}</span>
            </div>
            <pre className="font-display text-base sm:text-lg leading-relaxed whitespace-pre-wrap text-white">
              {selected.poemOriginal}
            </pre>
            <p className="text-xs text-slate-300 pt-2 border-t border-white/15 leading-relaxed">
              <strong>Günümüz Türkçesiyle:</strong> {selected.poemModernTurkish}
            </p>
          </div>

          {/* Battles Galip / Mağlup Table */}
          <div>
            <h3 className="text-sm font-semibold text-navy-900 dark:text-white mb-3">
              Dönemindeki Başlıca Savaş ve Sefer Sonuçları (Galip / Mağlup)
            </h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500">
                    <th className="py-2.5 px-3 font-medium">Yıl</th>
                    <th className="py-2.5 px-3 font-medium">Savaş / Sefer</th>
                    <th className="py-2.5 px-3 font-medium">Karşı Taraf</th>
                    <th className="py-2.5 px-3 font-medium">Sonuç</th>
                    <th className="py-2.5 px-3 font-medium">Not</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selected.battles.map((b) => (
                    <tr key={b.battle}>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {b.year}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-navy-900 dark:text-white">
                        {b.battle}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{b.opponent}</td>
                      <td
                        className={`py-2.5 px-3 font-semibold whitespace-nowrap ${
                          b.result === 'Galip'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : b.result === 'Mağlup'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {b.result}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{b.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

/* ---------------- 3. ANECDOTES, WISDOM STORIES & HISTORICAL SATIRE ---------------- */

export function HistoryWisdomPanel() {
  const [catFilter, setCatFilter] = useState<'all' | HistoryWisdomItem['category']>('all');

  const items = HISTORY_ANECDOTES_WISDOM.filter(
    (item) => catFilter === 'all' || item.category === catFilter
  );

  return (
    <div className="space-y-5">
      <div className="control-grid gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {(['all', 'İlginç Anekdot', 'Hikmetli Hikâye', 'Tarihî Hiciv & Nükte'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCatFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
              catFilter === cat
                ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {cat === 'all' ? `Tümü (${HISTORY_ANECDOTES_WISDOM.length})` : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((item) => (
          <article
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-teal-700 dark:text-teal-400">{item.category}</span>
                <span className="font-mono text-slate-500">{item.era}</span>
              </div>
              <h3 className="text-lg font-semibold text-navy-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-gold-600 dark:text-gold-400 font-medium">{item.figures}</p>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {item.content}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
              <ScrollText className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                <strong>Çıkarılacak Hikmet:</strong> {item.lesson}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
