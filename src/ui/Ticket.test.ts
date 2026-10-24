import { ticketNumber, ticketTone } from './Ticket';

describe('ticket', () => {
  it('prints the minutes as a zero-padded serial', () => {
    expect(ticketNumber(18)).toBe('No. 000018');
    expect(ticketNumber(1234567)).toBe('No. 999999');
  });

  it('is the accent when they owe you, ink when you owe, plain when clear', () => {
    expect(ticketTone('THEY_OWE_YOU')).toBe('owed');
    expect(ticketTone('YOU_OWE_THEM')).toBe('owing');
    expect(ticketTone('ALL_SQUARE')).toBe('clear');
  });
});
