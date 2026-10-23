import { vars } from "nativewind";

// The Ur Late palette: a referee's yellow card on a football pitch at night. Being late
// earns a card, cheekily, not a punishment. Tailwind classes (bg-paper, text-ink,
// bg-accent, …) read these through CSS variables, so this is the one place to change the look.
export const palette = {
  light: {
    paper: "#FFFFFF",
    surface: "#F2F5F2",
    ink: "#0B1F16",
    muted: "#5E6E66",
    line: "#E1E7E2",
    accent: "#FFCC1A",
    onAccent: "#0B1F16",
    danger: "#C62E2E",
  },
  dark: {
    paper: "#08140F",
    surface: "#10211A",
    ink: "#EEF3EF",
    muted: "#8FA39A",
    line: "#1E3329",
    accent: "#FFCC1A",
    onAccent: "#0B1F16",
    danger: "#FF6B61",
  },
} as const;

export type Scheme = keyof typeof palette;
export type Palette = (typeof palette)[Scheme];

function toRgbTriplet(hex: string): string {
  const value = parseInt(hex.slice(1), 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

const cssName: Record<keyof Palette, string> = {
  paper: "paper",
  surface: "surface",
  ink: "ink",
  muted: "muted",
  line: "line",
  accent: "accent",
  onAccent: "on-accent",
  danger: "danger",
};

/** CSS variables for NativeWind, e.g. `--color-accent: "255 204 26"`. */
export function themeVars(scheme: Scheme) {
  const entries = (Object.keys(cssName) as (keyof Palette)[]).map(
    (key) =>
      [`--color-${cssName[key]}`, toRgbTriplet(palette[scheme][key])] as const,
  );
  return vars(Object.fromEntries(entries));
}

/** Big Shoulders: condensed scoreboard type for numbers and titles. Body text uses the system font. */
export const fonts = {
  display: "BigShoulders_900Black",
  displayBold: "BigShoulders_800ExtraBold",
  displaySemi: "BigShoulders_600SemiBold",
} as const;

export const type = {
  /** The balance numeral: huge scoreboard digits that don't jump as they change. */
  balance: {
    fontFamily: fonts.display,
    fontSize: 120,
    lineHeight: 120,
    fontVariant: ["tabular-nums" as const],
  },
};
