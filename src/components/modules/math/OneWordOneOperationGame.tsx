import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Gamepad2, HelpCircle, Play, RefreshCw, Sparkles, Trophy, Zap } from 'lucide-react';
import { compile } from 'mathjs';

type GameSubTab = 'islem' | 'kelime' | 'hizli';

interface NumberRound {
  tiles: number[];
  target: number;
}

interface SolverNode {
  val: number;
  expr: string;
}

function generateNumberRound(): NumberRound {
  const smallPool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];
  const largePool = [25, 50, 75, 100];
  const tiles: number[] = [];
  for (let i = 0; i < 5; i += 1) {
    const idx = Math.floor(Math.random() * smallPool.length);
    tiles.push(smallPool.splice(idx, 1)[0]);
  }
  tiles.push(largePool[Math.floor(Math.random() * largePool.length)]);
  const target = Math.floor(Math.random() * 850) + 120;
  return { tiles, target };
}

function solveNumberTarget(tiles: number[], target: number): { diff: number; value: number; expr: string } {
  let best = { diff: Infinity, value: tiles[0], expr: String(tiles[0]) };
  let opsCount = 0;
  const MAX_STEPS = 45000;

  function dfs(nodes: SolverNode[]) {
    if (best.diff === 0 || opsCount > MAX_STEPS) return;
    opsCount += 1;

    for (const n of nodes) {
      const d = Math.abs(n.val - target);
      if (d < best.diff) {
        best = { diff: d, value: n.val, expr: n.expr };
        if (d === 0) return;
      }
    }
    if (nodes.length < 2) return;

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const rest = nodes.filter((_, idx) => idx !== i && idx !== j);

        const candidates: SolverNode[] = [
          { val: a.val + b.val, expr: `(${a.expr} + ${b.expr})` },
          { val: a.val * b.val, expr: `(${a.expr} × ${b.expr})` },
        ];
        if (a.val > b.val) {
          candidates.push({ val: a.val - b.val, expr: `(${a.expr} - ${b.expr})` });
        } else if (b.val > a.val) {
          candidates.push({ val: b.val - a.val, expr: `(${b.expr} - ${a.expr})` });
        }
        if (b.val > 1 && a.val % b.val === 0) {
          candidates.push({ val: a.val / b.val, expr: `(${a.expr} ÷ ${b.expr})` });
        } else if (a.val > 1 && b.val % a.val === 0) {
          candidates.push({ val: b.val / a.val, expr: `(${b.expr} ÷ ${a.expr})` });
        }

        for (const cand of candidates) {
          if (cand.val > 0 && cand.val <= 100000) {
            dfs([...rest, cand]);
            if (best.diff === 0 || opsCount > MAX_STEPS) return;
          }
        }
      }
    }
  }

  dfs(tiles.map((t) => ({ val: t, expr: String(t) })));
  return best;
}

