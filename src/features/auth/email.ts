/** A light check before asking the server to send a code; the server has the final say. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Digits only, at most six: tolerates pasted codes like "123 456". */
export function normaliseCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}
