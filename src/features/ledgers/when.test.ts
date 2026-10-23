import { formatWhen } from './when';

const now = new Date(2026, 9, 23, 12, 0); // Fri 23 Oct 2026, local time

describe('formatWhen', () => {
  it('says today or yesterday with the time', () => {
    expect(formatWhen(new Date(2026, 9, 23, 8, 5), now)).toBe('Today, 08:05');
    expect(formatWhen(new Date(2026, 9, 22, 18, 30), now)).toBe('Yesterday, 18:30');
  });

  it('uses the weekday and date within the year', () => {
    expect(formatWhen(new Date(2026, 9, 20, 18, 0), now)).toBe('Tue 20 Oct, 18:00');
  });

  it('adds the year for older entries', () => {
    expect(formatWhen(new Date(2025, 11, 31, 9, 0), now)).toBe('31 Dec 2025');
  });
});
