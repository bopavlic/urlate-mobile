import type { Entry, LedgerSummary, Member } from '@/api/generated/model';

export const me: Member = {
  id: 'm-me',
  displayName: 'Borna',
  username: 'borna',
  avatarUrl: null,
  isPlaceholder: false,
  isMe: true,
  role: 'OWNER',
};

export const brother: Member = {
  id: 'm-bro',
  displayName: 'Brother',
  username: null,
  avatarUrl: null,
  isPlaceholder: true,
  isMe: false,
  role: 'MEMBER',
};

export function pairLedger(overrides: Partial<LedgerSummary> = {}): LedgerSummary {
  return {
    id: 'l-pair',
    kind: 'PAIR',
    name: null,
    members: [me, brother],
    myBalance: { direction: 'THEY_OWE_YOU', minutes: 18 },
    lastActivityAt: '2026-10-23T08:00:00.000Z',
    ...overrides,
  };
}

export function groupLedger(overrides: Partial<LedgerSummary> = {}): LedgerSummary {
  return {
    id: 'l-group',
    kind: 'GROUP',
    name: 'Football',
    members: [me, brother, { ...brother, id: 'm-ana', displayName: 'Ana' }],
    myBalance: { direction: 'YOU_OWE_THEM', minutes: 2 },
    lastActivityAt: '2026-10-22T18:00:00.000Z',
    ...overrides,
  };
}

export function entryFixture(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'e1',
    ledgerId: 'l-pair',
    lateMemberId: brother.id,
    waiterMemberIds: [me.id],
    minutes: 5,
    note: 'football',
    occurredAt: '2026-10-20T16:05:00.000Z',
    status: 'ACTIVE',
    createdByUserId: 'u-me',
    editedAt: null,
    deletedAt: null,
    createdAt: '2026-10-20T16:05:00.000Z',
    disputableUntil: null,
    actions: { edit: true, delete: true, confirm: false, reject: false, dispute: false },
    ...overrides,
  };
}
