export function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase('tr').normalize('NFD').replace(/\p{M}/gu, '').replace(/ı/g, 'i');
}
