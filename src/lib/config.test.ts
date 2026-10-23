import { resolveApiUrl } from './config';

describe('resolveApiUrl', () => {
  it('prefers an explicit API URL', () => {
    expect(
      resolveApiUrl({
        envUrl: 'https://api.urlate.app',
        hostUri: '10.0.0.5:8081',
        platform: 'ios',
      }),
    ).toBe('https://api.urlate.app');
  });

  it('uses the Metro host so phones and emulators reach the API on this Mac', () => {
    expect(resolveApiUrl({ hostUri: '10.168.11.59:8081', platform: 'android' })).toBe(
      'http://10.168.11.59:4000',
    );
  });

  it('falls back to localhost on iOS and the emulator alias on Android', () => {
    expect(resolveApiUrl({ hostUri: null, platform: 'ios' })).toBe('http://localhost:4000');
    expect(resolveApiUrl({ hostUri: undefined, platform: 'android' })).toBe('http://10.0.2.2:4000');
  });

  it('ignores an empty env value', () => {
    expect(resolveApiUrl({ envUrl: '', hostUri: 'localhost:8081', platform: 'ios' })).toBe(
      'http://localhost:4000',
    );
  });

  it('strips a trailing slash from the explicit URL', () => {
    expect(resolveApiUrl({ envUrl: 'https://api.urlate.app/', platform: 'ios' })).toBe(
      'https://api.urlate.app',
    );
  });
});
