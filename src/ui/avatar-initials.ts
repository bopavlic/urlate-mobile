/** Up to two initials for people without a photo; "?" when there's no name at all. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return words
    .slice(0, 2)
    .map((word) => word[0]!.toLocaleUpperCase())
    .join('');
}
