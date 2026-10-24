import type { ShareCardCardColor, ShareCardStyle } from '@/api/generated/model';
import type { TicketColors } from '@/ui/Ticket';

// Share-card looks: a background and the ticket's colour. The classic one is free; the rest
// come with Premium or a day's ad reward. Same colours as the website's /s page
// (urlate-frontend/src/share/look.ts). The API names (PITCH, DAYLIGHT, CHALK) are older than
// the looks: Night, Day and Paper.

export interface Look {
  style: ShareCardStyle;
  cardColor: ShareCardCardColor;
}

export const FREE_LOOK: Look = { style: 'CHALK', cardColor: 'RED' };

const TICKET_INK = '#16182B';

// Paper first: the free background leads the picker.
export const STYLES = {
  CHALK: {
    label: 'Paper',
    background: '#EEF0F4',
    text: '#16182B',
    muted: '#5C6070',
    line: '#DDE0E8',
  },
  DAYLIGHT: {
    label: 'Day',
    background: '#DDE9FF',
    text: '#111A3A',
    muted: '#56607F',
    line: '#C9D8F5',
  },
  PITCH: {
    label: 'Night',
    background: '#111318',
    text: '#F1F2F5',
    muted: '#9A9EAD',
    line: '#2A2E39',
  },
} satisfies Record<
  ShareCardStyle,
  { label: string; background: string; text: string; muted: string; line: string }
>;

// Red first: the free colour leads the picker.
export const CARD_COLORS = {
  RED: { label: 'Red', card: '#E8432A', onCard: '#FFFFFF' },
  PINK: { label: 'Pink', card: '#FF3D6E', onCard: '#FFFFFF' },
  BLUE: { label: 'Blue', card: '#2B5FEA', onCard: '#FFFFFF' },
  ORANGE: { label: 'Orange', card: '#FF8A1F', onCard: '#2A1A0E' },
  YELLOW: { label: 'Yellow', card: '#FFC81A', onCard: TICKET_INK },
  WHITE: { label: 'White', card: '#E6E8EE', onCard: TICKET_INK },
} satisfies Record<ShareCardCardColor, { label: string; card: string; onCard: string }>;

export function cardLook(look: Look) {
  const { background, text, muted, line } = STYLES[look.style];
  const { card, onCard } = CARD_COLORS[look.cardColor];
  return { background, text, muted, line, card, onCard };
}

/** The ticket on the card: white paper, its band in the card colour, notches in the background. */
export function ticketColors(look: Look): TicketColors {
  const { background, card, onCard } = cardLook(look);
  return {
    paper: '#FFFFFF',
    ink: TICKET_INK,
    muted: '#5C6070',
    line: '#DDE0E8',
    accent: card,
    onAccent: onCard,
    page: background,
  };
}

export function isFreeLook(look: Look): boolean {
  return look.style === FREE_LOOK.style && look.cardColor === FREE_LOOK.cardColor;
}
