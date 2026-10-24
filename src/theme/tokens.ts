import { vars } from 'nativewind';

// The Ur Late palette: being late gets you a ticket, like a parking fine. A coloured
// ticket on a tinted page. Tailwind classes (bg-paper, text-ink, bg-accent, …) read these
// through CSS variables, so this is the one place to change the look.
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
  // A tomato-red late ticket on cool grey. Danger goes deep red so it doesn't read as the accent.
  classic: {
    label: 'Classic',
    light: {
      paper: '#EEF0F4',
      surface: '#FFFFFF',
      ink: '#16182B',
      muted: '#5C6070',
      line: '#DDE0E8',
      accent: '#D63A1F',
      onAccent: '#FFFFFF',
      danger: '#A61B1B',
    },
    dark: {
      paper: '#111318',
      surface: '#1B1E26',
      ink: '#F1F2F5',
      muted: '#9A9EAD',
      line: '#2A2E39',
      accent: '#FF6A4D',
      onAccent: '#16182B',
      danger: '#FF8A80',
    },
  },
  // A pink concert ticket on lavender.
  concert: {
    label: 'Concert',
    light: {
      paper: '#F3F0FD',
      surface: '#FFFFFF',
      ink: '#1C1736',
      muted: '#635C82',
      line: '#E2DCF3',
      accent: '#DB2253',
      onAccent: '#FFFFFF',
      danger: '#B54708',
    },
    dark: {
      paper: '#13101E',
      surface: '#1E1930',
      ink: '#F3F0FD',
      muted: '#A39CC0',
      line: '#2E2745',
      accent: '#FF5C86',
      onAccent: '#1C1736',
      danger: '#FF9A5C',
    },
  },
  // A blue overdue slip from the library.
  library: {
    label: 'Library',
    light: {
      paper: '#EEF2FD',
      surface: '#FFFFFF',
      ink: '#111A3A',
      muted: '#56607F',
      line: '#DCE3F5',
      accent: '#2B5FEA',
      onAccent: '#FFFFFF',
      danger: '#C62E2E',
    },
    dark: {
      paper: '#0B1022',
      surface: '#141B33',
      ink: '#EEF2FD',
      muted: '#949DBB',
      line: '#222C4A',
      accent: '#6E95FF',
      onAccent: '#0B1022',
      danger: '#FF6B61',
    },
  },
  // An amber parking ticket.
  parking: {
    label: 'Parking',
    light: {
      paper: '#FAF3E3',
      surface: '#FFFFFF',
      ink: '#2A1E05',
      muted: '#6E5F44',
      line: '#EFE3C8',
      accent: '#FFB020',
      onAccent: '#2A1E05',
      danger: '#C62E2E',
    },
    dark: {
      paper: '#16110A',
      surface: '#231B10',
      ink: '#FAF3E3',
      muted: '#B3A385',
      line: '#3A2F1D',
      accent: '#FFC24D',
      onAccent: '#2A1E05',
      danger: '#FF6B61',
    },
  },
  // A violet cinema ticket, like the velvet seats.
  cinema: {
    label: 'Cinema',
    light: {
      paper: '#F3EFFD',
      surface: '#FFFFFF',
      ink: '#1E1433',
      muted: '#645A80',
      line: '#E4DCF5',
      accent: '#7C3AED',
      onAccent: '#FFFFFF',
      danger: '#C62E2E',
    },
    dark: {
      paper: '#120D1E',
      surface: '#1D162E',
      ink: '#F3EFFD',
      muted: '#A69BC2',
      line: '#2E2545',
      accent: '#A78BFA',
      onAccent: '#1E1433',
      danger: '#FF6B61',
    },
  },
  // A green raffle ticket.
  raffle: {
    label: 'Raffle',
    light: {
      paper: '#EAF7EF',
      surface: '#FFFFFF',
      ink: '#0E2418',
      muted: '#4F6B5B',
      line: '#D3EBDC',
      accent: '#12B76A',
      onAccent: '#0E2418',
      danger: '#C62E2E',
    },
    dark: {
      paper: '#08150E',
      surface: '#102218',
      ink: '#EAF7EF',
      muted: '#8FB09C',
      line: '#1D3527',
      accent: '#32D583',
      onAccent: '#0E2418',
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

/** The classic colours, for the few places outside the theme (e.g. share-card looks). */
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

/** Archivo Black for titles and numbers, Space Mono for the ticket's printed fields. */
export const fonts = {
  display: 'ArchivoBlack_400Regular',
  displayBold: 'Archivo_800ExtraBold',
  displaySemi: 'Archivo_700Bold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

export const type = {
  /** The minutes on the ticket: big digits that don't jump as they change. */
  balance: {
    fontFamily: fonts.display,
    fontSize: 76,
    lineHeight: 80,
    letterSpacing: -2,
    fontVariant: ['tabular-nums' as const],
  },
};