// Built-in Turkish educational dictionary for "1 Kelime"
const TURKISH_WORD_BANK = [
  'AKADEMİ', 'AKIL', 'ALAN', 'ALEM', 'ALTIN', 'ANLAM', 'ARAMA', 'ASAL', 'AÇI', 'AĞAÇ',
  'BAHAR', 'BAKIM', 'BARIŞ', 'BASİT', 'BAŞARI', 'BEREKET', 'BESİN', 'BEYİT', 'BİLGE',
  'BİLGİ', 'BİLİM', 'BİREY', 'BÖLEN', 'BULUT', 'BÜYÜK', 'CEBİR', 'CEVAP', 'CÜMLE',
  'ÇABUK', 'ÇARPAN', 'ÇEMBER', 'ÇİZGİ', 'ÇÖZÜM', 'DAİRE', 'DAĞ', 'DEĞER', 'DENEME',
  'DENİZ', 'DERİN', 'DERS', 'DESTAN', 'DEVİR', 'DEVLET', 'DİK', 'DİL', 'DİVAN', 'DİZE',
  'DOĞA', 'DOĞRU', 'DOST', 'DÖNEM', 'DÜNYA', 'DÜŞÜN', 'DÜZEN', 'EDEBİ', 'EĞİM', 'EĞİTİM',
  'EKİM', 'EKMEK', 'ELMA', 'EMEK', 'ENERJİ', 'ERDEM', 'ESER', 'EVREN', 'EYLEM', 'FARK',
  'FAYDA', 'FELSEFE', 'FEN', 'FETİH', 'FİKİR', 'FORMÜL', 'GAZİ', 'GECE', 'GEÇİT', 'GELİR',
  'GEMİ', 'GENÇ', 'GERÇEK', 'GEZEGEN', 'GİZEM', 'GÖK', 'GÖLGE', 'GÖREV', 'GÖRÜŞ', 'GÖZLEM',
  'GRAFİK', 'GÜÇ', 'GÜL', 'GÜMÜŞ', 'GÜNEŞ', 'GÜVEN', 'GÜZEL', 'HABER', 'HACİM', 'HAKİM',
  'HALK', 'HARF', 'HARİTA', 'HAYAL', 'HAYAT', 'HECE', 'HEDEF', 'HESAP', 'HIZ', 'HİKAYE',
  'HİKMET', 'HUZUR', 'ILIK', 'IŞIK', 'İCAT', 'İFADE', 'İKLİM', 'İLKE', 'İLİM', 'İMGE',
  'İNSAN', 'İPUCU', 'İSPAT', 'İŞLEM', 'İZLEM', 'KADER', 'KAFİYE', 'KALEM', 'KALP', 'KANIT',
  'KAPI', 'KARAR', 'KARE', 'KARŞI', 'KAT', 'KAVRAM', 'KAYNAK', 'KELİME', 'KENAR', 'KESİR',
  'KEŞİF', 'KISA', 'KİTAP', 'KOD', 'KOLAY', 'KONU', 'KOŞUL', 'KÖK', 'KÖPRÜ', 'KURAL',
  'KURAM', 'KÜME', 'KÜRE', 'KÜLTÜR', 'LALE', 'LİMAN', 'LİSE', 'MANTIK', 'MASAL', 'MATEMATİK',
  'MAVİ', 'MECLİS', 'MEDENİ', 'MERAK', 'MERKEZ', 'MESAFE', 'METİN', 'MEVSİM', 'MİRAS',
  'MİSAL', 'MODEL', 'MÜZİK', 'NAZIM', 'NEDEN', 'NEFES', 'NEHİR', 'NESİL', 'NET', 'NİCEL',
  'NOKTA', 'NOT', 'NÜKTE', 'ODAK', 'OKUL', 'OLAY', 'OLGU', 'OLASILIK', 'ORAN', 'ORDU',
  'ORMAN', 'ORTA', 'OYUN', 'OZAN', 'ÖDEV', 'ÖĞREN', 'ÖLÇÜ', 'ÖMÜR', 'ÖNERİ', 'ÖNEM',
  'ÖRNEK', 'ÖRÜNTÜ', 'ÖZDEŞ', 'ÖZGÜN', 'ÖZGÜR', 'ÖZLEM', 'PADİŞAH', 'PARÇA', 'PAYDA',
  'PLAN', 'PUAN', 'RAKAM', 'RENK', 'RESİM', 'RİTİM', 'ROMAN', 'RÜZGAR', 'SABAH', 'SABIR',
  'SAĞLAM', 'SAHNE', 'SANAT', 'SANİYE', 'SAVAŞ', 'SAYFA', 'SAYGI', 'SAYI', 'SEBEP',
  'SEÇİM', 'SEFER', 'SEVGİ', 'SEZGİ', 'SIFIR', 'SINAV', 'SINIF', 'SINIR', 'SİSTEM',
  'SONUÇ', 'SORGU', 'SORU', 'SOYUT', 'SÖZ', 'SÖZLÜK', 'SÜRE', 'SÜREÇ', 'ŞAİR', 'ŞARKI',
  'ŞEHİR', 'ŞEKİL', 'ŞİİR', 'TABAN', 'TABLO', 'TAKVİM', 'TARİH', 'TASARI', 'TAŞ', 'TEKER',
  'TEMEL', 'TEOREM', 'TERİM', 'TEST', 'TOPLAM', 'TOPRAK', 'TÖRE', 'TUTAR', 'TÜRKÇE',
  'UFUK', 'ULAŞIM', 'ULUS', 'UMUT', 'USTA', 'UYGAR', 'UYUM', 'UZAY', 'UZUN', 'ÜÇGEN',
  'ÜLKE', 'ÜNLÜ', 'ÜRETİM', 'ÜSLUP', 'ÜSTÜN', 'VARLIK', 'VATAN', 'VECİZE', 'VERİ', 'YAPAY',
  'YAPI', 'YARAR', 'YARIŞ', 'YASA', 'YAŞAM', 'YAZAR', 'YAZI', 'YENİ', 'YETENEK', 'YILDIZ',
  'YIL', 'YOL', 'YORUM', 'YÖN', 'YÖNTEM', 'YURT', 'YÜREK', 'YÜZDE', 'YÜZEY', 'ZAFER',
  'ZAMAN', 'ZARİF', 'ZEKA', 'ZEMİN', 'ZENGİN', 'ZİHİN', 'ZİRVE',
];

