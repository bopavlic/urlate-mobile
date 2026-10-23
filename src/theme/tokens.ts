import { vars } from 'nativewind';

// The Ur Late palette. Tailwind classes (bg-paper, text-ink, bg-accent, …) read these
// through CSS variables, so this file is the single place to change the look.
export const palette = {
  light: {
    paper: '#FFF7F2',
    surface: '#FFFFFF',
    ink: '#17120F',
    muted: '#7A6E66',
    line: '#EADFD7',
    accent: '#FF5A36',
    onAccent: '#FFFFFF',
    danger: '#C8322B',
  },
  dark: {
    paper: '#120E0C',
    surface: '#1E1916',
    ink: '#F6EEE8',
    muted: '#A39890',
    line: '#2E2723',
    accent: '#FF6B4A',
    onAccent: '#FFFFFF',
    danger: '#FF6B61',
  },
} as const;

export type Scheme = keyof typeof palette;
export type Palette = (typeof palette)[Scheme];

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

/** CSS variables for NativeWind, e.g. `--color-accent: "255 90 54"`. */
export function themeVars(scheme: Scheme) {
  const entries = (Object.keys(cssName) as (keyof Palette)[]).map(
    (key) => [`--color-${cssName[key]}`, toRgbTriplet(palette[scheme][key])] as const,
  );
  return vars(Object.fromEntries(entries));
}

export const type = {
  /** The balance numeral: huge, heavy, fixed-width digits so it doesn't jump. */
  balance: { fontSize: 96, lineHeight: 100, fontWeight: '900' as const, fontVariant: ['tabular-nums' as const] },
};
