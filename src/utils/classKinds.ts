import type { SchoolClass } from '../types/academy';

export type ClassKind = 'school' | 'course';

export const CLASS_KINDS = [
  { value: 'school', label: 'Okul Sınıfları' },
  { value: 'course', label: 'Kurs Sınıfları' },
] as const;

// The existing optional Firestore field keeps class settings compatible with deployed rules.
const coursePrefix = '[Kurs]';

export function classKind(item: Pick<SchoolClass, 'subjectFocus'>): ClassKind {
  return item.subjectFocus?.startsWith(coursePrefix) ? 'course' : 'school';
}

export function classSubjectFocus(item: Pick<SchoolClass, 'subjectFocus'>): string {
  const focus = item.subjectFocus ?? '';
  return classKind(item) === 'course' ? focus.slice(coursePrefix.length).trimStart() : focus;
}

export function encodeClassFocus(kind: ClassKind, focus = ''): string {
  const prefix = kind === 'course' ? coursePrefix : '';
  return [prefix, focus.trim()].filter(Boolean).join(' ').slice(0, 80);
}