const VOWELS = ['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü'];
const CONSONANTS = [
  'B', 'C', 'Ç', 'D', 'G', 'H', 'K', 'K', 'L', 'L', 'M', 'M', 'N', 'N', 'P', 'R', 'R', 'S', 'S', 'Ş', 'T', 'T', 'V', 'Y', 'Z',
];

function generateLetterPool(): string[] {
  const letters: string[] = [];
  const vowelBag = ['A', 'A', 'E', 'E', 'İ', 'I', 'O', 'U', 'Ü', 'Ö'];
  for (let i = 0; i < 3; i += 1) {
    letters.push(vowelBag[Math.floor(Math.random() * vowelBag.length)]);
  }
  for (let i = 0; i < 5; i += 1) {
    letters.push(CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)]);
  }
  return letters;
}

function canFormWord(word: string, pool: string[], allowJoker = true): { ok: boolean; jokerUsed: boolean } {
  const upper = word.trim().toLocaleUpperCase('tr');
  if (upper.length < 3) return { ok: false, jokerUsed: false };
  const counts: Record<string, number> = {};
  for (const ch of pool) {
    counts[ch] = (counts[ch] || 0) + 1;
  }
  let jokerLeft = allowJoker ? 1 : 0;
  for (const ch of upper) {
    if (counts[ch] && counts[ch] > 0) {
      counts[ch] -= 1;
    } else if (jokerLeft > 0) {
      jokerLeft -= 1;
    } else {
      return { ok: false, jokerUsed: false };
    }
  }
  return { ok: true, jokerUsed: allowJoker && jokerLeft === 0 };
}

interface QuickMathQ {
  prompt: string;
  answer: number;
}

function nextQuickMathQ(): QuickMathQ {
  const type = Math.floor(Math.random() * 5);
  if (type === 0) {
    const a = Math.floor(Math.random() * 13) + 4;
    return { prompt: `${a}² = ?`, answer: a * a };
  }
  if (type === 1) {
    const a = Math.floor(Math.random() * 13) + 3;
    return { prompt: `√${a * a} = ?`, answer: a };
  }
  if (type === 2) {
    const a = Math.floor(Math.random() * 11) + 4;
    const b = Math.floor(Math.random() * 9) + 3;
    return { prompt: `${a} × ${b} = ?`, answer: a * b };
  }
  if (type === 3) {
    const base = (Math.floor(Math.random() * 9) + 2) * 20;
    const pct = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
    return { prompt: `${base} sayısının %${pct}’si = ?`, answer: (base * pct) / 100 };
  }
  const a = Math.floor(Math.random() * 15) + 5;
  const b = Math.floor(Math.random() * 20) + 8;
  return { prompt: `${a} - ${b} = ?`, answer: a - b };
}

