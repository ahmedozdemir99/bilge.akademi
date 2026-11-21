import { normalizeSearchText } from './searchText';

export const trialSubjectColors = {
  turkce: { color: '#db2777', light: '#f472b6' },
  matematik: { color: '#7c3aed', light: '#a78bfa' },
  fen: { color: '#047857', light: '#34d399' },
  inkilap: { color: '#c2410c', light: '#fb923c' },
  din: { color: '#0369a1', light: '#38bdf8' },
  ingilizce: { color: '#4f46e5', light: '#818cf8' },
};

const socialStudiesColor = '#a16207';
const otherSubjectColors = ['#0f766e', '#be123c', '#a21caf', '#4d7c0f', '#475569'];

export const classChartColors = [
  ...Object.values(trialSubjectColors).map(({ color }) => color),
  socialStudiesColor,
  ...otherSubjectColors,
];

const subjectColors = new Map([
  ['turkce', trialSubjectColors.turkce.color],
  ['matematik', trialSubjectColors.matematik.color],
  ['mat', trialSubjectColors.matematik.color],
  ['fen', trialSubjectColors.fen.color],
  ['fen bilimleri', trialSubjectColors.fen.color],
  ['inkilap', trialSubjectColors.inkilap.color],
  ['inkilap tarihi / sosyal', trialSubjectColors.inkilap.color],
  ['t.c. inkilap tarihi ve ataturkculuk', trialSubjectColors.inkilap.color],
  ['sosyal bilgiler', socialStudiesColor],
  ['din k.', trialSubjectColors.din.color],
  ['din kulturu', trialSubjectColors.din.color],
  ['din kulturu ve ahlak bilgisi', trialSubjectColors.din.color],
  ['ing', trialSubjectColors.ingilizce.color],
  ['ingilizce', trialSubjectColors.ingilizce.color],
]);

export function getSubjectColor(subject: string): string {
  const name = normalizeSearchText(subject);
  const color = subjectColors.get(name);
  if (color) return color;

  // Keep subjects from existing records consistent when charts are filtered or reordered.
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return otherSubjectColors[hash % otherSubjectColors.length];
}
