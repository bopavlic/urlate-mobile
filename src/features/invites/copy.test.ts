import type { InvitePreview } from '@/api/generated/model';

import { inviteBalanceLine, inviteErrorMessage, inviteTitle, shareMessage } from './copy';

const pair: InvitePreview = {
  code: 'ABCDEFGH',
  ledgerKind: 'PAIR',
  ledgerName: null,
  inviterName: 'Borna',
  inviterAvatarUrl: null,
  placeholderName: 'Brother',
  balance: { direction: 'YOU_OWE_THEM', minutes: 18 },
  expiresAt: '2026-11-06T12:00:00.000Z',
};

const openGroup: InvitePreview = {
  ...pair,
  ledgerKind: 'GROUP',
  ledgerName: 'Football',
  placeholderName: null,
  balance: null,
};

describe('inviteTitle', () => {
  it('names who is inviting you, and to which group', () => {
    expect(inviteTitle(pair)).toBe('Borna wants to keep score with you');
    expect(inviteTitle(openGroup)).toBe('Borna invited you to Football');
  });
});

describe('inviteBalanceLine', () => {
  it('shows the score you join with, from your side', () => {
    expect(inviteBalanceLine(pair)).toBe('You owe Borna 18 min');
    expect(inviteBalanceLine({ ...pair, balance: { direction: 'THEY_OWE_YOU', minutes: 4 } })).toBe(
      'Borna owes you 4 min',
    );
    expect(
      inviteBalanceLine({
        ...openGroup,
        placeholderName: 'Ana',
        balance: { direction: 'YOU_OWE_THEM', minutes: 5 },
      }),
    ).toBe('You owe the group 5 min');
  });

  it('has nothing to show for an open group invite', () => {
    expect(inviteBalanceLine(openGroup)).toBeNull();
  });
});

describe('inviteErrorMessage', () => {
  it('explains each way joining can fail', () => {
    expect(inviteErrorMessage('INVITE_NOT_FOUND')).toMatch(/typo/);
    expect(inviteErrorMessage('INVITE_EXPIRED')).toMatch(/expired/);
    expect(inviteErrorMessage('INVITE_USED')).toMatch(/already used/);
    expect(inviteErrorMessage('GROUP_FULL')).toMatch(/full/);
    expect(inviteErrorMessage('NO_PLACEHOLDER')).toMatch(/both on Ur Late/);
    expect(inviteErrorMessage('RATE_LIMITED')).toMatch(/Too many tries/);
    expect(inviteErrorMessage(undefined)).toMatch(/connection/);
  });
});

describe('shareMessage', () => {
  const invite = {
    code: 'ABCDEFGH',
    url: 'https://urlate.app/i/ABCDEFGH',
    ledgerId: 'l1',
    memberId: 'm1',
    expiresAt: '2026-11-06T12:00:00.000Z',
  };

  it('carries the link and the code to type after installing', () => {
    expect(shareMessage(invite, { kind: 'PAIR', name: null })).toBe(
      'I’m keeping score of who’s late on Ur Late. Join me: https://urlate.app/i/ABCDEFGH (code ABCD-EFGH)',
    );
    expect(shareMessage(invite, { kind: 'GROUP', name: 'Football' })).toBe(
      'Join Football on Ur Late, the scoreboard for who’s late: https://urlate.app/i/ABCDEFGH (code ABCD-EFGH)',
    );
  });
});
