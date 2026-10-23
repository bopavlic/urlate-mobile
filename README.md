# urlate-mobile

The Ur Late app for iOS and Android: Expo SDK 58, Expo Router, NativeWind, TanStack Query. It talks to `urlate-backend` through Orval-generated hooks built from `openapi.json`.

It runs as an Expo **development build** (a debug app with the native modules Ur Late needs: Google sign-in, Apple sign-in, and later in-app purchases and AdMob), not Expo Go.

## Run it

Everything starts from the workspace folder (`~/UrLate`), which runs the API, database, mail catcher, S3, website and Metro in Docker:

```sh
cd ~/UrLate
make up              # starts everything; prints the URLs
make build-ios       # once, and after native changes: builds and installs into the booted iOS simulator
make ios             # opens the app in the simulator, connected to Metro
```

Android: start an emulator in Android Studio (or connect a phone with USB debugging), then `make build-android` once and `make android`.

Sign in with any email address: the code arrives in Mailpit at http://localhost:8025.

### On a real phone

- **Android:** connect it with USB debugging on and run `make build-android`. The phone must be on the same Wi-Fi as the Mac (`make up` points Metro and the API at the Mac's LAN IP).
- **iPhone:** build a device dev client with EAS (your phone gets registered once): `npx eas-cli@latest device:create`, then `npx eas-cli@latest build --profile development-device --platform ios`. Install it from the link EAS prints and open the project from the app's launcher (`http://<your Mac's IP>:8081`).

## Environment

Copy `.env.example` to `.env`; Expo loads it automatically.

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Leave empty in development: the app uses the Metro host (your Mac) on port 4000. Preview/production builds set it in `eas.json`. |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google sign-in. Without them the Google button is hidden. |
| `GOOGLE_IOS_URL_SCHEME` | The reversed iOS client ID. Baked into the native app: run `make build-ios` after setting it. |

## Code map

| Path | What |
| --- | --- |
| `src/app/` | Screens (Expo Router). `sign-in`, `code` and `onboarding` for signed-out/new users; `(app)/` is everything after sign-in: tabs, `ledgers/[id]`, `ledgers/new`, and the `log` modal. |
| `src/api/client.ts` | The axios instance: adds the session cookie, signs out on 401. |
| `src/api/generated/` | Orval output. Never edit; run `pnpm api:generate` after backend route changes. |
| `src/features/` | Feature logic and components (auth, balance copy, ledgers, quick log, profile), each with tests. |
| `src/ui/` | Shared building blocks: Button, TextField, Screen, Title, Avatar, BigBalance (the yellow card), LateButton. |
| `src/theme/tokens.ts` | The palette (light/dark) and type. Change the look here. |

## Checks

```sh
pnpm test          # jest-expo + Testing Library
pnpm typecheck
pnpm lint
pnpm api:generate  # regenerate the API client from ../urlate-backend/openapi.json
```
