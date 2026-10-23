import type { Invite, InvitePreview, LedgerDetailKind } from '@/api/generated/model';
import { balanceSentence, groupBalanceSentence } from '@/features/balance/copy';

import { formatInviteCode } from './invite-code';

export function inviteTitle(preview: InvitePreview): string {
  return preview.ledgerKind === 'PAIR'
    ? `${preview.inviterName} wants to keep score with you`
    : `${preview.inviterName} invited you to ${preview.ledgerName ?? 'a group'}`;
}

/** The score you join with, from your side; null when there is none yet (open group invite). */
export function inviteBalanceLine(preview: InvitePreview): string | null {
  if (!preview.balance) return null;
  return preview.ledgerKind === 'PAIR'
    ? balanceSentence(preview.balance, preview.inviterName)
    : groupBalanceSentence(preview.balance);
}

const ERRORS: Record<string, string> = {
  INVITE_NOT_FOUND: 'That code doesn’t match any invite. Check for a typo.',
  INVITE_EXPIRED: 'That invite has expired. Ask for a fresh one.',
  INVITE_USED: 'Someone already used that invite. Ask for a new one.',
  GROUP_FULL: 'That group is full.',
  NO_PLACEHOLDER: 'You’re both on Ur Late already. Nothing left to invite.',
  RATE_LIMITED: 'Too many tries. Wait a few minutes and try again.',
};

export function inviteErrorMessage(code: string | undefined): string {
  return (code && ERRORS[code]) || 'Couldn’t reach Ur Late. Check your connection and try again.';
}

export function shareMessage(
  invite: Pick<Invite, 'code' | 'url'>,
  ledger: { kind: LedgerDetailKind; name: string | null },
): string {
  const tail = `${invite.url} (code ${formatInviteCode(invite.code)})`;
  return ledger.kind === 'GROUP'
    ? `Join ${ledger.name ?? 'us'} on Ur Late, the scoreboard for who’s late: ${tail}`
    : `I’m keeping score of who’s late on Ur Late. Join me: ${tail}`;
}
