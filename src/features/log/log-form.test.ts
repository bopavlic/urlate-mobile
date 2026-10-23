import { initialLogState, logReducer, toCreateEntryBody, type LogState } from './log-form';

const picked: LogState = { ...initialLogState(null), ledgerId: 'l1', lateMemberId: 'm-bro' };

describe('logReducer', () => {
  it('starts at 5 minutes with the date left as now', () => {
    expect(initialLogState('l1')).toEqual({
      ledgerId: 'l1',
      lateMemberId: null,
      minutes: 5,
      note: '',
      occurredAt: null,
    });
  });

  it('sets minutes from a chip', () => {
    expect(logReducer(picked, { type: 'chip', minutes: 10 }).minutes).toBe(10);
  });

  it('keeps typed or chosen minutes within 1–1440', () => {
    expect(logReducer(picked, { type: 'chip', minutes: 0 }).minutes).toBe(1);
    expect(logReducer(picked, { type: 'chip', minutes: 2000 }).minutes).toBe(1440);
  });

  it('steps within 1–1440', () => {
    expect(logReducer({ ...picked, minutes: 15 }, { type: 'step', delta: 1 }).minutes).toBe(16);
    expect(logReducer({ ...picked, minutes: 1 }, { type: 'step', delta: -1 }).minutes).toBe(1);
    expect(logReducer({ ...picked, minutes: 1440 }, { type: 'step', delta: 1 }).minutes).toBe(1440);
  });

  it('clears the late person when switching ledgers', () => {
    const next = logReducer(picked, { type: 'pickLedger', ledgerId: 'l2' });
    expect(next.ledgerId).toBe('l2');
    expect(next.lateMemberId).toBeNull();
  });
});

describe('toCreateEntryBody', () => {
  it('waits until someone is picked as late', () => {
    expect(toCreateEntryBody({ ...picked, lateMemberId: null }, 'req-1')).toBeNull();
  });

  it('leaves out a blank note and an unset date', () => {
    expect(toCreateEntryBody({ ...picked, note: '   ' }, 'req-1')).toEqual({
      lateMemberId: 'm-bro',
      minutes: 5,
      clientRequestId: 'req-1',
    });
  });

  it('includes the note and a chosen date', () => {
    const when = new Date('2026-10-20T16:05:00.000Z');
    expect(toCreateEntryBody({ ...picked, note: ' football ', occurredAt: when }, 'req-1')).toEqual(
      {
        lateMemberId: 'm-bro',
        minutes: 5,
        note: 'football',
        occurredAt: '2026-10-20T16:05:00.000Z',
        clientRequestId: 'req-1',
      },
    );
  });
});
