import { brother, entryFixture, me } from '@/features/ledgers/fixtures';

import { disputeHint, entryStatusLabel } from './status';

const members = [me, brother];

describe('entryStatusLabel', () => {
  it('says nothing for an entry that simply counts', () => {
    expect(entryStatusLabel(entryFixture(), members)).toBeNull();
  });

  it('says who an entry is waiting for', () => {
    expect(entryStatusLabel(entryFixture({ status: 'PENDING' }), members)).toBe(
      'Waiting for Brother',
    );
    expect(
      entryStatusLabel(entryFixture({ status: 'PENDING', lateMemberId: me.id }), members),
    ).toBe('Waiting for you');
  });

  it('names who disputed it', () => {
    expect(entryStatusLabel(entryFixture({ status: 'DISPUTED' }), members)).toBe(
      'Brother disputed this',
    );
    expect(
      entryStatusLabel(entryFixture({ status: 'DISPUTED', lateMemberId: me.id }), members),
    ).toBe('You disputed this');
  });

  it('marks rejected entries', () => {
    expect(entryStatusLabel(entryFixture({ status: 'REJECTED' }), members)).toBe(
      "Rejected, doesn't count",
    );
  });

  it('leaves deleted entries to the deleted mark', () => {
    expect(
      entryStatusLabel(
        entryFixture({ status: 'DISPUTED', deletedAt: '2026-10-21T00:00:00.000Z' }),
        members,
      ),
    ).toBeNull();
  });
});

describe('disputeHint', () => {
  const now = new Date('2026-10-21T10:00:00.000Z');

  it('counts down the hours left to dispute', () => {
    expect(disputeHint('2026-10-22T16:05:00.000Z', now)).toBe('You can dispute this for 30 h');
  });

  it('switches to minutes in the last hour', () => {
    expect(disputeHint('2026-10-21T10:40:00.000Z', now)).toBe('You can dispute this for 40 min');
  });

  it('is empty once the window closed', () => {
    expect(disputeHint('2026-10-21T09:00:00.000Z', now)).toBeNull();
    expect(disputeHint(null, now)).toBeNull();
  });
});
