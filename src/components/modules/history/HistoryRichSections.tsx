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
      <div className="flex flex-wrap gap-2">
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

          {/* Focused Eastern Med / Anatolia / Balkans / Middle East Viewport */}
          <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0D213B]">
            <svg viewBox="320 110 310 215" className="w-full h-auto block" role="img" aria-label={`${campaign.name} animasyonlu sefer haritası`}>
              <defs>
                <pattern id="campaignGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#38BDF8" strokeOpacity="0.12" strokeWidth="0.6" />
                </pattern>
              </defs>
              <rect x="320" y="110" width="310" height="215" fill="url(#campaignGrid)" />

              {/* Stylized Landmasses matching HistoryAtlas coordinates */}
              <path
                d="M 290 135 L 355 110 L 445 95 L 610 85 L 660 120 L 650 280 L 555 325 L 500 280 L 455 240 L 410 218 L 360 220 L 300 205 Z"
                fill="#1C395E"
                stroke="#C89B3C"
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              <path
                d="M 310 245 L 435 248 L 495 280 L 535 345 L 360 345 Z"
                fill="#183254"
                stroke="#C89B3C"
                strokeOpacity="0.35"
                strokeWidth="1"
              />

              {/* Subtle region captions */}
              <text x="488" y="212" fill="#94A3B8" fontSize="8" opacity="0.7">Anadolu</text>
              <text x="365" y="145" fill="#94A3B8" fontSize="8" opacity="0.7">Orta Avrupa</text>
              <text x="415" y="242" fill="#38BDF8" fontSize="7.5" opacity="0.65">Akdeniz</text>
              <text x="458" y="305" fill="#94A3B8" fontSize="8" opacity="0.7">Mısır</text>

              {/* Dashed planned route */}
              <path d={fullPathD} fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.55" />

              {/* Animated illuminated route */}
              <polyline
                points={activePathPoints.join(' ')}
                fill="none"
                stroke="#DDB75F"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Waypoint nodes */}
              {pts.map((pt, idx) => {
                const reached = progress >= (idx / totalSegments) * 100 - 1;
                return (
                  <g key={pt.label} transform={`translate(${pt.x}, ${pt.y})`}>
                    <circle
                      r={idx === pts.length - 1 ? 4.5 : 3.5}
                      fill={reached ? '#0D9488' : '#475569'}
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                    />
                    <text
                      x="6"
                      y={idx % 2 === 0 ? -4 : 9}
                      fill="#F8FAFC"
                      fontSize="7.5"
                      fontWeight={reached ? '700' : '400'}
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}

              {/* Moving Expedition Marker */}
              <g transform={`translate(${markerX}, ${markerY})`}>
                <circle r="7" fill="#DDB75F" fillOpacity="0.3" />
                <circle r="3.8" fill="#DDB75F" stroke="#0B1F3A" strokeWidth="1.2" />
              </g>
            </svg>
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
      <div className="inline-flex flex-wrap gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {(['all', 'Yükselme', 'Duraklama & Yenileşme'] as const).map((per) => (
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
      <div className="inline-flex flex-wrap gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
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
