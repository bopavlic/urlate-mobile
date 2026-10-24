import { cardTicket, normalizeShareCardId, shareLinkMessage } from './copy';
import { groupCard, pairCard } from './fixtures';

describe('cardTicket', () => {
  it('issues the ticket to whoever owes the minutes', () => {
    expect(cardTicket(pairCard)).toEqual({ offender: 'Brother', waiter: 'Borna', minutes: 18 });
    expect(cardTicket({ ...pairCard, balance: { direction: 'YOU_OWE_THEM', minutes: 7 } })).toEqual(
      { offender: 'Borna', waiter: 'Brother', minutes: 7 },
    );
  });

  it('issues a group’s ticket to its worst offender', () => {
    expect(cardTicket(groupCard)).toEqual({ offender: 'Ana', waiter: 'Friday lunch', minutes: 20 });
  });

  it('has no ticket when everyone is square', () => {
    expect(
      cardTicket({ ...pairCard, balance: { direction: 'ALL_SQUARE', minutes: 0 } }),
    ).toBeNull();
    expect(cardTicket({ ...groupCard, rows: [] })).toBeNull();
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
