// Colours are CSS variables set at runtime from src/theme/tokens.ts (light/dark),
// so the palette lives in one place.
const color = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        paper: color('paper'),
        surface: color('surface'),
        ink: color('ink'),
        muted: color('muted'),
        line: color('line'),
        accent: color('accent'),
        'on-accent': color('on-accent'),
        danger: color('danger'),
      },
      fontFamily: {
        display: ['BigShoulders_900Black'],
        'display-bold': ['BigShoulders_800ExtraBold'],
        'display-semi': ['BigShoulders_600SemiBold'],
      },
    },
  },
  plugins: [],
};
