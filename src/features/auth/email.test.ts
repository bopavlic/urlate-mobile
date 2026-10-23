import { isValidEmail, normaliseCode } from './email';

describe('isValidEmail', () => {
  it.each([
    ['a@b.co', true],
    [' ana@example.com ', true],
    ['ana', false],
    ['ana@', false],
    ['@x.com', false],
    ['a@b', false],
    ['a@@b.co', false],
  ])('%p → %p', (value, expected) => {
    expect(isValidEmail(value)).toBe(expected);
  });
});

describe('normaliseCode', () => {
  it('keeps the first six digits only', () => {
    expect(normaliseCode('12 34-56789')).toBe('123456');
    expect(normaliseCode('ab1')).toBe('1');
  });
});
