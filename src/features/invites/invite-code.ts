// Mirrors urlate-backend/src/domain/invite.ts: Crockford base32, so people can type codes
// with dashes, spaces, lowercase, or an O for a 0. The API normalises too; this only
// decides when the code is complete enough to look up.

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const LENGTH = 8;
const LOOK_ALIKES: Record<string, string> = { O: '0', I: '1', L: '1' };

export function normalizeInviteCode(input: string): string | null {
  const code = input
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/[OIL]/g, (char) => LOOK_ALIKES[char]!);
  if (code.length !== LENGTH) return null;
  for (const char of code) if (!ALPHABET.includes(char)) return null;
  return code;
}

/** ABCD-EFGH: easier to read out loud or copy from someone's screen. */
export function formatInviteCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}
