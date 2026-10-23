import { brother, me } from './fixtures';
import { settleOptions } from './settle';

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
