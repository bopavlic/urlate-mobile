// Tailwind's *-opacity utilities make colour classes set CSS variables (--tw-bg-opacity…).
// NativeWind remounts a component that gains a variable after its first render, so a
// class like `bg-accent` toggled on selection crashed the dev build. Keep them off.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const config = require('../../tailwind.config.js');

describe('tailwind config', () => {
  it('turns off the opacity utilities that set CSS variables', () => {
    expect(config.corePlugins).toMatchObject({
      backgroundOpacity: false,
      textOpacity: false,
      borderOpacity: false,
      divideOpacity: false,
      placeholderOpacity: false,
      ringOpacity: false,
    });
  });
});
