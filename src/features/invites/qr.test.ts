import { darkRuns, qrMatrix } from './qr';

describe('qrMatrix', () => {
  it('encodes a link as a square grid with the three finder squares', () => {
    const matrix = qrMatrix('https://urlate.app/i/ABCDEFGH');
    const size = matrix.length;
    expect(size).toBeGreaterThanOrEqual(21);
    expect(matrix.every((row) => row.length === size)).toBe(true);
    // Finder pattern corners: top-left, top-right, bottom-left are dark.
    expect(matrix[0]![0]).toBe(true);
    expect(matrix[0]![size - 1]).toBe(true);
    expect(matrix[size - 1]![0]).toBe(true);
    // The finder's inner white ring.
    expect(matrix[1]![1]).toBe(false);
  });
});

describe('darkRuns', () => {
  it('merges neighbouring dark modules so a row draws as few bars as possible', () => {
    expect(darkRuns([true, true, false, true, false, false, true, true, true])).toEqual([
      { start: 0, length: 2 },
      { start: 3, length: 1 },
      { start: 6, length: 3 },
    ]);
    expect(darkRuns([false, false])).toEqual([]);
  });
});
