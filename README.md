# urlate-mobile

The Ur Late app for iOS and Android: Expo SDK 58, Expo Router, NativeWind, TanStack Query. It talks to `urlate-backend` through Orval-generated hooks built from `openapi.json`.

It runs as an Expo **development build** (a debug app with the native modules Ur Late needs: Google sign-in, Apple sign-in, and later in-app purchases and AdMob), not Expo Go.

## Run it

1. Start the backend and friends from the workspace folder (API on :4000, sign-in codes at http://localhost:8025):
   ```sh
   cd ~/UrLate && docker compose up -d
   ```
2. Build the dev client once (and again after adding native packages):
   ```sh
   cd ~/UrLate/urlate-mobile
   pnpm android                 # Android emulator or a phone with USB debugging (picks a device)
   pnpm ios:simulator           # booted iOS simulator (works around an Expo CLI bug with Xcode 27)
   ```
3. Day to day, just run Metro and open the app:
   ```sh
   pnpm start                   # then press a (Android) or i (iOS), or open Ur Late on the device
   ```

The app reaches the API through the same address Metro advertises (your Mac's Wi-Fi IP), so emulators, simulators and phones on the same Wi-Fi all work without configuration.

Profile photos are off locally (no storage bucket); people show initials.

### On a real phone

- **Android:** USB debugging on, cable in, `pnpm android` and pick the phone. Same Wi-Fi as the Mac.
- **iPhone:** open `ios/UrLate.xcworkspace` in Xcode, set your Team under Signing & Capabilities, pick the iPhone and press Run. Same Wi-Fi as the Mac.
- Office or guest Wi-Fi often blocks devices from reaching each other; use home Wi-Fi or a phone hotspot.

### Invite links

`urlate://i/{code}` opens the join screen on any dev build. `https://urlate.app/i/{code}` opens the app only once the site serves its app-link files (needs the Apple Team ID and the Android signing SHA-256, see `urlate-frontend/README.md`) and the app was rebuilt after the `associatedDomains`/`intentFilters` change (`pnpm ios:simulator`, `pnpm android`). To try a link on the simulator: `xcrun simctl openurl booted urlate://i/ABCD1234`.

## Environment

Copy `.env.example` to `.env`; Expo loads it automatically.

| Variable                                                               | Purpose                                                                                                                          |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`                                                  | Leave empty in development: the app uses the Metro host (your Mac) on port 4000. Preview/production builds set it in `eas.json`. |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google sign-in. Without them the Google button is hidden.                                                                        |
| `GOOGLE_IOS_URL_SCHEME`                                                | The reversed iOS client ID. Baked into the native app: run `pnpm ios:simulator` after setting it.                                |

## Code map

| Path                  | What                                                                                                                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`            | Screens (Expo Router). `sign-in`, `code` and `onboarding` for signed-out/new users; `(app)/` is everything after sign-in: tabs, `ledgers/[id]`, `ledgers/new`, the `log` modal, `invite` and `join`. `i/[code]` opens invite links signed in or out. |
| `src/api/client.ts`   | The axios instance: adds the session cookie, signs out on 401.                                                                                                                                                                                       |
| `src/api/generated/`  | Orval output. Never edit; run `pnpm api:generate` after backend route changes.                                                                                                                                                                       |
| `src/features/`       | Feature logic and components (auth, balance copy, ledgers, quick log, profile, invites), each with tests.                                                                                                                                            |
| `src/ui/`             | Shared building blocks: Button, TextField, Screen, Title, Avatar, BigBalance (the yellow card), LateButton.                                                                                                                                          |
| `src/theme/tokens.ts` | The palette (light/dark) and type. Change the look here.                                                                                                                                                                                             |
| `src/theme/`          | `tokens.ts`: the five themes (Classic is free, the rest Premium), each light and dark, and type; `appearance.tsx`: the chosen theme, kept on the phone. A test keeps every theme's text at WCAG AA contrast.                                         |
| `assets/icons/`       | The app icon and its Premium alternates, drawn by `node scripts/icons/generate.mjs` (needs `brew install librsvg`) from `icons.json`; the PNGs are committed. `app.config.ts` registers them natively, so a change needs a new dev build.            |

## Checks

```sh
pnpm test          # jest-expo + Testing Library
pnpm typecheck
pnpm lint
pnpm api:generate  # regenerate the API client from ../urlate-backend/openapi.json
```

Themes and icons are Premium only (`features.themes` from the API, no ad reward): when Premium ends, the app goes back to Classic and the default icon. Android switches icons when the app goes to the background, because swapping the launcher entry can close a running app.
