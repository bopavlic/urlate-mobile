import type { BalanceView, Member, PairBalance } from '@/api/generated/model';

type Scored = { kind: 'PAIR' | 'GROUP'; members: Member[]; balances: PairBalance[] };

/** > 0: they owe me; < 0: I owe them (balances stay pairwise, even in groups). */
function scoreWith(detail: Scored, meId: string, otherId: string): number {
  for (const pair of detail.balances) {
    if (pair.creditorMemberId === meId && pair.debtorMemberId === otherId) return pair.minutes;
    if (pair.creditorMemberId === otherId && pair.debtorMemberId === meId) return -pair.minutes;
  }
  return 0;
}

/**
 * Only the person who is owed can forgive or reset, one person at a time. In a pair the
 * counterpart is the other person; in a group it is whoever was picked.
 */
export function settleOptions(
  detail: Scored,
  counterpartId?: string,
): { canSettle: boolean; owedMinutes: number; counterpartId: string | null } {
  const me = detail.members.find((member) => member.isMe);
  const counterpart =
    detail.members.find((member) => member.id === counterpartId && !member.isMe) ??
    (detail.kind === 'PAIR' ? detail.members.find((member) => !member.isMe) : undefined);
  const owed = me && counterpart ? Math.max(0, scoreWith(detail, me.id, counterpart.id)) : 0;
  return { canSettle: owed > 0, owedMinutes: owed, counterpartId: counterpart?.id ?? null };
}

/** My balance with each person in a group, people who owe me first, then by size. */
export function myScores(detail: Scored): { member: Member; view: BalanceView }[] {
  const me = detail.members.find((member) => member.isMe);
  if (!me) return [];
  return detail.members
    .filter((member) => !member.isMe)
    .map((member) => ({ member, score: scoreWith(detail, me.id, member.id) }))
    .filter(({ score }) => score !== 0)
    .sort((a, b) => b.score - a.score)
    .map(({ member, score }) => ({
      member,
      view: {
        direction: score > 0 ? ('THEY_OWE_YOU' as const) : ('YOU_OWE_THEM' as const),
        minutes: Math.abs(score),
      },
    }));
}

export type SettleRequest = ({ kind: 'FORGIVE'; minutes: number } | { kind: 'RESET' }) & {
  counterpartMemberId: string;
};
export type RequestId = { key: string; id: string };

/**
 * One idempotency key per distinct request: a retry of the same request reuses it (so a
 * double tap or a timeout can't apply it twice), anything else gets a fresh one (so an
 * earlier request is never replayed in place of a new one).
 */
export function settlementRequestId(
  previous: RequestId | null,
  request: SettleRequest,
  makeId: () => string,
): RequestId {
  const what = request.kind === 'FORGIVE' ? `FORGIVE:${request.minutes}` : 'RESET';
  const key = `${request.counterpartMemberId}:${what}`;
  return previous?.key === key ? previous : { key, id: makeId() };
}
