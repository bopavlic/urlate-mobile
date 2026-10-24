import { vars } from 'nativewind';

// The Ur Late palette: a referee's yellow card on a football pitch at night. Being late
// earns a card, cheekily, not a punishment. Tailwind classes (bg-paper, text-ink,
// bg-accent, …) read these through CSS variables, so this is the one place to change the look.
// Classic is everyone's; the other themes come with Premium. Each matches an app icon
// (assets/icons/icons.json), in the same order.

type Colors = {
  paper: string;
  surface: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  onAccent: string;
  danger: string;
};

export const themes = {
  classic: {
    label: 'Classic',
    light: {
      paper: '#FFFFFF',
      surface: '#F2F5F2',
      ink: '#0B1F16',
      muted: '#5E6E66',
      line: '#E1E7E2',
      accent: '#FFCC1A',
      onAccent: '#0B1F16',
      danger: '#C62E2E',
    },
    dark: {
      paper: '#08140F',
      surface: '#10211A',
      ink: '#EEF3EF',
      muted: '#8FA39A',
      line: '#1E3329',
      accent: '#FFCC1A',
      onAccent: '#0B1F16',
      danger: '#FF6B61',
    },
  },
  // Same pitch, a red card. Danger moves to orange so it doesn't read as the accent.
  'red-card': {
    label: 'Red card',
    light: {
      paper: '#FFFFFF',
      surface: '#F2F5F2',
      ink: '#0B1F16',
      muted: '#5E6E66',
      line: '#E1E7E2',
      accent: '#D42A1F',
      onAccent: '#FFFFFF',
      danger: '#B54708',
    },
    dark: {
      paper: '#08140F',
      surface: '#10211A',
      ink: '#EEF3EF',
      muted: '#8FA39A',
      line: '#1E3329',
      accent: '#F2483D',
      onAccent: '#0B0505',
      danger: '#FF9F5A',
    },
  },
  // The away strip: navy and sky blue.
  'away-kit': {
    label: 'Away kit',
    light: {
      paper: '#FFFFFF',
      surface: '#EEF3FA',
      ink: '#0A1630',
      muted: '#56657F',
      line: '#DCE4F0',
      accent: '#4DA3FF',
      onAccent: '#0A1630',
      danger: '#C62E2E',
    },
    dark: {
      paper: '#060D1E',
      surface: '#0E1932',
      ink: '#EEF3FB',
      muted: '#8E9CB8',
      line: '#1B2946',
      accent: '#4DA3FF',
      onAccent: '#0A1630',
      danger: '#FF6B61',
    },
  },
  // The loud third kit: pink on aubergine.
  'third-kit': {
    label: 'Third kit',
    light: {
      paper: '#FFFFFF',
      surface: '#F8EFF4',
      ink: '#24101C',
      muted: '#6F5966',
      line: '#EEDFE7',
      accent: '#FF5FA2',
      onAccent: '#24101C',
      danger: '#C62E2E',
    },
    dark: {
      paper: '#150910',
      surface: '#22101B',
      ink: '#F8EEF4',
      muted: '#AB929F',
      line: '#36202D',
      accent: '#FF5FA2',
      onAccent: '#24101C',
      danger: '#FF7A6B',
    },
  },
  // Evening kick-off under the lights: graphite and orange.
  floodlights: {
    label: 'Floodlights',
    light: {
      paper: '#FFFFFF',
      surface: '#F3F3F1',
      ink: '#18181B',
      muted: '#63636B',
      line: '#E4E4E7',
      accent: '#FF8A1F',
      onAccent: '#18181B',
      danger: '#C62E2E',
    },
    dark: {
      paper: '#0D0D0F',
      surface: '#19191C',
      ink: '#F2F2F3',
      muted: '#9C9CA4',
      line: '#2A2A2E',
      accent: '#FF8A1F',
      onAccent: '#18181B',
      danger: '#FF6B61',
    },
  },
} as const satisfies Record<string, { label: string; light: Colors; dark: Colors }>;

export type ThemeId = keyof typeof themes;
export const THEME_IDS = Object.keys(themes) as ThemeId[];
export const FREE_THEME: ThemeId = 'classic';

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && value in themes;
}

/** The classic colours, for the few places outside the theme (e.g. the yellow LATE button). */
export const palette = { light: themes.classic.light, dark: themes.classic.dark };

export type Scheme = 'light' | 'dark';
export type Palette = Colors;

function luminance(hex: string): number {
  const value = parseInt(hex.slice(1), 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel((value >> 16) & 255) +
    0.7152 * channel((value >> 8) & 255) +
    0.0722 * channel(value & 255)
  );
}

/** WCAG contrast ratio between two colours (1–21). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

function toRgbTriplet(hex: string): string {
  const value = parseInt(hex.slice(1), 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

const cssName: Record<keyof Palette, string> = {
  paper: 'paper',
  surface: 'surface',
  ink: 'ink',
  muted: 'muted',
  line: 'line',
  accent: 'accent',
  onAccent: 'on-accent',
  danger: 'danger',
};

/** CSS variables for NativeWind, e.g. `--color-accent: "255 204 26"`. */
export function themeVars(scheme: Scheme, theme: ThemeId = FREE_THEME) {
  const colors: Palette = themes[theme][scheme];
  const entries = (Object.keys(cssName) as (keyof Palette)[]).map(
    (key) => [`--color-${cssName[key]}`, toRgbTriplet(colors[key])] as const,
  );
  return vars(Object.fromEntries(entries));
}

/** Big Shoulders: condensed scoreboard type for numbers and titles. Body text uses the system font. */
export const fonts = {
  display: 'BigShoulders_900Black',
  displayBold: 'BigShoulders_800ExtraBold',
  displaySemi: 'BigShoulders_600SemiBold',
} as const;

export const type = {
  /** The balance numeral: huge scoreboard digits that don't jump as they change. */
  balance: {
    fontFamily: fonts.display,
    fontSize: 120,
    lineHeight: 120,
    fontVariant: ['tabular-nums' as const],
  },
};
