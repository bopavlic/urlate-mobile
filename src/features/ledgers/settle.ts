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