export function OneWordOneOperationGame() {
  const [subTab, setSubTab] = useState<GameSubTab>('islem');
  const [totalScore, setTotalScore] = useState(0);

  // --- 1 İŞLEM STATE ---
  const [numRound, setNumRound] = useState<NumberRound>(() => generateNumberRound());
  const [exprInput, setExprInput] = useState('');
  const [numTime, setNumTime] = useState(60);
  const [numRunning, setNumRunning] = useState(false);
  const [numFeedback, setNumFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [solverResult, setSolverResult] = useState<{ diff: number; value: number; expr: string } | null>(null);

  // --- 1 KELİME STATE ---
  const [letterPool, setLetterPool] = useState<string[]>(() => generateLetterPool());
  const [wordInput, setWordInput] = useState('');
  const [wordTime, setWordTime] = useState(60);
  const [wordRunning, setWordRunning] = useState(false);
  const [wordFeedback, setWordFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [showBestWords, setShowBestWords] = useState(false);

  // --- HIZLI ZİHİNDEN İŞLEM ---
  const [quickRunning, setQuickRunning] = useState(false);
  const [quickTime, setQuickTime] = useState(60);
  const [quickQ, setQuickQ] = useState<QuickMathQ>(() => nextQuickMathQ());
  const [quickAns, setQuickAns] = useState('');
  const [quickStreak, setQuickStreak] = useState(0);
  const [quickSolved, setQuickSolved] = useState(0);

  useEffect(() => {
    if (!numRunning || numTime <= 0) return;
    const t = setInterval(() => {
      setNumTime((prev) => {
        if (prev <= 1) {
          setNumRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [numRunning, numTime]);

  useEffect(() => {
    if (!wordRunning || wordTime <= 0) return;
    const t = setInterval(() => {
      setWordTime((prev) => {
        if (prev <= 1) {
          setWordRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [wordRunning, wordTime]);

  useEffect(() => {
    if (!quickRunning || quickTime <= 0) return;
    const t = setInterval(() => {
      setQuickTime((prev) => {
        if (prev <= 1) {
          setQuickRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [quickRunning, quickTime]);

  const bestWordsFromPool = useMemo(() => {
    return TURKISH_WORD_BANK.filter((w) => canFormWord(w, letterPool, true).ok)
      .sort((a, b) => b.length - a.length)
      .slice(0, 6);
  }, [letterPool]);

  const handleNewNumberRound = () => {
    setNumRound(generateNumberRound());
    setExprInput('');
    setNumTime(60);
    setNumRunning(true);
    setNumFeedback(null);
    setSolverResult(null);
  };

  const handleCheckNumberExpr = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = exprInput.trim().replace(/×/g, '*').replace(/÷/g, '/');
    if (!cleaned) return;
    if (!/^[0-9+\-*/()\s]+$/.test(cleaned)) {
      setNumFeedback({
        type: 'error',
        message: 'Yalnızca verilen sayılar ile +, -, *, /, ( ) işaretlerini kullanabilirsiniz.',
      });
      return;
    }

    // Verify each integer used exists in numRound.tiles (at most once per tile)
    const usedNums = (cleaned.match(/\d+/g) ?? []).map(Number);
    if (usedNums.length === 0) {
      setNumFeedback({ type: 'error', message: 'En az bir sayı taşı kullanmalısınız.' });
      return;
    }
    const available = [...numRound.tiles];
    for (const num of usedNums) {
      const idx = available.indexOf(num);
      if (idx === -1) {
        setNumFeedback({
          type: 'error',
          message: `${num} sayısı elinizdeki taşlarda bulunmuyor veya birden fazla kez kullanıldı.`,
        });
        return;
      }
      available.splice(idx, 1);
    }

    try {
      const result = Number(compile(cleaned).evaluate());
      if (!Number.isFinite(result) || !Number.isInteger(result)) {
        setNumFeedback({
          type: 'error',
          message: `Sonuç tam sayı olmalıdır (bulunan: ${Number.isFinite(result) ? result.toFixed(2) : 'tanımsız'}).`,
        });
        return;
      }
      const diff = Math.abs(result - numRound.target);
      let pts = 0;
      if (diff === 0) pts = 10;
      else if (diff <= 2) pts = 8;
      else if (diff <= 5) pts = 6;
      else if (diff <= 9) pts = 4;

      setNumRunning(false);
      if (pts > 0) {
        setTotalScore((s) => s + pts);
        setNumFeedback({
          type: 'success',
          message:
            diff === 0
              ? `TAM İSABET! ${result} = ${numRound.target}. +${pts} puan kazandınız!`
              : `Harika yaklaşım! Sonuç: ${result} (Hedefe fark: ${diff}). +${pts} puan kazandınız!`,
        });
      } else {
        setNumFeedback({
          type: 'info',
          message: `Hesaplanan değer: ${result} (Hedef: ${numRound.target}, fark: ${diff}). 9’dan az farkla puan kazanabilirsiniz!`,
        });
      }
    } catch {
      setNumFeedback({
        type: 'error',
        message: 'İfade söz dizimi hatalı. Parantezleri ve işlem işaretlerini kontrol edin.',
      });
    }
  };

  const handleSolveNumber = () => {
    const sol = solveNumberTarget(numRound.tiles, numRound.target);
    setSolverResult(sol);
    setNumRunning(false);
  };

  const handleNewWordRound = () => {
    setLetterPool(generateLetterPool());
    setWordInput('');
    setWordTime(60);
    setWordRunning(true);
    setWordFeedback(null);
    setShowBestWords(false);
  };

  const handleCheckWord = (e: React.FormEvent) => {
    e.preventDefault();
    const upper = wordInput.trim().toLocaleUpperCase('tr');
    if (upper.length < 3) {
      setWordFeedback({ type: 'error', message: 'En az 3 harfli bir Türkçe kelime yazın.' });
      return;
    }
    const check = canFormWord(upper, letterPool, true);
    if (!check.ok) {
      setWordFeedback({
        type: 'error',
        message: 'Bu kelime verilen 8 harf ve 1 Joker (?) ile oluşturulamıyor.',
      });
      return;
    }
    const inBank = TURKISH_WORD_BANK.includes(upper);
    const pts = upper.length >= 8 ? 12 : upper.length >= 6 ? 9 : upper.length >= 4 ? 6 : 4;
    setTotalScore((s) => s + pts);
    setWordRunning(false);
    setWordFeedback({
      type: 'success',
      message: inBank
        ? `Harika! “${upper}” (${upper.length} harf${check.jokerUsed ? ', Joker kullanıldı' : ''}) sözlükte doğrulandı. +${pts} puan!`
        : `“${upper}” (${upper.length} harf${check.jokerUsed ? ', Joker kullanıldı' : ''}) harf kurallarına uyuyor! +${pts} puan eklendi.`,
    });
  };

  const handleStartQuick = () => {
    setQuickTime(60);
    setQuickRunning(true);
    setQuickStreak(0);
    setQuickSolved(0);
    setQuickQ(nextQuickMathQ());
    setQuickAns('');
  };

  const handleCheckQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRunning) return;
    if (Number(quickAns.trim()) === quickQ.answer) {
      setQuickSolved((c) => c + 1);
      setQuickStreak((st) => st + 1);
      setTotalScore((s) => s + 2);
      setQuickQ(nextQuickMathQ());
      setQuickAns('');
    } else {
      setQuickStreak(0);
      setQuickAns('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Score & Game Selector Bar */}
      <div className="bg-navy-900 text-white rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 text-gold-400 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">1 Kelime 1 İşlem ve Zihinden Hızlı İşlem Arenası</h2>
            <p className="text-xs text-slate-300">
              Stratejik işlem kurma, Türkçe kelime türetme ve 60 saniyelik zihinden matematik yarışı
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 text-gold-400 font-mono text-sm font-semibold tabular-nums">
            <Trophy className="w-4 h-4" />
            <span>Oturum Puanı: {totalScore}</span>
          </div>
        </div>
      </div>

      {/* Sub-mode tabs */}
      <div className="control-grid gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {(
          [
            { id: 'islem', label: '1 İşlem (Hedef Sayı)' },
            { id: 'kelime', label: '1 Kelime (8 Harf + Joker)' },
            { id: 'hizli', label: 'Zihinden Hızlı İşlem (60 sn)' },
          ] as { id: GameSubTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap transition-colors ${
              subTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-navy-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* GAME 1: 1 İŞLEM */}
      {subTab === 'islem' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Hedef Sayıya Dört İşlemle Ulaş
              </p>
              <p className="mt-1 text-3xl sm:text-4xl font-bold font-mono tabular-nums text-navy-900 dark:text-gold-400">
                Hedef: {numRound.target}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-sm font-semibold tabular-nums text-navy-900 dark:text-white">
                <Clock className="w-4 h-4 text-teal-600" />
                {numTime} sn
              </span>
              <button
                type="button"
                onClick={handleNewNumberRound}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Yeni Tur</span>
              </button>
            </div>
          </div>

          {/* 6 Number Tiles */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Sayı Taşları (Her taşı en fazla 1 kez kullanın — tıklayarak ifadeye ekleyebilirsiniz):
            </p>
            <div className="flex flex-wrap gap-2.5">
              {numRound.tiles.map((tile, idx) => (
                <button
                  key={`${tile}-${idx}`}
                  type="button"
                  onClick={() => setExprInput((prev) => `${prev}${prev && /\d$/.test(prev) ? ' ' : ''}${tile}`)}
                  className={`w-16 h-14 rounded-xl font-mono text-xl font-bold tabular-nums border-2 transition-colors cursor-pointer ${
                    idx === 5
                      ? 'bg-gold-400/20 border-gold-500 text-navy-900 dark:text-gold-300'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-navy-900 dark:text-white hover:border-teal-600'
                  }`}
                >
                  {tile}
                </button>
              ))}
            </div>
          </div>

          {/* Operator buttons */}
          <div className="flex flex-wrap gap-2">
            {['+', '-', '*', '/', '(', ')'].map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setExprInput((prev) => `${prev} ${op} `)}
                className="w-10 h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm font-bold text-slate-800 dark:text-slate-200 hover:border-teal-600 cursor-pointer"
              >
                {op === '*' ? '×' : op === '/' ? '÷' : op}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setExprInput('')}
              className="px-3 h-9 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Temizle
            </button>
          </div>

          <form onSubmit={handleCheckNumberExpr} className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={exprInput}
              onChange={(e) => setExprInput(e.target.value)}
              placeholder="Örn. (75 + 6) * 4 - 9"
              className="flex-1 min-w-[220px] px-4 py-2.5 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-500 cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>İşlemi Kontrol Et</span>
            </button>
            <button
              type="button"
              onClick={handleSolveNumber}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
            >
              <HelpCircle className="w-4 h-4 text-gold-600" />
              <span>Çözümü Göster</span>
            </button>
          </form>

          {numFeedback && (
            <div
              className={`p-4 rounded-xl text-sm border ${
                numFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : numFeedback.type === 'error'
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              {numFeedback.message}
            </div>
          )}

          {solverResult && (
            <div className="p-4 rounded-xl bg-navy-900/5 dark:bg-slate-950 border border-gold-500/40 space-y-1">
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                Bilgisayarın Bulduğu {solverResult.diff === 0 ? 'Tam Çözüm' : `En Yakın Çözüm (Fark: ${solverResult.diff})`}
              </p>
              <p className="font-mono text-base font-semibold text-navy-900 dark:text-white">
                {solverResult.expr} = {solverResult.value}
              </p>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: 1 KELİME */}
      {subTab === 'kelime' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                8 Harf + 1 Joker (?) ile En Uzun Türkçe Kelimeyi Türet
              </p>
              <h3 className="mt-1 text-xl font-semibold text-navy-900 dark:text-white">
                1 Kelime Turu
              </h3>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-sm font-semibold tabular-nums text-navy-900 dark:text-white">
                <Clock className="w-4 h-4 text-teal-600" />
                {wordTime} sn
              </span>
              <button
                type="button"
                onClick={handleNewWordRound}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Yeni Harfler</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {letterPool.map((ch, idx) => (
              <button
                key={`${ch}-${idx}`}
                type="button"
                onClick={() => setWordInput((prev) => `${prev}${ch}`)}
                className={`w-13 h-14 rounded-xl font-bold text-xl border-2 cursor-pointer transition-colors ${
                  VOWELS.includes(ch)
                    ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-900 dark:text-teal-200'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-navy-900 dark:text-white hover:border-teal-600'
                }`}
              >
                {ch}
              </button>
            ))}
            <div className="w-16 h-14 rounded-xl font-bold text-sm border-2 border-dashed border-gold-500 bg-gold-400/15 text-navy-900 dark:text-gold-300 flex flex-col items-center justify-center">
              <span>?</span>
              <span className="text-[10px]">JOKER</span>
            </div>
          </div>

          <form onSubmit={handleCheckWord} className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              placeholder="Oluşturduğunuz Türkçe kelimeyi yazın..."
              className="flex-1 min-w-[220px] px-4 py-2.5 text-sm uppercase tracking-wider font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-500 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>Kelimeyi Gönder</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBestWords((v) => !v)}
              className="px-4 py-2.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
            >
              Örnek Kelimeleri Gör
            </button>
          </form>

          {wordFeedback && (
            <div
              className={`p-4 rounded-xl text-sm border ${
                wordFeedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
              }`}
            >
              {wordFeedback.message}
            </div>
          )}

          {showBestWords && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-navy-900 dark:text-gold-400">
                Bu Harflerle (ve 1 Jokerle) Oluşturulabilen Örnek Kelimeler
              </p>
              {bestWordsFromPool.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Yerleşik kelime havuzunda eşleşme bulunmadı; kendi bildiğiniz geçerli Türkçe kelimeleri girebilirsiniz.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {bestWordsFromPool.map((w) => (
                    <span
                      key={w}
                      className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold text-navy-900 dark:text-white"
                    >
                      {w} ({w.length})
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* GAME 3: ZİHİNDEN HIZLI İŞLEM */}
      {subTab === 'hizli' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Kareler · Karekökler · Yüzdeler · Tam Sayılar
              </p>
              <h3 className="mt-1 text-xl font-semibold text-navy-900 dark:text-white">
                60 Saniyelik Zihinden İşlem Maratonu
              </h3>
            </div>
            <div className="flex items-center gap-3 font-mono text-sm tabular-nums">
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-navy-900 dark:text-white">
                Süre: {quickTime} sn
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300">
                Doğru: {quickSolved} · Seri: {quickStreak}
              </span>
            </div>
          </div>

          {!quickRunning ? (
            <div className="py-10 text-center space-y-4">
              <Zap className="w-9 h-9 text-gold-500 mx-auto" />
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                {quickTime === 0
                  ? `Süre doldu! 60 saniyede ${quickSolved} soruyu doğru yanıtladınız.`
                  : 'Ortaokul ve LGS hızınızı artırmak için 60 saniyede mümkün olduğunca çok zihinden işlem çözün.'}
              </p>
              <button
                type="button"
                onClick={handleStartQuick}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-teal-600 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>{quickTime === 0 ? 'Tekrar Oyna' : 'Maratonu Başlat'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckQuick} className="max-w-md mx-auto py-6 text-center space-y-5">
              <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-navy-900 dark:text-white">
                {quickQ.prompt}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  autoFocus
                  value={quickAns}
                  onChange={(e) => setQuickAns(e.target.value)}
                  placeholder="Sonuç..."
                  className="flex-1 px-4 py-3 text-center text-lg font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-5 py-3 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-500 cursor-pointer"
                >
                  Gönder
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
