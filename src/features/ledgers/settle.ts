import type { BalanceView, Member } from '@/api/generated/model';

/** Only the person who is owed can forgive or reset (groups settle later, build step 11). */
export function settleOptions(detail: {
  kind: 'PAIR' | 'GROUP';
  members: Member[];
  myBalance: BalanceView;
}): { canSettle: boolean; owedMinutes: number; counterpartId: string | null } {
  const counterpart = detail.members.find((member) => !member.isMe) ?? null;
  const owed = detail.myBalance.direction === 'THEY_OWE_YOU' ? detail.myBalance.minutes : 0;
  return {
    canSettle: detail.kind === 'PAIR' && owed > 0 && counterpart !== null,
    owedMinutes: owed,
    counterpartId: counterpart?.id ?? null,
  };
}

export type SettleRequest = { kind: 'FORGIVE'; minutes: number } | { kind: 'RESET' };
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
  const key = request.kind === 'FORGIVE' ? `FORGIVE:${request.minutes}` : 'RESET';
  return previous?.key === key ? previous : { key, id: makeId() };
}
