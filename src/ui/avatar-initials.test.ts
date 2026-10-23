import { initials } from './avatar-initials';

describe('initials', () => {
  it.each([
    ['Borna Pavlic', 'BP'],
    ['ana', 'A'],
    ['  ', '?'],
    ['Mary Jane Watson', 'MJ'],
    ['élodie dupont', 'ÉD'],
  ])('%p → %p', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
