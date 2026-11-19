export interface LineMetric {
  lineNumber: number;
  text: string;
  syllables: number;
  lastWord: string;
  rhymeLetter: string;
}

export interface AlgorithmicPoemReport {
  lines: LineMetric[];
  lineCount: number;
  stanzaCount: number;
  dominantSyllableCount: number | null;
  meterLabel: string;
  meterConsistencyPercent: number;
  rhymeScheme: string;
  rhymePatternName: string;
  detectedSoundGroups: { letter: string; words: string[]; sharedSuffix: string; likelyType: string }[];
  warnings: string[];
}

const TURKISH_VOWELS = /[aeıioöuüâîûAEIİOÖUÜÂÎÛ]/g;

export function countTurkishSyllables(line: string): number {
  const matches = line.match(TURKISH_VOWELS);
  return matches ? matches.length : 0;
}

function normalizeTurkishWord(word: string): string {
  return word
    .toLocaleLowerCase('tr')
    .replace(/[^a-zçğıöşüâîû]/g, '')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u');
}

function getLastWord(line: string): string {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    const cleaned = normalizeTurkishWord(tokens[i]);
    if (cleaned.length > 0) return cleaned;
  }
  return '';
}

function commonSuffix(a: string, b: string): string {
  let i = a.length - 1;
  let j = b.length - 1;
  let res = '';
  while (i >= 0 && j >= 0 && a[i] === b[j]) {
    res = a[i] + res;
    i -= 1;
    j -= 1;
  }
  return res;
}

function classifyRhymeOverlap(suffix: string, sameWholeWord: boolean): string {
  if (sameWholeWord) return 'Redif veya cinas olasılığı (aynı sözcük tekrarı)';
  if (suffix.length >= 3) return 'Zengin kafiye veya ek kaynaklı redif olasılığı';
  if (suffix.length === 2) return 'Tam kafiye olasılığı (2 ortak ses)';
  if (suffix.length === 1) return 'Yarım kafiye olasılığı (1 ortak ses)';
  return 'Belirsiz ses benzerliği';
}

