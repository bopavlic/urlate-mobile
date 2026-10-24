import type { PairBalance } from '@/api/generated/model';

import { brother, me } from './fixtures';
import { myScores, settleOptions, settlementRequestId } from './settle';

const ana = { ...brother, id: 'm-ana', displayName: 'Ana' };
const owes = (debtor: string, creditor: string, minutes: number): PairBalance => ({
  creditorMemberId: creditor,
  debtorMemberId: debtor,
  minutes,
});
const pair = (balances: PairBalance[]) => ({
  kind: 'PAIR' as const,
  members: [me, brother],
  balances,
});
const group = (balances: PairBalance[]) => ({
  kind: 'GROUP' as const,
  members: [me, brother, ana],
  balances,
});

describe('settleOptions', () => {
  it('lets the owed person forgive or reset', () => {
    expect(settleOptions(pair([owes(brother.id, me.id, 18)]))).toEqual({
      canSettle: true,
      owedMinutes: 18,
      counterpartId: brother.id,
    });
  });

  it('does not let the person who owes settle', () => {
    expect(settleOptions(pair([owes(me.id, brother.id, 3)])).canSettle).toBe(false);
    expect(settleOptions(pair([])).canSettle).toBe(false);
  });

  it('settles one person at a time in a group', () => {
    const detail = group([owes(ana.id, me.id, 10), owes(brother.id, ana.id, 4)]);
    expect(settleOptions(detail, ana.id)).toEqual({
      canSettle: true,
      owedMinutes: 10,
      counterpartId: ana.id,
    });
    expect(settleOptions(detail, brother.id).canSettle).toBe(false);
    expect(settleOptions(detail).canSettle).toBe(false);
  });
});

describe('myScores', () => {
  it('lists my score with each person in the group, people who owe me first', () => {
    const detail = group([
      owes(me.id, brother.id, 3),
      owes(ana.id, me.id, 10),
      owes(brother.id, ana.id, 4),
    ]);
    expect(myScores(detail)).toEqual([
      { member: ana, view: { direction: 'THEY_OWE_YOU', minutes: 10 } },
      { member: brother, view: { direction: 'YOU_OWE_THEM', minutes: 3 } },
    ]);
  });

  it('is empty when I am square with everyone', () => {
    expect(myScores(group([owes(brother.id, ana.id, 4)]))).toEqual([]);
  });
});

const forgive = (minutes: number, counterpartMemberId = brother.id) => ({
  kind: 'FORGIVE' as const,
  minutes,
  counterpartMemberId,
});

describe('settlementRequestId', () => {
  let n = 0;
  const makeId = () => `id-${++n}`;

  it('reuses the id when the same request is retried', () => {
    const first = settlementRequestId(null, forgive(5), makeId);
    const retry = settlementRequestId(first, forgive(5), makeId);
    expect(retry.id).toBe(first.id);
  });

  it('uses a new id for a different request, so an old one is never replayed', () => {
    const forgive5 = settlementRequestId(null, forgive(5), makeId);
    expect(settlementRequestId(forgive5, forgive(3), makeId).id).not.toBe(forgive5.id);
    expect(
      settlementRequestId(forgive5, { kind: 'RESET', counterpartMemberId: brother.id }, makeId).id,
    ).not.toBe(forgive5.id);
    expect(settlementRequestId(forgive5, forgive(5, ana.id), makeId).id).not.toBe(forgive5.id);
  });
});
