import createQrCode from 'qrcode-generator';

/** Dark/light modules of a QR code, row by row. Pure JS, so no native module is needed. */
export function qrMatrix(text: string): boolean[][] {
  // Type 0 picks the smallest version that fits; M survives a scratched or dim screen.
  const qr = createQrCode(0, 'M');
  qr.addData(text);
  qr.make();
  const size = qr.getModuleCount();
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => qr.isDark(row, col)),
  );
}

/** Consecutive dark modules in a row, so each row renders as a handful of bars. */
export function darkRuns(row: readonly boolean[]): { start: number; length: number }[] {
  const runs: { start: number; length: number }[] = [];
  let start = -1;
  row.forEach((dark, index) => {
    if (dark && start === -1) start = index;
    if (!dark && start !== -1) {
      runs.push({ start, length: index - start });
      start = -1;
    }
  });
  if (start !== -1) runs.push({ start, length: row.length - start });
  return runs;
}
