import { CARD_COLORS, FREE_LOOK, STYLES, cardLook, isFreeLook } from './look';

describe('card looks', () => {
  it('has the classic look in the app’s own colours', () => {
    expect(cardLook(FREE_LOOK)).toEqual({
      background: '#08140F',
      text: '#EEF3EF',
      muted: '#8FA39A',
      line: '#1E3329',
      card: '#FFCC1A',
      onCard: '#0B1F16',
    });
  });

  it('covers every background and card colour the API knows', () => {
    expect(Object.keys(STYLES)).toEqual(['PITCH', 'DAYLIGHT', 'CHALK']);
    expect(Object.keys(CARD_COLORS)).toEqual(['YELLOW', 'RED', 'ORANGE', 'PINK', 'BLUE', 'WHITE']);
  });

  it('knows which look is free', () => {
    expect(isFreeLook({ style: 'PITCH', cardColor: 'YELLOW' })).toBe(true);
    expect(isFreeLook({ style: 'PITCH', cardColor: 'RED' })).toBe(false);
  });
});
