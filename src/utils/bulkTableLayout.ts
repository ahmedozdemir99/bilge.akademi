type PdfTextItem = { str: string; width: number; height: number; transform: number[] };

export function extractTableRows(items: (PdfTextItem | { type: string })[], fromImage = false): string[][] {
  const pieces = items.flatMap((item) => {
    if (!('str' in item) || !item.str.trim()) return [];
    const value = item.str.trim();
    const widthPerCharacter = item.width / value.length;
    return [...value.matchAll(/\S(?:.*?\S)?(?=\s{2,}|$)/g)].map((part) => ({
      x: item.transform[4] + part.index * widthPerCharacter,
      y: item.transform[5],
      width: part[0].length * widthPerCharacter,
      height: item.height,
      value: part[0],
    }));
  }).sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { y: number; pieces: typeof pieces }[] = [];
  for (const piece of pieces) {
    const line = lines.at(-1);
    if (line && Math.abs(line.y - piece.y) <= (fromImage ? Math.max(3, piece.height * 0.35) : 2.5)) line.pieces.push(piece);
    else lines.push({ y: piece.y, pieces: [piece] });
  }
  const pageRows = lines.map(({ pieces: line }) => {
    const cells: { x: number; end: number; value: string }[] = [];
    for (const piece of line.sort((a, b) => a.x - b.x)) {
      const previous = cells.at(-1);
      const end = piece.x + piece.width;
      if (previous && piece.x - previous.end < Math.max(2.5, piece.height * (fromImage ? 0.72 : 0.37))) {
        previous.value += ' ' + piece.value;
        previous.end = Math.max(previous.end, end);
      } else {
        cells.push({ x: piece.x, end, value: piece.value });
      }
    }
    return cells;
  });
  const frequencies = new Map<number, number>();
  for (const row of pageRows) {
    if (row.length >= 2 && row.some(({ value }) => /^\d+$/.test(value))) {
      frequencies.set(row.length, (frequencies.get(row.length) ?? 0) + 1);
    }
  }
  const commonWidth = [...frequencies.entries()].sort(([a, n], [b, m]) => m - n || b - a)[0]?.[0];
  const reference = pageRows.find((row) => row.length === commonWidth);
  const result: string[][] = [];
  for (const row of pageRows) {
    if (!reference || row.length >= reference.length || row.length < 2) {
      result.push(row.map(({ value }) => value));
      continue;
    }
    // Empty published score cells have no text object. Align the remaining cells by position.
    const aligned = Array<string>(reference.length).fill('');
    for (const cell of row) {
      let column = 0;
      let distance = Infinity;
      for (const [index, anchor] of reference.entries()) {
        const delta = Math.min(Math.abs(cell.x - anchor.x), Math.abs(cell.end - anchor.end));
        if (delta < distance) { distance = delta; column = index; }
      }
      aligned[column] += (aligned[column] ? ' ' : '') + cell.value;
    }
    result.push(aligned);
  }
  return result;
}
