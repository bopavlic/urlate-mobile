import { formatInviteCode, normalizeInviteCode } from './invite-code';

describe('normalizeInviteCode', () => {
  it('accepts lowercase, spaces and dashes, like the API', () => {
    expect(normalizeInviteCode(' abcd-efgh ')).toBe('ABCDEFGH');
    expect(normalizeInviteCode('ab cd ef gh')).toBe('ABCDEFGH');
  });

  it('reads look-alikes as the digits they resemble', () => {
    expect(normalizeInviteCode('o0i1lABC')).toBe('00111ABC');
  });

  it('is null until the code is complete and valid', () => {
    expect(normalizeInviteCode('ABCD')).toBeNull();
    expect(normalizeInviteCode('ABCDEFGHJ')).toBeNull();
    expect(normalizeInviteCode('ABCDEFGU')).toBeNull();
  });
});

describe('formatInviteCode', () => {
  it('splits the code in two so it is easy to read out', () => {
    expect(formatInviteCode('ABCDEFGH')).toBe('ABCD-EFGH');
  });
});
