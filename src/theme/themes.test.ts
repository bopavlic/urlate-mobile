import icons from '../../assets/icons/icons.json';

import { contrast, THEME_IDS, themes } from './tokens';

describe('themes', () => {
  it.each(THEME_IDS)('%s keeps text readable in light and dark (WCAG AA)', (id) => {
    for (const scheme of ['light', 'dark'] as const) {
      const c = themes[id][scheme];
      expect(contrast(c.ink, c.paper)).toBeGreaterThanOrEqual(7);
      expect(contrast(c.ink, c.surface)).toBeGreaterThanOrEqual(7);
      expect(contrast(c.muted, c.paper)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.onAccent, c.accent)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.danger, c.paper)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('has an icon for every theme, in the same order', () => {
    expect(icons.map((icon) => icon.id)).toEqual(THEME_IDS);
  });

  it('keeps the classic look as it was', () => {
    expect(themes.classic.dark.accent).toBe('#FFCC1A');
    expect(themes.classic.light.paper).toBe('#FFFFFF');
  });
});
