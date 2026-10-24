import { cardScore, normalizeShareCardId, shareLinkMessage } from './copy';
import { groupCard, pairCard } from './fixtures';

describe('cardScore', () => {
  it('puts the minutes on the tab of whoever owes them', () => {
    expect(cardScore(pairCard)).toEqual({ label: 'Brother’s tab', minutes: 18 });
    expect(cardScore({ ...pairCard, balance: { direction: 'YOU_OWE_THEM', minutes: 7 } })).toEqual({
      label: 'Borna’s tab',
      minutes: 7,
    });
  });

  it('puts a group’s worst offender on the card', () => {
    expect(cardScore(groupCard)).toEqual({ label: 'Ana’s tab', minutes: 20 });
  });

  it('has no card when everyone is square', () => {
    expect(cardScore({ ...pairCard, balance: { direction: 'ALL_SQUARE', minutes: 0 } })).toBeNull();
    expect(cardScore({ ...groupCard, rows: [] })).toBeNull();
  });
});

describe('shareLinkMessage', () => {
  it('is the headline with the link, so chats show the card preview', () => {
    expect(shareLinkMessage(pairCard)).toBe(`Brother owes me 18 minutes. ${pairCard.url}`);
  });
});

describe('normalizeShareCardId', () => {
  it('accepts a card id from a link in any case', () => {
    expect(normalizeShareCardId(pairCard.id.toUpperCase())).toBe(pairCard.id);
  });

  it('rejects anything else, so it never reaches the API path', () => {
    expect(normalizeShareCardId('../ledgers')).toBeNull();
    expect(normalizeShareCardId('')).toBeNull();
  });
});
