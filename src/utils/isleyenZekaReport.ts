import { calculateNet, LGS_SUBJECT_CONFIG } from './exportUtils';
import { normalizeSearchText } from './searchText';

type TextItem = { str: string; width: number; height: number; transform: number[] };
export type ReportItem = TextItem | { type: string };

export interface PublishedTrialResult {
  number: string;
  name: string;
  section: string;
  scores: string[];
  totalNet: number;
  score: number;
}

export function isSchoolNetList(items: ReportItem[]) {
  return /^okul net listesi\b/.test(normalizeSearchText(items.filter((item): item is TextItem => 'str' in item).slice(0, 12).map(({ str }) => str).join(' ')));
}

const numberValue = (value: string) => /^-?\d+(?:[,.]\d+)?$/.test(value) ? Number(value.replace(',', '.')) : NaN;
const printedOrder = [0, 3, 4, 5, 1, 2];

export function readIsleyenZekaPage(items: ReportItem[]) {
  const tokens = items.flatMap((item) => {
    if (!('str' in item) || !item.str.trim()) return [];
    const value = item.str.trim();
    const section = /(?<!\d)(\d{1,2}[-–][A-ZÇĞİÖŞÜ]{1,3})(?= |$)/i.exec(value);
    const segments = section
      ? [
        { 0: value.slice(0, section.index).trim(), index: 0 },
        { 0: section[1], index: section.index + section[0].length - section[1].length },
        ...[...value.matchAll(/\S+/g)].filter((part) => part.index >= section.index + section[0].length),
      ].filter((part) => part[0])
      : /^-?\d+(?:[,.]\d+)?(?: +[-\d][\d,.]*)+$/.test(value) ? [...value.matchAll(/\S+/g)] : [{ 0: value, index: 0 }];
    const splitIdentity = segments.flatMap((segment) => {
      const combined = /^(\d{1,12})\s+(\p{L}.*)$/u.exec(segment[0]);
      if (!combined) return [segment];
      return [{ 0: combined[1], index: segment.index }, { 0: combined[2], index: segment.index + segment[0].lastIndexOf(combined[2]) }];
    });
    const cellWidth = item.width / value.length;
    return splitIdentity.map((segment) => ({
      text: segment[0], x: item.transform[4] + segment.index * cellWidth,
      center: item.transform[4] + (segment.index + segment[0].length / 2) * cellWidth, y: item.transform[5],
    }));
  }).sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { y: number; tokens: typeof tokens }[] = [];
  for (const token of tokens) {
    const last = lines.at(-1);
    if (last && Math.abs(last.y - token.y) <= 1.4) last.tokens.push(token);
    else lines.push({ y: token.y, tokens: [token] });
  }
  const heading = normalizeSearchText(tokens.filter((t) => t.y > (tokens[0]?.y ?? 0) - 100).map(({ text }) => text).join(' '));
  if (!/\b(?:okul|sinifi) net listesi\b/.test(heading)) return null;
  const header = lines.find(({ tokens }) => {
    const marks = tokens.map(({ text }) => text).filter((text) => /^[DYN]$/.test(text));
    return marks.join('') === 'DYN'.repeat(7) && tokens.some(({ text }) => normalizeSearchText(text) === 'puani');
  });
  if (!header) return null;

  const subjectLabels = ['turkce', 'tarih', 'din k.ve a.b.', 'ingilizce', 'matematik', 'fen'];
  const labels = tokens.filter((token) => token.y > header.y && token.y <= header.y + 18)
    .sort((a, b) => a.x - b.x).map(({ text }) => normalizeSearchText(text))
    .filter((label) => subjectLabels.includes(label));
  if (labels.join('|') !== subjectLabels.join('|')) return null;
  const marks = header.tokens.filter(({ text }) => /^[DYN]$/.test(text));
  const start = marks[0].center;
  const tripletWidth = marks[3].center - start;
  const scoreCenter = header.tokens.find(({ text }) => normalizeSearchText(text) === 'puani')!.center;
  const centers = [...marks.map(({ center }) => center), scoreCenter];
  const startOfNumbers = start - tripletWidth * 0.18;
  const startOfName = start - tripletWidth * 2.01;
  const startOfSchoolNumber = start - tripletWidth * 2.48;
  const results: PublishedTrialResult[] = [];
  let invalid = 0;

  for (const line of lines) {
    if (line.y >= header.y) continue;
    const row = [...line.tokens].sort((a, b) => a.x - b.x);
    const klass = row.find(({ text, center }) => center > start - tripletWidth * 0.92 && center < startOfNumbers && /^\d{1,2}\s*[-–]\s*[A-ZÇĞİÖŞÜ]{1,3}$/i.test(text));
    const candidates = row.filter(({ center, text }) => center >= startOfSchoolNumber && center < startOfName && /^\d{1,12}$/.test(text));
    if (!klass || candidates.length !== 1) continue;
    const number = candidates[0].text;
    const name = row.filter(({ x, text }) => x >= startOfName && x < klass.x && /\p{L}/u.test(text)).map(({ text }) => text).join(' ');
    const values = Array<string>(centers.length).fill('');
    for (const token of row) {
      if (token.center < startOfNumbers || token.center > scoreCenter + tripletWidth * 0.33 || !Number.isFinite(numberValue(token.text))) continue;
      const index = centers.findIndex((center, col) => col === centers.length - 1 || token.center < (center + centers[col + 1]) / 2);
      values[index] = values[index] ? 'invalid' : token.text;
    }
    let valid = true;
    const scores = Array<string>(12);
    for (let printed = 0; printed < 6; printed += 1) {
      const subject = printedOrder[printed];
      const cells = values.slice(printed * 3, printed * 3 + 3);
      const [d, y, net] = cells.every((value) => !value) ? [0, 0, 0] : cells.map(numberValue);
      if (!Number.isInteger(d) || !Number.isInteger(y) || d < 0 || y < 0 || d + y > LGS_SUBJECT_CONFIG[subject].maxQuestions ||
        !Number.isFinite(net) || Math.abs(net - calculateNet(d, y)) > 0.011) valid = false;
      scores[subject * 2] = String(d);
      scores[subject * 2 + 1] = String(y);
    }
    const [correct, wrong, totalNet, score] = values.slice(18).map(numberValue);
    const sum = (offset: number) => scores.filter((_, index) => index % 2 === offset).reduce((total, value) => total + Number(value), 0);
    if (!valid || correct !== sum(0) || wrong !== sum(1) || !(score >= 100 && score <= 500) || !(totalNet >= -30 && totalNet <= 90) ||
      Math.abs(totalNet - (correct - wrong / 3)) > 0.04) {
      invalid += 1;
      continue;
    }
    results.push({ number, name, section: klass.text, scores, totalNet, score });
  }
  return { results, invalid };
}
