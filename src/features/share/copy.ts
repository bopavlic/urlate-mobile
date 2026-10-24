import type { ShareCard } from '@/api/generated/model';

// Same rules as the website's /s page (urlate-frontend/src/share/copy.ts).

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** The card id from a urlate.app/s/{id} link, or null: anything else never reaches the API path. */
export function normalizeShareCardId(input: string): string | null {
  const id = input.trim().toLowerCase();
  return UUID.test(id) ? id : null;
}

/** The yellow card: whoever owes the time, and how much. Null when everyone is square. */
export function cardScore(card: ShareCard): { label: string; minutes: number } | null {
  if (card.kind === 'GROUP') {
    const worst = card.rows[0];
    return worst ? { label: `${worst.name}’s tab`, minutes: worst.minutes } : null;
  }
  switch (card.balance?.direction) {
    case 'THEY_OWE_YOU':
      return { label: `${card.otherName}’s tab`, minutes: card.balance.minutes };
    case 'YOU_OWE_THEM':
      return { label: `${card.sharedByName}’s tab`, minutes: card.balance.minutes };
    default:
      return null;
  }
}

/** For chats: the link unfurls into the card (the website's OG image). */
export function shareLinkMessage(card: Pick<ShareCard, 'headline' | 'url'>): string {
  return `${card.headline} ${card.url}`;
}
