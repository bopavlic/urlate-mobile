import type { Href } from 'expo-router';

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

/** A profile code starts a new tally; every other invite joins one. */
export function joinButtonTitle(preview: InvitePreview): string {
  return preview.kind === 'PERSON' ? 'Start keeping score' : 'Join';
}

/** Lowercase, without the @; null when it can't be a username (3–20 letters, digits, _). */
export function normalizeUsername(input: string): string | null {
  const username = input.trim().replace(/^@/, '').toLowerCase();
  return /^[a-z0-9_]{3,20}$/.test(username) ? username : null;
}

export function usernameErrorMessage(code: string | undefined, username: string): string {
  if (code === 'USER_NOT_FOUND')
    return `Nobody on Ur Late is called @${username}. Check the spelling.`;
  if (code === 'ALREADY_MEMBER') return `@${username} is already in here.`;
  if (code === 'RATE_LIMITED') return 'Too many tries. Wait a few minutes and try again.';
  return 'Couldn’t reach Ur Late. Check your connection and try again.';
}

/** Where tapping a notification goes: an invite you were sent opens the invite. */
export function activityTarget(item: { ledgerId: string; inviteCode?: string | null }): Href {
  return item.inviteCode
    ? { pathname: '/i/[code]', params: { code: item.inviteCode } }
    : { pathname: '/ledgers/[id]', params: { id: item.ledgerId } };
}

const ERRORS: Record<string, string> = {
  INVITE_NOT_FOUND: 'That code doesn’t match any invite. Check for a typo.',
  INVITE_EXPIRED: 'That invite has expired. Ask for a fresh one.',
  INVITE_USED: 'Someone already used that invite. Ask for a new one.',
  GROUP_FULL: 'That group is full.',
  NO_PLACEHOLDER: 'You’re both on Ur Late already. Nothing left to invite.',
  OWN_INVITE: 'That’s your own code. Show it to someone else.',
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

export function personalShareMessage(invite: Pick<Invite, 'code' | 'url'>): string {
  return `Let’s keep score of who’s late on Ur Late: ${invite.url} (code ${formatInviteCode(invite.code)})`;
}
