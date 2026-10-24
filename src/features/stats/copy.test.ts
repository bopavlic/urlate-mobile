import { daysText, durationText, timesText, weekdayText } from './copy';

describe('durationText', () => {
  it('uses minutes, then hours and minutes', () => {
    expect(durationText(0)).toBe('0 min');
    expect(durationText(45)).toBe('45 min');
    expect(durationText(60)).toBe('1 h');
    expect(durationText(192)).toBe('3 h 12 min');
  });
});

describe('timesText', () => {
  it('counts occasions', () => {
    expect(timesText(1)).toBe('once');
    expect(timesText(2)).toBe('twice');
    expect(timesText(7)).toBe('7 times');
  });
});

describe('daysText', () => {
  it('counts days', () => {
    expect(daysText(1)).toBe('1 day');
    expect(daysText(23)).toBe('23 days');
  });
});

describe('weekdayText', () => {
  it('names the weekday as a habit', () => {
    expect(weekdayText('FRIDAY')).toBe('Fridays');
  });
});
