import { CARD_COLORS, FREE_LOOK, STYLES, cardLook, isFreeLook, ticketColors } from './look';

describe('card looks', () => {
  it('has the classic look: a red ticket on paper', () => {
    expect(cardLook(FREE_LOOK)).toEqual({
      background: '#EEF0F4',
      text: '#16182B',
      muted: '#5C6070',
      line: '#DDE0E8',
      card: '#E8432A',
      onCard: '#FFFFFF',
    });
  });

  it('covers every background and card colour the API knows', () => {
    expect(Object.keys(STYLES).sort()).toEqual(['CHALK', 'DAYLIGHT', 'PITCH']);
    expect(Object.keys(CARD_COLORS).sort()).toEqual([
      'BLUE',
      'ORANGE',
      'PINK',
      'RED',
      'WHITE',
      'YELLOW',
    ]);
  });

  it('bands the ticket in the card colour', () => {
    expect(ticketColors({ style: 'PITCH', cardColor: 'BLUE' })).toMatchObject({
      accent: '#2B5FEA',
      paper: '#FFFFFF',
    });
  });

  it('knows which look is free', () => {
    expect(isFreeLook({ style: 'CHALK', cardColor: 'RED' })).toBe(true);
    expect(isFreeLook({ style: 'CHALK', cardColor: 'PINK' })).toBe(false);
  });
});
