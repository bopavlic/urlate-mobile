import { brother, me } from './fixtures';
import { settleOptions, settlementRequestId } from './settle';

const detail = (
  direction: 'THEY_OWE_YOU' | 'YOU_OWE_THEM' | 'ALL_SQUARE',
  minutes: number,
  kind: 'PAIR' | 'GROUP' = 'PAIR',
) => ({
  kind,
  members: [me, brother],
  myBalance: { direction, minutes },
});

describe('settleOptions', () => {
  it('lets the owed person forgive or reset', () => {
    expect(settleOptions(detail('THEY_OWE_YOU', 18))).toEqual({
      canSettle: true,
      owedMinutes: 18,
      counterpartId: brother.id,
    });
  });

  it('does not let the person who owes settle', () => {
    expect(settleOptions(detail('YOU_OWE_THEM', 3)).canSettle).toBe(false);
    expect(settleOptions(detail('ALL_SQUARE', 0)).canSettle).toBe(false);
  });

  it('leaves group settling for later', () => {
    expect(settleOptions(detail('THEY_OWE_YOU', 5, 'GROUP')).canSettle).toBe(false);
  });
});

describe('settlementRequestId', () => {
  let n = 0;
  const makeId = () => `id-${++n}`;

  it('reuses the id when the same request is retried', () => {
    const first = settlementRequestId(null, { kind: 'FORGIVE', minutes: 5 }, makeId);
    const retry = settlementRequestId(first, { kind: 'FORGIVE', minutes: 5 }, makeId);
    expect(retry.id).toBe(first.id);
  });

  it('uses a new id for a different request, so an old one is never replayed', () => {
    const forgive5 = settlementRequestId(null, { kind: 'FORGIVE', minutes: 5 }, makeId);
    expect(settlementRequestId(forgive5, { kind: 'FORGIVE', minutes: 3 }, makeId).id).not.toBe(
      forgive5.id,
    );
    expect(settlementRequestId(forgive5, { kind: 'RESET' }, makeId).id).not.toBe(forgive5.id);
  });
});
