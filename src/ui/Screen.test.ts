import { keyboardBehavior } from './Screen';

describe('keyboardBehavior', () => {
  it('pads content above the keyboard on iOS', () => {
    expect(keyboardBehavior('ios')).toBe('padding');
  });

  // Android 15+ draws edge to edge, so the window no longer resizes for the keyboard
  // (adjustResize is ignored): without padding the keyboard covers inputs and buttons.
  it('pads content above the keyboard on Android too', () => {
    expect(keyboardBehavior('android')).toBe('padding');
  });
});
