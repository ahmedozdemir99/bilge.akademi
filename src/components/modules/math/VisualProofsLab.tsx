import { useState } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { MathFormula } from '../../ui/MathFormula';

type ProofId = 'pythagoras' | 'square-sum' | 'gauss' | 'odd-squares' | 'triangle-angles';

export function VisualProofsLab() {
  const [activeProof, setActiveProof] = useState<ProofId>('pythagoras');

  // 1. Pythagoras
  const [pythA, setPythA] = useState(3);
  const [pythB, setPythB] = useState(4);

  // 2. (a + b)^2
  const [sqA, setSqA] = useState(6);
  const [sqB, setSqB] = useState(3);

  // 3. Gauss sum
  const [gaussN, setGaussN] = useState(6);
  const [gaussMirrored, setGaussMirrored] = useState(true);

  // 4. Sum of odd numbers = n^2
  const [oddN, setOddN] = useState(5);

  // 5. Triangle interior angles = 180
  const [angA, setAngA] = useState(55);
  const [angB, setAngB] = useState(65);
  const angC = Math.max(15, 180 - angA - angB);

  const pythC = Math.sqrt(pythA * pythA + pythB * pythB);

  const ODD_COLORS = [
    '#0B1F3A',
    '#0D9488',
    '#C89B3C',
    '#2563EB',
    '#059669',
    '#D97706',
    '#7C3AED',
    '#E11D48',
  ];

  return (
    <div className="space-y-5">
      {/* Proof Selector */}
      <div className="inline-flex flex-wrap gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {(
          [
            { id: 'pythagoras', label: 'Pisagor (a² + b² = c²)' },
            { id: 'square-sum', label: 'Özdeşlik (a + b)²' },
            { id: 'gauss', label: 'Gauss Toplamı' },
            { id: 'odd-squares', label: 'Tek Sayılar = n²' },
            { id: 'triangle-angles', label: 'Üçgen İç Açıları 180°' },
          ] as { id: ProofId; label: string }[]
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveProof(item.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap transition-colors ${
              activeProof === item.id
                ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* PROOF 1: PYTHAGORAS */}
      {activeProof === 'pythagoras' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center">
            <svg viewBox="0 0 420 320" className="w-full max-w-md h-auto" role="img" aria-label="Pisagor teoremi geometrik alan ispatı">
              {(() => {
                const scale = 22;
                const x0 = 155;
                const y0 = 205;
                const aw = pythA * scale;
                const bh = pythB * scale;
                // Vertices: right angle at (x0, y0), B=(x0 + aw, y0), C=(x0, y0 - bh)
                // Square on hypotenuse outwards from C->B
                const vx = aw;
                const vy = bh; // vector from C(x0, y0-bh) to B(x0+aw, y0) is (aw, bh)
                // Outward normal to the right-top is (bh, -aw)
                const c1x = x0;
                const c1y = y0 - bh;
                const c2x = x0 + aw;
                const c2y = y0;
                const c3x = c2x + vy;
                const c3y = c2y - vx;
                const c4x = c1x + vy;
                const c4y = c1y - vx;

                return (
                  <g>
                    {/* Square on side b (left) */}
                    <rect
                      x={x0 - bh}
                      y={y0 - bh}
                      width={bh}
                      height={bh}
                      fill="#0D9488"
                      fillOpacity="0.22"
                      stroke="#0D9488"
                      strokeWidth="2"
                    />
                    <text x={x0 - bh / 2} y={y0 - bh / 2 + 4} textAnchor="middle" fill="#0D9488" fontSize="13" fontWeight="700">
                      b² = {pythB * pythB}
                    </text>

                    {/* Square on side a (bottom) */}
                    <rect
                      x={x0}
                      y={y0}
                      width={aw}
                      height={aw}
                      fill="#C89B3C"
                      fillOpacity="0.24"
                      stroke="#C89B3C"
                      strokeWidth="2"
                    />
                    <text x={x0 + aw / 2} y={y0 + aw / 2 + 4} textAnchor="middle" fill="#9A7218" fontSize="13" fontWeight="700">
                      a² = {pythA * pythA}
                    </text>

                    {/* Square on hypotenuse c */}
                    <polygon
                      points={`${c1x},${c1y} ${c2x},${c2y} ${c3x},${c3y} ${c4x},${c4y}`}
                      fill="#0B1F3A"
                      fillOpacity="0.16"
                      stroke="#0B1F3A"
                      strokeWidth="2"
                    />
                    <text
                      x={(c1x + c3x) / 2}
                      y={(c1y + c3y) / 2 + 4}
                      textAnchor="middle"
                      fill="#0B1F3A"
                      fontSize="13"
                      fontWeight="700"
                    >
                      c² = {pythA * pythA + pythB * pythB}
                    </text>

                    {/* Right Triangle */}
                    <polygon
                      points={`${x0},${y0} ${x0 + aw},${y0} ${x0},${y0 - bh}`}
                      fill="#0D9488"
                      fillOpacity="0.38"
                      stroke="#0B1F3A"
                      strokeWidth="2.5"
                    />
                    <rect x={x0} y={y0 - 12} width="12" height="12" fill="none" stroke="#0B1F3A" strokeWidth="1.5" />
                    <text x={x0 + aw / 2} y={y0 - 5} textAnchor="middle" fill="#0B1F3A" fontSize="11" fontWeight="700">
                      a={pythA}
                    </text>
                    <text x={x0 + 18} y={y0 - bh / 2} fill="#0B1F3A" fontSize="11" fontWeight="700">
                      b={pythB}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          <aside className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                8. Sınıf · Üçgenler · Alan İspatı
              </p>
              <h3 className="mt-1 text-lg font-semibold text-navy-900 dark:text-white">
                Pisagor Teoremi Görsel İspatı
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Bir dik üçgenin dik kenarları üzerine çizilen iki karenin alanları toplamı, her
                zaman hipotenüs üzerine çizilen karenin alanına eşittir.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Taban Dik Kenar (a)</span>
                  <span className="font-mono font-semibold tabular-nums">{pythA}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={5}
                  value={pythA}
                  onChange={(e) => setPythA(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Dikey Dik Kenar (b)</span>
                  <span className="font-mono font-semibold tabular-nums">{pythB}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={5}
                  value={pythB}
                  onChange={(e) => setPythB(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-center">
              <MathFormula
                latex={`${pythA}^2 + ${pythB}^2 = ${pythA * pythA} + ${pythB * pythB} = ${pythA * pythA + pythB * pythB}`}
                display
              />
              <p className="text-xs font-mono text-teal-700 dark:text-teal-400 tabular-nums">
                Hipotenüs c = √{pythA * pythA + pythB * pythB} ≈ {pythC.toFixed(2)}
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* PROOF 2: (a + b)^2 = a^2 + 2ab + b^2 */}
      {activeProof === 'square-sum' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center">
            <svg viewBox="0 0 340 340" className="w-full max-w-sm h-auto" role="img" aria-label="(a+b)^2 özdeşliği geometrik ispatı">
              {(() => {
                const total = sqA + sqB;
                const size = 250;
                const aPx = (sqA / total) * size;
                const bPx = (sqB / total) * size;
                const ox = 48;
                const oy = 42;
                return (
                  <g>
                    {/* a^2 */}
                    <rect x={ox} y={oy} width={aPx} height={aPx} fill="#0B1F3A" fillOpacity="0.82" stroke="#fff" strokeWidth="2" />
                    <text x={ox + aPx / 2} y={oy + aPx / 2 + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">
                      a² = {sqA * sqA}
                    </text>

                    {/* ab top-right */}
                    <rect x={ox + aPx} y={oy} width={bPx} height={aPx} fill="#0D9488" fillOpacity="0.8" stroke="#fff" strokeWidth="2" />
                    <text x={ox + aPx + bPx / 2} y={oy + aPx / 2 + 4} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
                      ab = {sqA * sqB}
                    </text>

                    {/* ab bottom-left */}
                    <rect x={ox} y={oy + aPx} width={aPx} height={bPx} fill="#0D9488" fillOpacity="0.8" stroke="#fff" strokeWidth="2" />
                    <text x={ox + aPx / 2} y={oy + aPx + bPx / 2 + 4} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
                      ab = {sqA * sqB}
                    </text>

                    {/* b^2 */}
                    <rect x={ox + aPx} y={oy + aPx} width={bPx} height={bPx} fill="#C89B3C" fillOpacity="0.88" stroke="#fff" strokeWidth="2" />
                    <text x={ox + aPx + bPx / 2} y={oy + aPx + bPx / 2 + 4} textAnchor="middle" fill="#0B1F3A" fontSize="12" fontWeight="700">
                      b² = {sqB * sqB}
                    </text>

                    {/* Dimension labels */}
                    <text x={ox + aPx / 2} y={oy - 10} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">
                      a = {sqA}
                    </text>
                    <text x={ox + aPx + bPx / 2} y={oy - 10} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">
                      b = {sqB}
                    </text>
                    <text x={ox - 16} y={oy + aPx / 2 + 4} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">
                      a
                    </text>
                    <text x={ox - 16} y={oy + aPx + bPx / 2 + 4} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">
                      b
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          <aside className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                8. Sınıf · Cebirsel İfadeler ve Özdeşlikler
              </p>
              <h3 className="mt-1 text-lg font-semibold text-navy-900 dark:text-white">
                Neden (a + b)² ≠ a² + b²?
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Kenarı (a + b) olan büyük kareyi böldüğümüzde sadece a² ve b² değil, iki adet turkuaz
                <strong> ab</strong> dikdörtgeni de ortaya çıkar! Bu yüzden ortada mutlaka <strong>+2ab</strong> terimi bulunur.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>a uzunluğu</span>
                  <span className="font-mono font-semibold tabular-nums">{sqA}</span>
                </div>
                <input type="range" min={2} max={8} value={sqA} onChange={(e) => setSqA(Number(e.target.value))} className="w-full accent-teal-600" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>b uzunluğu</span>
                  <span className="font-mono font-semibold tabular-nums">{sqB}</span>
                </div>
                <input type="range" min={1} max={6} value={sqB} onChange={(e) => setSqB(Number(e.target.value))} className="w-full accent-teal-600" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <MathFormula latex="(a + b)^2 = a^2 + 2ab + b^2" display />
              <p className="text-xs font-mono text-teal-700 dark:text-teal-400 tabular-nums">
                ({sqA} + {sqB})² = {sqA * sqA} + 2·{sqA * sqB} + {sqB * sqB} = {(sqA + sqB) * (sqA + sqB)}
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* PROOF 3: GAUSS SUM */}
      {activeProof === 'gauss' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center">
            <svg viewBox="0 0 380 280" className="w-full max-w-md h-auto" role="img" aria-label="Gauss ardışık sayılar toplamı görsel ispatı">
              {(() => {
                const cols = gaussN + 1;
                const rows = gaussN;
                const cell = Math.min(30, Math.floor(220 / rows));
                const startX = (380 - cols * cell) / 2;
                const startY = (250 - rows * cell) / 2 + 12;
                const rects = [];
                for (let r = 0; r < rows; r += 1) {
                  for (let c = 0; c < cols; c += 1) {
                    const isOriginal = c <= r;
                    if (!isOriginal && !gaussMirrored) continue;
                    rects.push(
                      <rect
                        key={`${r}-${c}`}
                        x={startX + c * cell + 1.5}
                        y={startY + r * cell + 1.5}
                        width={cell - 3}
                        height={cell - 3}
                        rx="4"
                        fill={isOriginal ? '#0D9488' : '#C89B3C'}
                        fillOpacity={isOriginal ? '0.9' : '0.45'}
                        stroke={isOriginal ? '#0B1F3A' : '#9A7218'}
                        strokeWidth="1"
                      />
                    );
                  }
                }
                return (
                  <g>
                    {rects}
                    <text x={190} y={startY - 10} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">
                      Genişlik = n + 1 = {cols}
                    </text>
                    <text x={startX - 18} y={startY + (rows * cell) / 2} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">
                      n={rows}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          <aside className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Örüntüler ve Sayı Dizileri · Görsel İspat
              </p>
              <h3 className="mt-1 text-lg font-semibold text-navy-900 dark:text-white">
                Gauss Ardışık Sayılar Toplamı
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                1’den n’ye kadar merdiven bloklarının yanına aynı merdivenin ters çevrilmiş kopyasını
                (altın bloklar) eklediğimizde <strong>n × (n + 1)</strong> boyutunda tam bir dikdörtgen oluşur.
                Bize sadece yarısı gerektiğinden sonucu 2’ye böleriz!
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Sayı Adedi (n)</span>
                <span className="font-mono font-semibold tabular-nums">{gaussN}</span>
              </div>
              <input
                type="range"
                min={3}
                max={9}
                value={gaussN}
                onChange={(e) => setGaussN(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <button
              type="button"
              onClick={() => setGaussMirrored((v) => !v)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-gold-600" />
              <span>{gaussMirrored ? 'Ters Kopyayı Gizle' : 'Ters Kopyayı Ekle ve Dikdörtgeni Gör'}</span>
            </button>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center">
              <MathFormula
                latex={`1 + 2 + \\dots + ${gaussN} = \\frac{${gaussN} \\cdot ${gaussN + 1}}{2} = ${(gaussN * (gaussN + 1)) / 2}`}
                display
              />
            </div>
          </aside>
        </div>
      )}

      {/* PROOF 4: SUM OF ODD NUMBERS = N^2 */}
      {activeProof === 'odd-squares' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center">
            <svg viewBox="0 0 320 320" className="w-full max-w-xs h-auto" role="img" aria-label="Tek sayıların toplamı tam kare görsel ispatı">
              {(() => {
                const cell = Math.floor(250 / oddN);
                const start = (320 - cell * oddN) / 2;
                const cells = [];
                for (let r = 0; r < oddN; r += 1) {
                  for (let c = 0; c < oddN; c += 1) {
                    const layer = Math.max(r, c);
                    cells.push(
                      <rect
                        key={`${r}-${c}`}
                        x={start + c * cell + 2}
                        y={start + r * cell + 2}
                        width={cell - 4}
                        height={cell - 4}
                        rx="5"
                        fill={ODD_COLORS[layer % ODD_COLORS.length]}
                        fillOpacity="0.88"
                      />
                    );
                  }
                }
                return <g>{cells}</g>;
              })()}
            </svg>
          </div>

          <aside className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Tam Kare Sayılar ve Örüntüler · Görsel İspat
              </p>
              <h3 className="mt-1 text-lg font-semibold text-navy-900 dark:text-white">
                Ardışık Tek Sayıların Toplamı Her Zaman Tam Karedir!
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                1 birim kareyle başlayıp her adımda dışına L biçiminde sıradaki tek sayı (3, 5, 7, 9...)
                kadar kare eklediğinizde şekil kusursuz biçimde bir sonraki tam kareye dönüşür.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Katman Sayısı (n)</span>
                <span className="font-mono font-semibold tabular-nums">{oddN}</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={oddN}
                onChange={(e) => setOddN(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <MathFormula
                latex={`${Array.from({ length: oddN }, (_, i) => 2 * i + 1).join(' + ')} = ${oddN}^2 = ${oddN * oddN}`}
                display
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Her farklı renk sıradaki bir tek sayıyı temsil eder.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* PROOF 5: TRIANGLE ANGLES = 180 */}
      {activeProof === 'triangle-angles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center">
            <svg viewBox="0 0 420 270" className="w-full max-w-md h-auto" role="img" aria-label="Üçgenin iç açıları toplamı 180 derece ispatı">
              {(() => {
                // Base at y=220 from x=70 to x=350 (length 280)
                const ax = 70;
                const ay = 220;
                const bx = 350;
                const by = 220;
                const radA = (angA * Math.PI) / 180;
                const radB = (angB * Math.PI) / 180;
                const tanA = Math.tan(radA);
                const tanB = Math.tan(radB);
                const rawCx = (ax * tanA + bx * tanB) / (tanA + tanB);
                const rawH = Math.min(165, Math.max(60, (rawCx - ax) * tanA));
                const cx = Math.min(320, Math.max(100, rawCx));
                const cy = ay - rawH;

                return (
                  <g>
                    {/* Parallel Line through Top Vertex C */}
                    <line x1="40" y1={cy} x2="380" y2={cy} stroke="#C89B3C" strokeWidth="2" strokeDasharray="6 4" />
                    <text x="342" y={cy - 8} fill="#9A7218" fontSize="11" fontWeight="600">
                      Paralel Doğru (d)
                    </text>

                    {/* Triangle */}
                    <polygon
                      points={`${ax},${ay} ${bx},${by} ${cx},${cy}`}
                      fill="#0D9488"
                      fillOpacity="0.18"
                      stroke="#0B1F3A"
                      strokeWidth="2.5"
                    />

                    {/* Bottom base angles */}
                    <text x={ax + 24} y={ay - 10} fill="#0D9488" fontSize="13" fontWeight="700">
                      α={angA}°
                    </text>
                    <text x={bx - 52} y={by - 10} fill="#2563EB" fontSize="13" fontWeight="700">
                      β={angB}°
                    </text>

                    {/* Top transferred Z-angles + vertex angle */}
                    <text x={cx - 46} y={cy + 16} fill="#0D9488" fontSize="12" fontWeight="700">
                      α={angA}°
                    </text>
                    <text x={cx - 12} y={cy + 34} fill="#C89B3C" fontSize="12" fontWeight="700">
                      γ={angC}°
                    </text>
                    <text x={cx + 22} y={cy + 16} fill="#2563EB" fontSize="12" fontWeight="700">
                      β={angB}°
                    </text>

                    {/* Straight angle arc at top */}
                    <path
                      d={`M ${cx - 32} ${cy} A 32 32 0 0 0 ${cx + 32} ${cy}`}
                      fill="none"
                      stroke="#C89B3C"
                      strokeWidth="2"
                    />
                  </g>
                );
              })()}
            </svg>
          </div>

          <aside className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                7. Sınıf · Doğrular ve Açılar · Z Kuralı İspatı
              </p>
              <h3 className="mt-1 text-lg font-semibold text-navy-900 dark:text-white">
                Üçgenin İç Açıları Neden Her Zaman 180°?
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Üçgenin tepe noktasından tabana <strong>paralel bir doğru (d)</strong> çizdiğimizde,
                Z kuralı (iç ters açılar) gereği α ve β açıları aynen tepeye taşınır. Tepede birleşen
                α + γ + β açıları bir <strong>doğru açı (180°)</strong> oluşturur!
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Sol Taban Açısı (α)</span>
                  <span className="font-mono font-semibold tabular-nums">{angA}°</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={105}
                  value={angA}
                  onChange={(e) => {
                    const nextA = Number(e.target.value);
                    setAngA(nextA);
                    if (nextA + angB > 155) setAngB(155 - nextA);
                  }}
                  className="w-full accent-teal-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Sağ Taban Açısı (β)</span>
                  <span className="font-mono font-semibold tabular-nums">{angB}°</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={105}
                  value={angB}
                  onChange={(e) => {
                    const nextB = Number(e.target.value);
                    setAngB(nextB);
                    if (angA + nextB > 155) setAngA(155 - nextB);
                  }}
                  className="w-full accent-teal-600"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Her Zaman Sabit Toplam</span>
              </div>
              <MathFormula latex={`${angA}^\\circ + ${angB}^\\circ + ${angC}^\\circ = 180^\\circ`} display />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