export function analyzePoemAlgorithmically(content: string): AlgorithmicPoemReport {
  const rawLines = content.split(/\r?\n/);
  const nonEmptyLines = rawLines.map((l) => l.trim()).filter((l) => l.length > 0);
  const stanzaCount = content
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .filter((block) => block.trim().length > 0).length;

  if (nonEmptyLines.length === 0) {
    return {
      lines: [],
      lineCount: 0,
      stanzaCount: 0,
      dominantSyllableCount: null,
      meterLabel: 'Metin girilmedi',
      meterConsistencyPercent: 0,
      rhymeScheme: '—',
      rhymePatternName: '—',
      detectedSoundGroups: [],
      warnings: ['Analiz için en az bir dize yazın.'],
    };
  }

  // Syllable statistics
  const syllableCounts = nonEmptyLines.map(countTurkishSyllables);
  const freq = new Map<number, number>();
  for (const c of syllableCounts) {
    if (c > 0) freq.set(c, (freq.get(c) ?? 0) + 1);
  }
  let dominantSyllableCount: number | null = null;
  let maxFreq = 0;
  for (const [count, f] of freq.entries()) {
    if (f > maxFreq) {
      maxFreq = f;
      dominantSyllableCount = count;
    }
  }
  const meterConsistencyPercent =
    dominantSyllableCount && nonEmptyLines.length > 0
      ? Math.round((maxFreq / nonEmptyLines.length) * 100)
      : 0;

  let meterLabel = 'Serbest Ölçü';
  if (dominantSyllableCount && meterConsistencyPercent >= 75) {
    meterLabel = `${dominantSyllableCount}’li Hece Ölçüsü`;
  } else if (dominantSyllableCount && meterConsistencyPercent >= 50) {
    meterLabel = `Yaklaşık ${dominantSyllableCount}’li Hece (Değişken)`;
  }

  // Rhyme grouping by normalized ending similarity (min 2-char suffix or matching final vowel+consonant)
  const lastWords = nonEmptyLines.map(getLastWord);
  const groupDefs: { letter: string; representative: string; words: string[]; suffix: string }[] = [];
  const letters = 'abcdefghijklmno';
  const assignedLetters: string[] = [];

  for (const word of lastWords) {
    if (!word) {
      assignedLetters.push('-');
      continue;
    }
    let matchedGroup: (typeof groupDefs)[number] | null = null;
    let bestOverlap = '';

    for (const grp of groupDefs) {
      const ov = commonSuffix(word, grp.representative);
      if (ov.length >= 2 && ov.length > bestOverlap.length) {
        bestOverlap = ov;
        matchedGroup = grp;
      }
    }

    if (matchedGroup) {
      matchedGroup.words.push(word);
      matchedGroup.suffix = commonSuffix(matchedGroup.suffix, word) || bestOverlap;
      assignedLetters.push(matchedGroup.letter);
    } else {
      const nextLetter = letters[groupDefs.length % letters.length] || 'x';
      groupDefs.push({
        letter: nextLetter,
        representative: word,
        words: [word],
        suffix: word,
      });
      assignedLetters.push(nextLetter);
    }
  }

  const lines: LineMetric[] = nonEmptyLines.map((text, idx) => ({
    lineNumber: idx + 1,
    text,
    syllables: syllableCounts[idx],
    lastWord: lastWords[idx],
    rhymeLetter: assignedLetters[idx],
  }));

  const rhymeScheme = assignedLetters.join('');
  const firstFour = rhymeScheme.slice(0, 4);
  let rhymePatternName = 'Karma / Serbest Kafiye';
  if (firstFour === 'aabb' || rhymeScheme === 'aa') rhymePatternName = 'Düz Kafiye (aabb)';
  else if (firstFour === 'abab') rhymePatternName = 'Çapraz Kafiye (abab)';
  else if (firstFour === 'abba') rhymePatternName = 'Sarmal Kafiye (abba)';
  else if (firstFour === 'aaba' || firstFour === 'aaab') rhymePatternName = 'Mâni / Koşma Tipi';
  else if (firstFour === 'aaaa') rhymePatternName = 'Tek Kafiye (aaaa)';

  const detectedSoundGroups = groupDefs
    .filter((g) => g.words.length >= 2)
    .map((g) => {
      const allSameWord = g.words.every((w) => w === g.words[0]);
      return {
        letter: g.letter,
        words: g.words,
        sharedSuffix: `-${g.suffix}`,
        likelyType: classifyRhymeOverlap(g.suffix, allSameWord),
      };
    });

  const warnings: string[] = [];
  if (meterConsistencyPercent < 100 && dominantSyllableCount !== null && nonEmptyLines.length > 1) {
    warnings.push(
      `Dizeler arasında hece sayısı farkı saptandı (tutarlılık %${meterConsistencyPercent}). Aruz veya serbest ölçü kullanıyorsanız bu durum doğaldır.`
    );
  }
  if (detectedSoundGroups.length === 0 && nonEmptyLines.length >= 2) {
    warnings.push(
      'Dize sonlarında en az 2 seslik belirgin ortak ek/kök saptanmadı; yarım kafiye veya serbest nazım olabilir.'
    );
  }
  warnings.push(
    'Algoritmik kafiye/redif tespiti kök-ek ayrımında (ör. eş görevli ekler ile kökteki ses benzerliği) belirsizlik içerebilir; kesin ayrım için Yapay Zekâ Şiir Analizi ile birlikte değerlendirin.'
  );

  return {
    lines,
    lineCount: nonEmptyLines.length,
    stanzaCount: Math.max(1, stanzaCount),
    dominantSyllableCount,
    meterLabel,
    meterConsistencyPercent,
    rhymeScheme,
    rhymePatternName,
    detectedSoundGroups,
    warnings,
  };
}
