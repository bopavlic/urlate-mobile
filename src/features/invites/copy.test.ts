import type { InvitePreview } from '@/api/generated/model';

import {
  activityTarget,
  inviteBalanceLine,
  inviteErrorMessage,
  inviteTitle,
  joinButtonTitle,
  normalizeUsername,
  personalShareMessage,
  shareMessage,
  usernameErrorMessage,
} from './copy';

const pair: InvitePreview = {
  code: 'ABCDEFGH',
  kind: 'LEDGER',
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

const profileCode: InvitePreview = {
  ...pair,
  kind: 'PERSON',
  placeholderName: null,
  balance: null,
  expiresAt: null,
};

describe('profile codes', () => {
  it('offer to start a tally rather than join one', () => {
    expect(inviteTitle(profileCode)).toBe('Borna wants to keep score with you');
    expect(inviteBalanceLine(profileCode)).toBeNull();
    expect(joinButtonTitle(profileCode)).toBe('Start keeping score');
    expect(joinButtonTitle(pair)).toBe('Join');
  });

  it('explain scanning your own code', () => {
    expect(inviteErrorMessage('OWN_INVITE')).toBe('That’s your own code. Show it to someone else.');
  });
});

describe('normalizeUsername', () => {
  it('takes what people type, with or without the @', () => {
    expect(normalizeUsername(' @Ana_K ')).toBe('ana_k');
    expect(normalizeUsername('ana k')).toBeNull();
    expect(normalizeUsername('@a')).toBeNull();
  });
});

describe('usernameErrorMessage', () => {
  it('names the username that didn’t work', () => {
    expect(usernameErrorMessage('USER_NOT_FOUND', 'ana_k')).toBe(
      'Nobody on Ur Late is called @ana_k. Check the spelling.',
    );
    expect(usernameErrorMessage('ALREADY_MEMBER', 'ana_k')).toBe('@ana_k is already in here.');
    expect(usernameErrorMessage(undefined, 'ana_k')).toMatch(/connection/);
  });
});

describe('activityTarget', () => {
  it('opens the invite for invites sent to you, the ledger otherwise', () => {
    expect(activityTarget({ ledgerId: 'l1', inviteCode: 'ABCDEFGH' })).toEqual({
      pathname: '/i/[code]',
      params: { code: 'ABCDEFGH' },
    });
    expect(activityTarget({ ledgerId: 'l1', inviteCode: null })).toEqual({
      pathname: '/ledgers/[id]',
      params: { id: 'l1' },
    });
  });
});

describe('personalShareMessage', () => {
  it('links to the profile code', () => {
    expect(personalShareMessage({ code: 'ABCDEFGH', url: 'https://urlate.app/i/ABCDEFGH' })).toBe(
      'Let’s keep score of who’s late on Ur Late: https://urlate.app/i/ABCDEFGH (code ABCD-EFGH)',
    );
  });
});
