// Colours are CSS variables set at runtime from src/theme/tokens.ts (light/dark),
// so the palette lives in one place.
const color = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  // These make colour classes set CSS variables (--tw-bg-opacity…), and NativeWind remounts
  // components that gain variables after their first render (e.g. a chip turning bg-accent
  // when selected). Use the colour/alpha syntax instead: bg-accent/50.
  corePlugins: {
    backgroundOpacity: false,
    textOpacity: false,
    borderOpacity: false,
    divideOpacity: false,
    placeholderOpacity: false,
    ringOpacity: false,
  },
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
        display: ['ArchivoBlack_400Regular'],
        'display-bold': ['Archivo_800ExtraBold'],
        'display-semi': ['Archivo_700Bold'],
        mono: ['SpaceMono_400Regular'],
        'mono-bold': ['SpaceMono_700Bold'],
      },
    },
  },
  plugins: [],
};
