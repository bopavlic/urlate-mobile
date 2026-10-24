import type { ShareCardCardColor, ShareCardStyle } from '@/api/generated/model';
import { palette } from '@/theme/tokens';

// Share-card looks. The classic one is free; the rest come with Premium or a day's ad reward.
// Same colours as the website's /s page (urlate-frontend/src/share/look.ts).

export interface Look {
  style: ShareCardStyle;
  cardColor: ShareCardCardColor;
}

export const FREE_LOOK: Look = { style: 'PITCH', cardColor: 'YELLOW' };

export const STYLES = {
  PITCH: {
    label: 'Night pitch',
    background: palette.dark.paper,
    text: palette.dark.ink,
    muted: palette.dark.muted,
    line: palette.dark.line,
  },
  DAYLIGHT: {
    label: 'Day pitch',
    background: '#1F7A43',
    text: '#FFFFFF',
    muted: '#CFE8D8',
    line: '#3F9462',
  },
  CHALK: {
    label: 'Chalk',
    background: '#F2F5F2',
    text: palette.light.ink,
    muted: palette.light.muted,
    line: palette.light.line,
  },
} satisfies Record<
  ShareCardStyle,
  { label: string; background: string; text: string; muted: string; line: string }
>;

export const CARD_COLORS = {
  YELLOW: { label: 'Yellow', card: palette.dark.accent, onCard: palette.dark.onAccent },
  RED: { label: 'Red', card: '#E5322D', onCard: '#FFFFFF' },
  ORANGE: { label: 'Orange', card: '#FF8A1F', onCard: '#0B1F16' },
  PINK: { label: 'Pink', card: '#FF7AB8', onCard: '#0B1F16' },
  BLUE: { label: 'Blue', card: '#2F7BFF', onCard: '#FFFFFF' },
  WHITE: { label: 'White', card: '#FFFFFF', onCard: '#0B1F16' },
} satisfies Record<ShareCardCardColor, { label: string; card: string; onCard: string }>;

export function cardLook(look: Look) {
  const { background, text, muted, line } = STYLES[look.style];
  const { card, onCard } = CARD_COLORS[look.cardColor];
  return { background, text, muted, line, card, onCard };
}

export function isFreeLook(look: Look): boolean {
  return look.style === FREE_LOOK.style && look.cardColor === FREE_LOOK.cardColor;
}
