import { entryFixture } from '@/features/ledgers/fixtures';

import { initialEditState, toUpdateEntryBody } from './edit-form';

describe('toUpdateEntryBody', () => {
  const original = entryFixture({ minutes: 5, note: 'dinner' });

  it('starts from the entry as it is', () => {
    expect(initialEditState(original)).toEqual({
      minutes: 5,
      note: 'dinner',
      occurredAt: new Date('2026-10-20T16:05:00.000Z'),
    });
  });

  it('sends nothing when nothing changed', () => {
    expect(toUpdateEntryBody(original, initialEditState(original))).toBeNull();
    expect(
      toUpdateEntryBody(original, { ...initialEditState(original), note: '  dinner ' }),
    ).toBeNull();
  });

  it('sends only what changed', () => {
    expect(toUpdateEntryBody(original, { ...initialEditState(original), minutes: 3 })).toEqual({
      minutes: 3,
    });
    const occurredAt = new Date('2026-10-20T15:00:00.000Z');
    expect(toUpdateEntryBody(original, { ...initialEditState(original), occurredAt })).toEqual({
      occurredAt: occurredAt.toISOString(),
    });
  });

  it('clears the note with null', () => {
    expect(toUpdateEntryBody(original, { ...initialEditState(original), note: ' ' })).toEqual({
      note: null,
    });
  });
});
