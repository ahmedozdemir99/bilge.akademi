import React, { useEffect, useMemo, useState } from 'react';
import { Box, Layers, Pause, Play, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { MathFormula } from '../../ui/MathFormula';

export type GeometryShapeId =
  | 'square-pyramid'
  | 'tri-pyramid'
  | 'cube'
  | 'rect-prism'
  | 'tri-prism'
  | 'cylinder'
  | 'cone'
  | 'triangle'
  | 'circle'
  | 'rectangle';

interface ShapeDefinition {
  id: GeometryShapeId;
  label: string;
  shortGroup: '3B Piramit' | '3B Prizma' | '3B Döner Cisim' | '2B Şekil';
  hasNet: boolean;
  p1Label: string;
  p2Label: string;
  p3Label?: string;
  defaultP1: number;
  defaultP2: number;
  defaultP3?: number;
  euler?: { faces: number; edges: number; vertices: number; note: string };
  netDescription: string;
}

const SHAPE_DEFS: ShapeDefinition[] = [
  {
    id: 'square-pyramid',
    label: 'Kare Dik Piramit',
    shortGroup: '3B Piramit',
    hasNet: true,
    p1Label: 'Taban Kenarı (a)',
    p2Label: 'Piramit Yüksekliği (h)',
    defaultP1: 8,
    defaultP2: 9,
    euler: {
      faces: 5,
      edges: 8,
      vertices: 5,
      note: '1 kare taban + 4 eş ikizkenar üçgen yan yüz (Keops Piramidi formu)',
    },
    netDescription:
      'Açıldığında ortada bir kare taban ve dört kenarına bitişik dört eş ikizkenar üçgenden oluşan yıldız biçimli bir açınım ortaya çıkar.',
  },
  {
    id: 'tri-pyramid',
    label: 'Üçgen Piramit',
    shortGroup: '3B Piramit',
    hasNet: true,
    p1Label: 'Taban Kenarı (a)',
    p2Label: 'Piramit Yüksekliği (h)',
    defaultP1: 8,
    defaultP2: 8,
    euler: {
      faces: 4,
      edges: 6,
      vertices: 4,
      note: '1 eşkenar üçgen taban + 3 ikizkenar üçgen yan yüz (Dörtyüzlü)',
    },
    netDescription:
      'Açıldığında ortada bir eşkenar üçgen taban ve üç kenarına eklenmiş üç üçgen yan yüz görülür.',
  },
  {
    id: 'cube',
    label: 'Küp',
    shortGroup: '3B Prizma',
    hasNet: true,
    p1Label: 'Ayrıt Uzunluğu (a)',
    p2Label: 'Ölçek Görünümü',
    defaultP1: 6,
    defaultP2: 6,
    euler: {
      faces: 6,
      edges: 12,
      vertices: 8,
      note: '6 eş kare yüz · Özel bir kare prizmadır (11 farklı açınımı vardır)',
    },
    netDescription:
      'En bilinen açınımı haç (T) biçiminde yan yana ve üst üste dizilmiş 6 eş kareden oluşur.',
  },
  {
    id: 'rect-prism',
    label: 'Dikdörtgenler Prizması',
    shortGroup: '3B Prizma',
    hasNet: true,
    p1Label: 'Uzunluk (a)',
    p2Label: 'Yükseklik (h)',
    p3Label: 'Genişlik (b)',
    defaultP1: 8,
    defaultP2: 6,
    defaultP3: 5,
    euler: {
      faces: 6,
      edges: 12,
      vertices: 8,
      note: 'Karşılıklı 3 çift eş dikdörtgen yüz (kibrit kutusu / kitap formu)',
    },
    netDescription:
      'Açıldığında 4 yan dikdörtgen şerit hâlinde dizilir; alt ve üst taban dikdörtgenleri yukarı ve aşağı açılır.',
  },
  {
    id: 'tri-prism',
    label: 'Üçgen Dik Prizma',
    shortGroup: '3B Prizma',
    hasNet: true,
    p1Label: 'Taban Kenarı (a)',
    p2Label: 'Prizma Yüksekliği (h)',
    defaultP1: 7,
    defaultP2: 9,
    euler: {
      faces: 5,
      edges: 9,
      vertices: 6,
      note: '2 eş eşkenar üçgen taban + 3 eş dikdörtgen yan yüz (çadır / optik prizma)',
    },
    netDescription:
      'Açıldığında ortada yan yana 3 dikdörtgen yan yüz, üst ve altta ise 2 eşkenar üçgen taban yer alır.',
  },
  {
    id: 'cylinder',
    label: 'Dik Dairesel Silindir',
    shortGroup: '3B Döner Cisim',
    hasNet: true,
    p1Label: 'Taban Yarıçapı (r)',
    p2Label: 'Yükseklik (h)',
    defaultP1: 5,
    defaultP2: 9,
    euler: {
      faces: 3,
      edges: 2,
      vertices: 0,
      note: '2 eş daire taban + 1 eğri yan yüzey (açılınca dikdörtgen olur)',
    },
    netDescription:
      'Yan yüzey kesilip açıldığında genişliği taban çevresine (2πr), yüksekliği h olan bir dikdörtgene dönüşür; iki daire taban uçlara açılır.',
  },
  {
    id: 'cone',
    label: 'Dik Dairesel Koni',
    shortGroup: '3B Döner Cisim',
    hasNet: true,
    p1Label: 'Taban Yarıçapı (r)',
    p2Label: 'Yükseklik (h)',
    defaultP1: 5,
    defaultP2: 10,
    euler: {
      faces: 2,
      edges: 1,
      vertices: 1,
      note: '1 daire taban + 1 tepe noktası + daire dilimi yan yüzey',
    },
    netDescription:
      'Açıldığında yarıçapı ana doğru (l) uzunluğunda olan bir daire dilimi ve buna teğet r yarıçaplı taban dairesi elde edilir.',
  },
  {
    id: 'triangle',
    label: 'Dik Üçgen',
    shortGroup: '2B Şekil',
    hasNet: false,
    p1Label: 'Taban (a)',
    p2Label: 'Yükseklik (b)',
    defaultP1: 8,
    defaultP2: 6,
    netDescription: 'İki boyutlu düzlemsel şekildir; Pisagor bağıntısı ile hipotenüsü hesaplanır.',
  },
  {
    id: 'circle',
    label: 'Daire',
    shortGroup: '2B Şekil',
    hasNet: false,
    p1Label: 'Yarıçap (r)',
    p2Label: 'Merkez Açı (×30°)',
    defaultP1: 7,
    defaultP2: 4,
    netDescription: 'İki boyutlu düzlemsel şekildir; çevre 2πr ve alan πr² bağıntılarıyla bulunur.',
  },
  {
    id: 'rectangle',
    label: 'Dikdörtgen',
    shortGroup: '2B Şekil',
    hasNet: false,
    p1Label: 'Uzun Kenar (a)',
    p2Label: 'Kısa Kenar (b)',
    defaultP1: 9,
    defaultP2: 6,
    netDescription: 'İki boyutlu düzlemsel şekildir; köşegeni Pisagor bağıntısıyla hesaplanır.',
  },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPoints(ptsA: Array<[number, number]>, ptsB: Array<[number, number]>, t: number): string {
  return ptsA
    .map(([ax, ay], idx) => {
      const [bx, by] = ptsB[idx] ?? [ax, ay];
      return `${lerp(ax, bx, t).toFixed(1)},${lerp(ay, by, t).toFixed(1)}`;
    })
    .join(' ');
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function Geometry3DNetLab() {
  const [shapeId, setShapeId] = useState<GeometryShapeId>('square-pyramid');
  const [p1, setP1] = useState(8);
  const [p2, setP2] = useState(9);
  const [p3, setP3] = useState(5);

  // Unfold animation state: 0 = 3D folded solid, 100 = 2D flat net
  const [unfoldPct, setUnfoldPct] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animDir, setAnimDir] = useState<1 | -1>(1);

  const activeDef = useMemo(
    () => SHAPE_DEFS.find((s) => s.id === shapeId) ?? SHAPE_DEFS[0],
    [shapeId]
  );

  const handleSelectShape = (nextId: GeometryShapeId) => {
    const def = SHAPE_DEFS.find((s) => s.id === nextId) ?? SHAPE_DEFS[0];
    setShapeId(nextId);
    setP1(def.defaultP1);
    setP2(def.defaultP2);
    if (def.defaultP3) setP3(def.defaultP3);
    setIsAnimating(false);
    setUnfoldPct(0);
    setAnimDir(1);
  };

  useEffect(() => {
    if (!isAnimating || !activeDef.hasNet) return undefined;
    const timer = window.setInterval(() => {
      setUnfoldPct((prev) => {
        const next = prev + animDir * 2;
        if (next >= 100) {
          setAnimDir(-1);
          return 100;
        }
        if (next <= 0) {
          setAnimDir(1);
          return 0;
        }
        return next;
      });
    }, 36);
    return () => window.clearInterval(timer);
  }, [activeDef.hasNet, animDir, isAnimating]);

  const t = easeInOut(unfoldPct / 100);

  // Compute exact geometric formulas
  const metrics = useMemo(() => {
    if (shapeId === 'square-pyramid') {
      const a = p1;
      const h = p2;
      const slant = Math.sqrt(h * h + (a / 2) * (a / 2));
      const baseArea = a * a;
      const lateralArea = 2 * a * slant;
      const totalArea = baseArea + lateralArea;
      const volume = (baseArea * h) / 3;
      return [
        { label: 'Yan Yüz Yüksekliği (l)', latex: `l = \\sqrt{h^2 + (a/2)^2} \\approx ${slant.toFixed(2)}` },
        { label: 'Taban Alanı', latex: `A_{\\text{taban}} = a^2 = ${baseArea.toFixed(1)}` },
        { label: 'Yanal Alan (4 Üçgen)', latex: `A_{\\text{yan}} = 4 \\cdot \\frac{a \\cdot l}{2} \\approx ${lateralArea.toFixed(2)}` },
        { label: 'Toplam Yüzey Alanı', latex: `S = a^2 + 2al \\approx ${totalArea.toFixed(2)}` },
        { label: 'Hacim', latex: `V = \\frac{1}{3} a^2 h \\approx ${volume.toFixed(2)}` },
      ];
    }
    if (shapeId === 'tri-pyramid') {
      const a = p1;
      const h = p2;
      const baseArea = (Math.sqrt(3) / 4) * a * a;
      const apothem = (Math.sqrt(3) / 6) * a;
      const slant = Math.sqrt(h * h + apothem * apothem);
      const lateralArea = (3 * a * slant) / 2;
      const totalArea = baseArea + lateralArea;
      const volume = (baseArea * h) / 3;
      return [
        { label: 'Taban Alanı (Eşkenar)', latex: `A_{\\text{taban}} = \\frac{a^2\\sqrt{3}}{4} \\approx ${baseArea.toFixed(2)}` },
        { label: 'Yan Yüz Yüksekliği (l)', latex: `l \\approx ${slant.toFixed(2)}` },
        { label: 'Toplam Yüzey Alanı', latex: `S = A_{\\text{taban}} + \\frac{3al}{2} \\approx ${totalArea.toFixed(2)}` },
        { label: 'Hacim', latex: `V = \\frac{1}{3} A_{\\text{taban}} \\cdot h \\approx ${volume.toFixed(2)}` },
      ];
    }
    if (shapeId === 'cube') {
      const a = p1;
      const totalArea = 6 * a * a;
      const volume = a * a * a;
      const spaceDiag = a * Math.sqrt(3);
      return [
        { label: 'Bir Yüz Alanı', latex: `A_{\\text{yüz}} = a^2 = ${(a * a).toFixed(0)}` },
        { label: 'Toplam Yüzey Alanı', latex: `S = 6a^2 = ${totalArea.toFixed(0)}` },
        { label: 'Hacim', latex: `V = a^3 = ${volume.toFixed(0)}` },
        { label: 'Cisim Köşegeni', latex: `d = a\\sqrt{3} \\approx ${spaceDiag.toFixed(2)}` },
      ];
    }
    if (shapeId === 'rect-prism') {
      const a = p1;
      const h = p2;
      const b = p3;
      const baseArea = a * b;
      const lateralArea = 2 * (a + b) * h;
      const totalArea = 2 * (a * b + a * h + b * h);
      const volume = a * b * h;
      return [
        { label: 'Taban Alanı', latex: `A_{\\text{taban}} = a \\cdot b = ${baseArea}` },
        { label: 'Yanal Alan', latex: `A_{\\text{yan}} = 2(a+b)h = ${lateralArea}` },
        { label: 'Toplam Yüzey Alanı', latex: `S = 2(ab + ah + bh) = ${totalArea}` },
        { label: 'Hacim', latex: `V = a \\cdot b \\cdot h = ${volume}` },
      ];
    }
    if (shapeId === 'tri-prism') {
      const a = p1;
      const h = p2;
      const baseArea = (Math.sqrt(3) / 4) * a * a;
      const lateralArea = 3 * a * h;
      const totalArea = 2 * baseArea + lateralArea;
      const volume = baseArea * h;
      return [
        { label: 'Üçgen Taban Alanı', latex: `A_{\\text{taban}} = \\frac{a^2\\sqrt{3}}{4} \\approx ${baseArea.toFixed(2)}` },
        { label: 'Yanal Alan (3 Dikdörtgen)', latex: `A_{\\text{yan}} = 3ah = ${lateralArea}` },
        { label: 'Toplam Yüzey Alanı', latex: `S = 2A_{\\text{taban}} + 3ah \\approx ${totalArea.toFixed(2)}` },
        { label: 'Hacim', latex: `V = A_{\\text{taban}} \\cdot h \\approx ${volume.toFixed(2)}` },
      ];
    }
    if (shapeId === 'cylinder') {
      const r = p1;
      const h = p2;
      const baseArea = Math.PI * r * r;
      const lateralArea = 2 * Math.PI * r * h;
      const totalArea = 2 * baseArea + lateralArea;
      const volume = baseArea * h;
      return [
        { label: 'Taban Çevresi (Açınım Genişliği)', latex: `\\text{Ç} = 2\\pi r \\approx ${(2 * Math.PI * r).toFixed(2)}` },
        { label: 'Yanal Alan', latex: `A_{\\text{yan}} = 2\\pi r h \\approx ${lateralArea.toFixed(2)}` },
        { label: 'Toplam Yüzey Alanı', latex: `S = 2\\pi r(r + h) \\approx ${totalArea.toFixed(2)}` },
        { label: 'Hacim', latex: `V = \\pi r^2 h \\approx ${volume.toFixed(2)}` },
      ];
    }
    if (shapeId === 'cone') {
      const r = p1;
      const h = p2;
      const l = Math.sqrt(r * r + h * h);
      const baseArea = Math.PI * r * r;
      const lateralArea = Math.PI * r * l;
      const totalArea = baseArea + lateralArea;
      const volume = (baseArea * h) / 3;
      const sectorDeg = (360 * r) / l;
      return [
        { label: 'Ana Doğru (l)', latex: `l = \\sqrt{r^2 + h^2} \\approx ${l.toFixed(2)}` },
        { label: 'Açınım Merkez Açısı', latex: `\\alpha = \\frac{360^\\circ \\cdot r}{l} \\approx ${sectorDeg.toFixed(1)}^\\circ` },
        { label: 'Toplam Yüzey Alanı', latex: `S = \\pi r(r + l) \\approx ${totalArea.toFixed(2)}` },
        { label: 'Hacim', latex: `V = \\frac{1}{3}\\pi r^2 h \\approx ${volume.toFixed(2)}` },
      ];
    }
    if (shapeId === 'triangle') {
      const hyp = Math.sqrt(p1 * p1 + p2 * p2);
      return [
        { label: 'Alan', latex: `A = \\frac{a \\cdot b}{2} = ${((p1 * p2) / 2).toFixed(2)}` },
        { label: 'Hipotenüs', latex: `c = \\sqrt{a^2 + b^2} = ${hyp.toFixed(2)}` },
        { label: 'Çevre', latex: `\\text{Ç} = ${(p1 + p2 + hyp).toFixed(2)}` },
      ];
    }
    if (shapeId === 'circle') {
      const deg = Math.min(360, p2 * 30);
      return [
        { label: 'Alan', latex: `A = \\pi r^2 \\approx ${(Math.PI * p1 * p1).toFixed(2)}` },
        { label: 'Çevre', latex: `\\text{Ç} = 2\\pi r \\approx ${(2 * Math.PI * p1).toFixed(2)}` },
        { label: `Daire Dilimi (${deg}°)`, latex: `A_{\\text{dilim}} \\approx ${((Math.PI * p1 * p1 * deg) / 360).toFixed(2)}` },
      ];
    }
    const diag = Math.sqrt(p1 * p1 + p2 * p2);
    return [
      { label: 'Alan', latex: `A = a \\cdot b = ${(p1 * p2).toFixed(1)}` },
      { label: 'Çevre', latex: `\\text{Ç} = 2(a+b) = ${(2 * (p1 + p2)).toFixed(1)}` },
      { label: 'Köşegen', latex: `d = \\sqrt{a^2+b^2} = ${diag.toFixed(2)}` },
    ];
  }, [p1, p2, p3, shapeId]);

  /* ---------------- RENDER INTERACTIVE SVG STAGE ---------------- */
  const renderStageSvg = () => {
    /* 1. SQUARE PYRAMID (KARE DİK PİRAMİT) — 3D ↔ Star Net */
    if (shapeId === 'square-pyramid') {
      const s = 44 + p1 * 3.2; // base size in net
      const hVis = 68 + p2 * 5.2;
      const cx = 210;
      const cy = 175;
      // 3D base corners (isometric diamond/parallelogram)
      const b3D: Array<[number, number]> = [
        [cx - s * 0.65, cy + 28],
        [cx + s * 0.45, cy + 44],
        [cx + s * 0.82, cy + 8],
        [cx - s * 0.28, cy - 8],
      ];
      // 2D flat base square centered at (cx, cy)
      const hs = s * 0.44;
      const b2D: Array<[number, number]> = [
        [cx - hs, cy + hs], // bottom-left
        [cx + hs, cy + hs], // bottom-right
        [cx + hs, cy - hs], // top-right
        [cx - hs, cy - hs], // top-left
      ];
      const apex3D: [number, number] = [cx + 8, cy + 16 - hVis];
      const flapLen = Math.min(82, 40 + p2 * 3.8);
      const apexBottom: [number, number] = [cx, cy + hs + flapLen];
      const apexRight: [number, number] = [cx + hs + flapLen, cy];
      const apexTop: [number, number] = [cx, cy - hs - flapLen];
      const apexLeft: [number, number] = [cx - hs - flapLen, cy];

      return (
        <g>
          {/* Back faces first when folded */}
          <polygon
            points={lerpPoints([b3D[2], b3D[3], apex3D], [b2D[2], b2D[3], apexTop], t)}
            fill="#C89B3C"
            fillOpacity={lerp(0.18, 0.28, t)}
            stroke="#B45309"
            strokeWidth="2"
          />
          <polygon
            points={lerpPoints([b3D[3], b3D[0], apex3D], [b2D[3], b2D[0], apexLeft], t)}
            fill="#0D9488"
            fillOpacity={lerp(0.16, 0.26, t)}
            stroke="#0F766E"
            strokeWidth="2"
          />
          {/* Base Square */}
          <polygon
            points={lerpPoints(b3D, b2D, t)}
            fill="#0B1F3A"
            fillOpacity={lerp(0.24, 0.22, t)}
            stroke="#0B1F3A"
            strokeWidth="2.4"
          />
          {/* Front two triangular faces */}
          <polygon
            points={lerpPoints([b3D[0], b3D[1], apex3D], [b2D[0], b2D[1], apexBottom], t)}
            fill="#0D9488"
            fillOpacity={lerp(0.32, 0.28, t)}
            stroke="#0D9488"
            strokeWidth="2.2"
          />
          <polygon
            points={lerpPoints([b3D[1], b3D[2], apex3D], [b2D[1], b2D[2], apexRight], t)}
            fill="#C89B3C"
            fillOpacity={lerp(0.34, 0.28, t)}
            stroke="#C89B3C"
            strokeWidth="2.2"
          />
          {/* Height line h when mostly folded */}
          {t < 0.35 && (
            <g opacity={1 - t / 0.35}>
              <line
                x1={cx + 8}
                y1={cy + 18}
                x2={apex3D[0]}
                y2={apex3D[1]}
                stroke="#DC2626"
                strokeDasharray="4 3"
                strokeWidth="2"
              />
              <circle cx={apex3D[0]} cy={apex3D[1]} r="4" fill="#DC2626" />
              <text x={cx + 16} y={cy + 16 - hVis * 0.5} fill="#DC2626" fontSize="12" fontWeight="700">
                h = {p2}
              </text>
            </g>
          )}
          <text x={cx} y={cy + 4} textAnchor="middle" fill="#0B1F3A" fontSize="11" fontWeight="700">
            Taban ({p1}×{p1})
          </text>
          {t > 0.7 && (
            <text x={cx} y={322} textAnchor="middle" fill="#0F766E" fontSize="11" fontWeight="600">
              Açınım: 1 Kare Taban + 4 Eş İkizkenar Üçgen
            </text>
          )}
        </g>
      );
    }

    /* 2. TRIANGULAR PYRAMID (ÜÇGEN PİRAMİT / DÖRTYÜZLÜ) */
    if (shapeId === 'tri-pyramid') {
      const cx = 210;
      const cy = 185;
      const r = 42 + p1 * 3.2;
      const hVis = 70 + p2 * 4.5;
      const b3D: Array<[number, number]> = [
        [cx - r * 0.85, cy + 32],
        [cx + r * 0.85, cy + 32],
        [cx + r * 0.12, cy - 16],
      ];
      const b2D: Array<[number, number]> = [
        [cx - r * 0.75, cy + r * 0.44],
        [cx + r * 0.75, cy + r * 0.44],
        [cx, cy - r * 0.85],
      ];
      const apex3D: [number, number] = [cx, cy + 8 - hVis];
      const apexBottom: [number, number] = [cx, cy + r * 1.6];
      const apexRight: [number, number] = [cx + r * 1.45, cy - r * 0.65];
      const apexLeft: [number, number] = [cx - r * 1.45, cy - r * 0.65];

      return (
        <g>
          <polygon
            points={lerpPoints([b3D[1], b3D[2], apex3D], [b2D[1], b2D[2], apexRight], t)}
            fill="#C89B3C"
            fillOpacity="0.25"
            stroke="#B45309"
            strokeWidth="2"
          />
          <polygon
            points={lerpPoints([b3D[2], b3D[0], apex3D], [b2D[2], b2D[0], apexLeft], t)}
            fill="#0D9488"
            fillOpacity="0.2"
            stroke="#0F766E"
            strokeWidth="2"
          />
          <polygon
            points={lerpPoints(b3D, b2D, t)}
            fill="#0B1F3A"
            fillOpacity="0.22"
            stroke="#0B1F3A"
            strokeWidth="2.4"
          />
          <polygon
            points={lerpPoints([b3D[0], b3D[1], apex3D], [b2D[0], b2D[1], apexBottom], t)}
            fill="#0D9488"
            fillOpacity="0.34"
            stroke="#0D9488"
            strokeWidth="2.2"
          />
          {t < 0.35 && (
            <g opacity={1 - t / 0.35}>
              <line
                x1={cx}
                y1={cy + 14}
                x2={apex3D[0]}
                y2={apex3D[1]}
                stroke="#DC2626"
                strokeDasharray="4 3"
                strokeWidth="2"
              />
              <text x={cx + 10} y={cy - hVis * 0.4} fill="#DC2626" fontSize="12" fontWeight="700">
                h = {p2}
              </text>
            </g>
          )}
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#0B1F3A" fontSize="11" fontWeight="700">
            Taban (a={p1})
          </text>
        </g>
      );
    }

    /* 3. CUBE (KÜP) — 3D ↔ Cross Net (6 Squares) */
    if (shapeId === 'cube') {
      const s = 38 + p1 * 2.8;
      const dx = s * 0.42;
      const dy = s * 0.28;
      const cx = 195;
      const cy = 175;
      // 3D front square centered near (cx - 10, cy + 10)
      const f3D: Array<[number, number]> = [
        [cx - s / 2, cy - s / 2 + 12],
        [cx + s / 2, cy - s / 2 + 12],
        [cx + s / 2, cy + s / 2 + 12],
        [cx - s / 2, cy + s / 2 + 12],
      ];
      const top3D: Array<[number, number]> = [
        [f3D[0][0] + dx, f3D[0][1] - dy],
        [f3D[1][0] + dx, f3D[1][1] - dy],
        f3D[1],
        f3D[0],
      ];
      const right3D: Array<[number, number]> = [
        f3D[1],
        [f3D[1][0] + dx, f3D[1][1] - dy],
        [f3D[2][0] + dx, f3D[2][1] - dy],
        f3D[2],
      ];
      const left3D: Array<[number, number]> = [
        [f3D[0][0] + dx, f3D[0][1] - dy],
        f3D[0],
        f3D[3],
        [f3D[3][0] + dx, f3D[3][1] - dy],
      ];
      const bottom3D: Array<[number, number]> = [
        f3D[3],
        f3D[2],
        [f3D[2][0] + dx, f3D[2][1] - dy],
        [f3D[3][0] + dx, f3D[3][1] - dy],
      ];
      const back3D: Array<[number, number]> = [
        [f3D[0][0] + dx, f3D[0][1] - dy],
        [f3D[1][0] + dx, f3D[1][1] - dy],
        [f3D[2][0] + dx, f3D[2][1] - dy],
        [f3D[3][0] + dx, f3D[3][1] - dy],
      ];

      // 2D Cross Net: 4 across (Left, Front, Right, Back) + Top above Front + Bottom below Front
      const ns = Math.min(64, 38 + p1 * 2.2);
      const sx = 170;
      const sy = 170;
      const sq = (gx: number, gy: number): Array<[number, number]> => [
        [sx + gx * ns - ns / 2, sy + gy * ns - ns / 2],
        [sx + gx * ns + ns / 2, sy + gy * ns - ns / 2],
        [sx + gx * ns + ns / 2, sy + gy * ns + ns / 2],
        [sx + gx * ns - ns / 2, sy + gy * ns + ns / 2],
      ];

      return (
        <g>
          <polygon points={lerpPoints(back3D, sq(2, 0), t)} fill="#64748B" fillOpacity={lerp(0.08, 0.22, t)} stroke="#64748B" strokeWidth="1.8" strokeDasharray={t < 0.2 ? '4 3' : undefined} />
          <polygon points={lerpPoints(left3D, sq(-1, 0), t)} fill="#0D9488" fillOpacity={lerp(0.1, 0.24, t)} stroke="#0F766E" strokeWidth="1.8" />
          <polygon points={lerpPoints(bottom3D, sq(0, 1), t)} fill="#0B1F3A" fillOpacity={lerp(0.14, 0.22, t)} stroke="#0B1F3A" strokeWidth="2" />
          <polygon points={lerpPoints(top3D, sq(0, -1), t)} fill="#C89B3C" fillOpacity="0.28" stroke="#B45309" strokeWidth="2.2" />
          <polygon points={lerpPoints(right3D, sq(1, 0), t)} fill="#0D9488" fillOpacity="0.22" stroke="#0F766E" strokeWidth="2.2" />
          <polygon points={lerpPoints(f3D, sq(0, 0), t)} fill="#0D9488" fillOpacity="0.34" stroke="#0D9488" strokeWidth="2.4" />
          <text x={lerp(cx, sx, t)} y={lerp(cy + 16, sy + 4, t)} textAnchor="middle" fill="#0B1F3A" fontSize="12" fontWeight="700">
            a = {p1}
          </text>
          {t > 0.7 && (
            <text x="210" y="322" textAnchor="middle" fill="#0F766E" fontSize="11" fontWeight="600">
              Açınım: 6 Eş Kare Yüz (Her biri {p1}×{p1})
            </text>
          )}
        </g>
      );
    }

    /* 4. RECTANGULAR PRISM (DİKDÖRTGENLER PRİZMASI) */
    if (shapeId === 'rect-prism') {
      const w = 44 + p1 * 4.5;
      const h = 42 + p2 * 4.5;
      const d = 18 + p3 * 2.6;
      const cx = 195;
      const cy = 180;
      const dx = d * 0.72;
      const dy = d * 0.45;
      const f3D: Array<[number, number]> = [
        [cx - w / 2, cy - h / 2 + 12],
        [cx + w / 2, cy - h / 2 + 12],
        [cx + w / 2, cy + h / 2 + 12],
        [cx - w / 2, cy + h / 2 + 12],
      ];
      const top3D: Array<[number, number]> = [
        [f3D[0][0] + dx, f3D[0][1] - dy],
        [f3D[1][0] + dx, f3D[1][1] - dy],
        f3D[1],
        f3D[0],
      ];
      const right3D: Array<[number, number]> = [
        f3D[1],
        [f3D[1][0] + dx, f3D[1][1] - dy],
        [f3D[2][0] + dx, f3D[2][1] - dy],
        f3D[2],
      ];
      const left3D: Array<[number, number]> = [
        [f3D[0][0] + dx, f3D[0][1] - dy],
        f3D[0],
        f3D[3],
        [f3D[3][0] + dx, f3D[3][1] - dy],
      ];
      const bottom3D: Array<[number, number]> = [
        f3D[3],
        f3D[2],
        [f3D[2][0] + dx, f3D[2][1] - dy],
        [f3D[3][0] + dx, f3D[3][1] - dy],
      ];
      const back3D: Array<[number, number]> = [
        [f3D[0][0] + dx, f3D[0][1] - dy],
        [f3D[1][0] + dx, f3D[1][1] - dy],
        [f3D[2][0] + dx, f3D[2][1] - dy],
        [f3D[3][0] + dx, f3D[3][1] - dy],
      ];

      // Scaled 2D net that always fits inside 420x340
      const scale = Math.min(8.5, 320 / (2 * p1 + 2 * p3), 240 / (p2 + 2 * p3));
      const nw = p1 * scale;
      const nh = p2 * scale;
      const nd = p3 * scale;
      const x0 = 210 - (nw + nd);
      const y0 = 170 - nh / 2;
      const rectPts = (x: number, y: number, rw: number, rh: number): Array<[number, number]> => [
        [x, y],
        [x + rw, y],
        [x + rw, y + rh],
        [x, y + rh],
      ];

      return (
        <g>
          <polygon points={lerpPoints(back3D, rectPts(x0 + nd + nw + nd, y0, nw, nh), t)} fill="#64748B" fillOpacity={lerp(0.08, 0.22, t)} stroke="#64748B" strokeWidth="1.8" />
          <polygon points={lerpPoints(left3D, rectPts(x0, y0, nd, nh), t)} fill="#0D9488" fillOpacity={lerp(0.12, 0.24, t)} stroke="#0F766E" strokeWidth="1.8" />
          <polygon points={lerpPoints(bottom3D, rectPts(x0 + nd, y0 + nh, nw, nd), t)} fill="#0B1F3A" fillOpacity="0.2" stroke="#0B1F3A" strokeWidth="2" />
          <polygon points={lerpPoints(top3D, rectPts(x0 + nd, y0 - nd, nw, nd), t)} fill="#C89B3C" fillOpacity="0.28" stroke="#B45309" strokeWidth="2.2" />
          <polygon points={lerpPoints(right3D, rectPts(x0 + nd + nw, y0, nd, nh), t)} fill="#0D9488" fillOpacity="0.22" stroke="#0F766E" strokeWidth="2.2" />
          <polygon points={lerpPoints(f3D, rectPts(x0 + nd, y0, nw, nh), t)} fill="#0D9488" fillOpacity="0.34" stroke="#0D9488" strokeWidth="2.4" />
          <text x={lerp(cx, x0 + nd + nw / 2, t)} y={lerp(cy + 16, y0 + nh / 2 + 4, t)} textAnchor="middle" fill="#0B1F3A" fontSize="11" fontWeight="700">
            {p1} × {p2} (b={p3})
          </text>
          {t > 0.7 && (
            <text x="210" y="324" textAnchor="middle" fill="#0F766E" fontSize="11" fontWeight="600">
              Açınım: 3 Çift Eş Dikdörtgen Yüz (Toplam 6 Yüz)
            </text>
          )}
        </g>
      );
    }

    /* 5. TRIANGULAR PRISM (ÜÇGEN DİK PRİZMA) */
    if (shapeId === 'tri-prism') {
      const aPx = 54 + p1 * 3.8;
      const hPx = 68 + p2 * 5;
      const cx = 210;
      const cy = 175;
      const topTri3D: Array<[number, number]> = [
        [cx - aPx * 0.5, cy - hPx * 0.45],
        [cx + aPx * 0.5, cy - hPx * 0.45],
        [cx + aPx * 0.12, cy - hPx * 0.45 - aPx * 0.36],
      ];
      const botTri3D: Array<[number, number]> = [
        [cx - aPx * 0.5, cy + hPx * 0.45],
        [cx + aPx * 0.5, cy + hPx * 0.45],
        [cx + aPx * 0.12, cy + hPx * 0.45 - aPx * 0.36],
      ];
      // 2D Net: 3 vertical rectangles side by side + 2 equilateral triangles top & bottom
      const na = Math.min(78, 38 + p1 * 3.2);
      const nh = Math.min(130, 62 + p2 * 5.2);
      const triH = na * 0.76;
      const ny0 = cy - nh / 2;
      const ny1 = cy + nh / 2;
      const centerRect2D: Array<[number, number]> = [
        [cx - na / 2, ny0],
        [cx + na / 2, ny0],
        [cx + na / 2, ny1],
        [cx - na / 2, ny1],
      ];
      const leftRect2D: Array<[number, number]> = [
        [cx - 1.5 * na, ny0],
        [cx - na / 2, ny0],
        [cx - na / 2, ny1],
        [cx - 1.5 * na, ny1],
      ];
      const rightRect2D: Array<[number, number]> = [
        [cx + na / 2, ny0],
        [cx + 1.5 * na, ny0],
        [cx + 1.5 * na, ny1],
        [cx + na / 2, ny1],
      ];
      const topTri2D: Array<[number, number]> = [
        [cx - na / 2, ny0],
        [cx + na / 2, ny0],
        [cx, ny0 - triH],
      ];
      const botTri2D: Array<[number, number]> = [
        [cx - na / 2, ny1],
        [cx + na / 2, ny1],
        [cx, ny1 + triH],
      ];

      return (
        <g>
          {/* Left & right side rectangles */}
          <polygon
            points={lerpPoints([topTri3D[2], topTri3D[0], botTri3D[0], botTri3D[2]], leftRect2D, t)}
            fill="#0D9488"
            fillOpacity="0.18"
            stroke="#0F766E"
            strokeWidth="2"
          />
          <polygon
            points={lerpPoints([topTri3D[1], topTri3D[2], botTri3D[2], botTri3D[1]], rightRect2D, t)}
            fill="#0D9488"
            fillOpacity="0.22"
            stroke="#0F766E"
            strokeWidth="2"
          />
          {/* Bottom & Top triangles */}
          <polygon
            points={lerpPoints(botTri3D, botTri2D, t)}
            fill="#C89B3C"
            fillOpacity="0.28"
            stroke="#B45309"
            strokeWidth="2.2"
          />
          <polygon
            points={lerpPoints(topTri3D, topTri2D, t)}
            fill="#C89B3C"
            fillOpacity="0.34"
            stroke="#B45309"
            strokeWidth="2.2"
          />
          {/* Front rectangle */}
          <polygon
            points={lerpPoints([topTri3D[0], topTri3D[1], botTri3D[1], botTri3D[0]], centerRect2D, t)}
            fill="#0D9488"
            fillOpacity="0.34"
            stroke="#0D9488"
            strokeWidth="2.4"
          />
          <text x={cx} y={cy + 4} textAnchor="middle" fill="#0B1F3A" fontSize="11" fontWeight="700">
            a={p1}, h={p2}
          </text>
          {t > 0.7 && (
            <text x="210" y="324" textAnchor="middle" fill="#0F766E" fontSize="11" fontWeight="600">
              Açınım: 3 Eş Dikdörtgen Yan Yüz + 2 Üçgen Taban
            </text>
          )}
        </g>
      );
    }

    /* 6. CYLINDER (DİK DAİRESEL SİLİNDİR) — 3D ↔ Rectangle (2πr × h) + 2 Circles */
    if (shapeId === 'cylinder') {
      const rx3D = 26 + p1 * 4.5;
      const ry3D = rx3D * 0.3;
      const h3D = 72 + p2 * 5.2;
      const cx = 210;
      const cy = 175;
      // 2D net dimensions
      const circW = Math.min(280, 120 + p1 * 14);
      const netH = Math.min(118, 60 + p2 * 4.8);
      const circleR = Math.min(44, 18 + p1 * 2.4);

      const rectHalfW = lerp(rx3D, circW / 2, t);
      const rectHalfH = lerp(h3D / 2, netH / 2, t);
      const topCy = lerp(cy - h3D / 2, cy - netH / 2 - circleR - 2, t);
      const botCy = lerp(cy + h3D / 2, cy + netH / 2 + circleR + 2, t);
      const capRx = lerp(rx3D, circleR, t);
      const capRy = lerp(ry3D, circleR, t);

      return (
        <g>
          {/* Lateral rectangle body */}
          <rect
            x={cx - rectHalfW}
            y={cy - rectHalfH}
            width={rectHalfW * 2}
            height={rectHalfH * 2}
            fill="#0D9488"
            fillOpacity={lerp(0.18, 0.28, t)}
            stroke="#0D9488"
            strokeWidth="2.4"
          />
          {/* Top circle/ellipse */}
          <ellipse
            cx={cx}
            cy={topCy}
            rx={capRx}
            ry={capRy}
            fill="#C89B3C"
            fillOpacity="0.3"
            stroke="#B45309"
            strokeWidth="2.2"
          />
          {/* Bottom circle/ellipse */}
          <ellipse
            cx={cx}
            cy={botCy}
            rx={capRx}
            ry={capRy}
            fill="#C89B3C"
            fillOpacity="0.22"
            stroke="#B45309"
            strokeWidth="2.2"
          />
          {/* Dimension labels */}
          <text x={cx} y={cy + 4} textAnchor="middle" fill="#0B1F3A" fontSize="11" fontWeight="700">
            {t > 0.55 ? `2πr ≈ ${(2 * Math.PI * p1).toFixed(1)} · h = ${p2}` : `r = ${p1}, h = ${p2}`}
          </text>
          <text x={cx + rectHalfW + 14} y={cy + 4} fill="#64748B" fontSize="12" fontWeight="600">
            h={p2}
          </text>
          {t > 0.7 && (
            <text x="210" y="330" textAnchor="middle" fill="#0F766E" fontSize="11" fontWeight="600">
              Açınım: 2πr × h Dikdörtgen Yan Yüz + 2 Eş Daire Taban
            </text>
          )}
        </g>
      );
    }

    /* 7. CONE (DİK DAİRESEL KONİ) — 3D ↔ Circular Sector + Base Circle */
    if (shapeId === 'cone') {
      const r3D = 26 + p1 * 4.2;
      const ry3D = r3D * 0.3;
      const h3D = 88 + p2 * 5.2;
      const cx = 210;
      const apexY = lerp(195 - h3D, 52, t);
      const baseY = lerp(215, 252, t);
      const l = Math.sqrt(p1 * p1 + p2 * p2);
      const sectorR = Math.min(138, 74 + l * 4.2);
      const halfAngleRad = ((Math.min(250, (360 * p1) / l) * Math.PI) / 180) * 0.5;
      const arcX1 = cx - Math.sin(halfAngleRad) * sectorR;
      const arcY1 = apexY + Math.cos(halfAngleRad) * sectorR;
      const arcX2 = cx + Math.sin(halfAngleRad) * sectorR;
      const arcY2 = apexY + Math.cos(halfAngleRad) * sectorR;
      const largeArc = halfAngleRad * 2 > Math.PI ? 1 : 0;

      const circleR = Math.min(40, 18 + p1 * 2.2);
      const capRx = lerp(r3D, circleR, t);
      const capRy = lerp(ry3D, circleR, t);
      const netBaseCy = apexY + sectorR + circleR + 4;
      const capCy = lerp(baseY, Math.min(286, netBaseCy), t);

      return (
        <g>
          {/* 3D Cone triangle fading into 2D sector */}
          {t < 0.5 ? (
            <polygon
              points={`${cx},${apexY} ${cx - r3D},${baseY} ${cx + r3D},${baseY}`}
              fill="#0D9488"
              fillOpacity="0.24"
              stroke="#0D9488"
              strokeWidth="2.4"
            />
          ) : (
            <path
              d={`M ${cx} ${apexY} L ${arcX1.toFixed(1)} ${arcY1.toFixed(1)} A ${sectorR} ${sectorR} 0 ${largeArc} 0 ${arcX2.toFixed(1)} ${arcY2.toFixed(1)} Z`}
              fill="#0D9488"
              fillOpacity="0.28"
              stroke="#0D9488"
              strokeWidth="2.4"
            />
          )}
          {/* Base circle */}
          <ellipse
            cx={cx}
            cy={capCy}
            rx={capRx}
            ry={capRy}
            fill="#C89B3C"
            fillOpacity="0.3"
            stroke="#B45309"
            strokeWidth="2.2"
          />
          {t < 0.35 && (
            <line
              x1={cx}
              y1={apexY}
              x2={cx}
              y2={baseY}
              stroke="#DC2626"
              strokeDasharray="4 3"
              strokeWidth="2"
            />
          )}
          <text x={cx + 12} y={lerp((apexY + baseY) / 2, apexY + sectorR * 0.5, t)} fill="#0B1F3A" fontSize="11" fontWeight="700">
            {t < 0.5 ? `h=${p2}, l≈${l.toFixed(1)}` : `Ana Doğru l ≈ ${l.toFixed(1)}`}
          </text>
          {t > 0.7 && (
            <text x="210" y="332" textAnchor="middle" fill="#0F766E" fontSize="11" fontWeight="600">
              Açınım: Daire Dilimi Yan Yüz + r={p1} Taban Dairesi
            </text>
          )}
        </g>
      );
    }

    /* 8. 2D RIGHT TRIANGLE */
    if (shapeId === 'triangle') {
      return (
        <g>
          <polygon
            points={`85,260 ${85 + p1 * 20},260 85,${260 - p2 * 16}`}
            fill="#0D9488"
            fillOpacity="0.2"
            stroke="#0D9488"
            strokeWidth="2.6"
          />
          <rect x="85" y="244" width="16" height="16" fill="none" stroke="#C89B3C" strokeWidth="2" />
          <text x={85 + p1 * 10} y="284" fill="#475569" fontSize="13" fontWeight="600" textAnchor="middle">
            a = {p1}
          </text>
          <text x="56" y={260 - p2 * 8} fill="#475569" fontSize="13" fontWeight="600" textAnchor="middle">
            b = {p2}
          </text>
        </g>
      );
    }

    /* 9. 2D CIRCLE */
    if (shapeId === 'circle') {
      const r = Math.min(115, p1 * 9.5);
      return (
        <g>
          <circle cx="210" cy="170" r={r} fill="#0D9488" fillOpacity="0.18" stroke="#0D9488" strokeWidth="2.6" />
          <line x1="210" y1="170" x2={210 + r} y2="170" stroke="#C89B3C" strokeWidth="2.4" />
          <circle cx="210" cy="170" r="3.5" fill="#0B1F3A" />
          <text x={210 + r / 2} y="158" textAnchor="middle" fill="#475569" fontSize="13" fontWeight="600">
            r = {p1}
          </text>
        </g>
      );
    }

    /* 10. 2D RECTANGLE */
    return (
      <g>
        <rect
          x="85"
          y={255 - p2 * 15}
          width={p1 * 20}
          height={p2 * 15}
          fill="#0D9488"
          fillOpacity="0.18"
          stroke="#0D9488"
          strokeWidth="2.6"
        />
        <line
          x1="85"
          y1="255"
          x2={85 + p1 * 20}
          y2={255 - p2 * 15}
          stroke="#C89B3C"
          strokeDasharray="5 4"
          strokeWidth="2"
        />
        <text x={85 + p1 * 10} y="278" fill="#475569" fontSize="13" fontWeight="600" textAnchor="middle">
          a = {p1}
        </text>
        <text x="58" y={255 - p2 * 7.5} fill="#475569" fontSize="13" fontWeight="600" textAnchor="middle">
          b = {p2}
        </text>
      </g>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 cols: Interactive 3D Solid & Net Unfolding Stage */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              {activeDef.shortGroup} {activeDef.hasNet ? '· 3B Cisim & Canlı Açınım Laboratuvarı' : '· Düzlemsel Geometri'}
            </p>
            <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
              {activeDef.label}
            </h3>
          </div>
          {activeDef.hasNet && (
            <span className="text-xs font-mono font-semibold text-navy-900 dark:text-teal-300 tabular-nums px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              {unfoldPct === 0 ? '3B Katlı Cisim' : unfoldPct === 100 ? 'Tam 2B Açınım' : `Açınım: %${unfoldPct}`}
            </span>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 p-3 flex items-center justify-center">
          <svg
            viewBox="0 0 420 340"
            className="w-full max-w-[460px] h-auto select-none"
            role="img"
            aria-label={`${activeDef.label} geometrik görselleştirme ve açınım animasyonu`}
          >
            {renderStageSvg()}
          </svg>
        </div>

        {/* Unfold / Fold Animation Controls for 3D Shapes */}
        {activeDef.hasNet && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="control-grid gap-2">
                <button
                  type="button"
                  onClick={() => setIsAnimating((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer"
                >
                  {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAnimating ? 'Animasyonu Durdur' : 'Açınım Animasyonunu Oynat'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAnimating(false);
                    setUnfoldPct(0);
                    setAnimDir(1);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3B Katla</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAnimating(false);
                    setUnfoldPct(100);
                    setAnimDir(-1);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Tam Açınım</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAnimating(false);
                  setUnfoldPct(0);
                  setP1(activeDef.defaultP1);
                  setP2(activeDef.defaultP2);
                  if (activeDef.defaultP3) setP3(activeDef.defaultP3);
                }}
                aria-label="Sıfırla"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span>Katlı (3B Cisim)</span>
                <span className="font-mono tabular-nums font-semibold text-teal-700 dark:text-teal-400">
                  Açılma Oranı: %{unfoldPct}
                </span>
                <span>Açık (2B Açınım)</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={unfoldPct}
                onChange={(e) => {
                  setIsAnimating(false);
                  setUnfoldPct(Number(e.target.value));
                }}
                className="w-full accent-teal-600"
              />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeDef.netDescription}
            </p>
          </div>
        )}

        {/* Euler & Face/Edge/Vertex Summary for 3D Solids */}
        {activeDef.euler && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Yüz Sayısı (Y)</p>
              <p className="mt-0.5 text-lg font-mono font-bold text-navy-900 dark:text-white tabular-nums">
                {activeDef.euler.faces}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Ayrıt Sayısı (A)</p>
              <p className="mt-0.5 text-lg font-mono font-bold text-teal-700 dark:text-teal-400 tabular-nums">
                {activeDef.euler.edges}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Köşe Sayısı (K)</p>
              <p className="mt-0.5 text-lg font-mono font-bold text-gold-600 dark:text-gold-400 tabular-nums">
                {activeDef.euler.vertices}
              </p>
            </div>
            <p className="col-span-3 text-xs text-slate-600 dark:text-slate-300 text-left px-1">
              <strong>Yapı Özeti:</strong> {activeDef.euler.note}
              {activeDef.euler.vertices > 1 && (
                <span className="ml-2 font-mono text-teal-700 dark:text-teal-400">
                  (Euler: K − A + Y = {activeDef.euler.vertices} − {activeDef.euler.edges} + {activeDef.euler.faces} = 2)
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Right 5 cols: Shape Picker, Sliders & Calculations */}
      <aside className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-semibold text-navy-900 dark:text-white">
            Geometrik Şekil, Prizma ve Piramit Seçimi
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SHAPE_DEFS.map((sh) => {
            const active = shapeId === sh.id;
            return (
              <button
                key={sh.id}
                type="button"
                onClick={() => handleSelectShape(sh.id)}
                className={`px-3 py-2 text-left rounded-lg border transition-colors cursor-pointer ${
                  active
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-navy-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-500/60'
                }`}
              >
                <p className="text-xs font-semibold leading-tight">{sh.label}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {sh.shortGroup}
                  {sh.hasNet ? ' · Açınım' : ''}
                </p>
              </button>
            );
          })}
        </div>

        <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>{activeDef.p1Label}</span>
              <span className="font-mono font-semibold tabular-nums">{p1}</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              value={p1}
              onChange={(e) => setP1(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          {shapeId !== 'cube' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{activeDef.p2Label}</span>
                <span className="font-mono font-semibold tabular-nums">{p2}</span>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                value={p2}
                onChange={(e) => setP2(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
          )}

          {activeDef.p3Label && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{activeDef.p3Label}</span>
                <span className="font-mono font-semibold tabular-nums">{p3}</span>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                value={p3}
                onChange={(e) => setP3(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <p className="text-xs font-semibold text-navy-900 dark:text-white">
            {activeDef.label} Hesaplamaları
          </p>
          {metrics.map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs overflow-x-auto"
            >
              <span className="text-slate-600 dark:text-slate-400 shrink-0">{item.label}</span>
              <MathFormula latex={item.latex} />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
