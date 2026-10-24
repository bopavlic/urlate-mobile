import type { Entry, Member } from '@/api/generated/model';

function lateOf(entry: Entry, members: Member[]) {
  const late = members.find((member) => member.id === entry.lateMemberId);
  return { name: late?.displayName || 'Someone', isMe: !!late?.isMe };
}

/** Why an entry isn't simply counting; null when it is (or when it was deleted). */
export function entryStatusLabel(entry: Entry, members: Member[]): string | null {
  if (entry.deletedAt) return null;
  const late = lateOf(entry, members);
  switch (entry.status) {
    case 'PENDING':
      return late.isMe ? 'Waiting for you' : `Waiting for ${late.name}`;
    case 'DISPUTED':
      return late.isMe ? 'You disputed this' : `${late.name} disputed this`;
    case 'REJECTED':
      return "Rejected, doesn't count";
    case 'ACTIVE':
      return null;
  }
}

/** "You can dispute this for 31 h", while the 48-hour window is open. */
export function disputeHint(disputableUntil: string | null, now: Date = new Date()): string | null {
  if (!disputableUntil) return null;
  const left = Date.parse(disputableUntil) - now.getTime();
  if (left <= 0) return null;
  const minutes = Math.ceil(left / 60_000);
  return minutes < 60
    ? `You can dispute this for ${minutes} min`
    : `You can dispute this for ${Math.floor(minutes / 60)} h`;
}
