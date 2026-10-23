# Ur Late Mobile MVP + One-Command Dev Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build steps 5–6 of the brief: an Expo app on a development build, with sign-in (email code, Apple, Google), creating ledgers with placeholder people, a quick log in under 5 seconds, balance and history, Forgive/Reset, and a profile with avatar upload. Also make `docker compose up` in `~/UrLate` start the API, the website and the Metro bundler together.

**Architecture:** `~/UrLate` becomes a small workspace repo. Its `docker-compose.yml` `include`s the backend's compose file and adds `web` (Next dev) and `mobile` (Metro) services. The native app is built once on the host (`expo run:ios|android`) as a development client that loads JS from the Metro container. The app reaches the API through an axios instance carrying the Better Auth session cookie, used by Orval-generated TanStack Query hooks. The backend gains S3 presigned avatar uploads (SeaweedFS locally).

**Tech Stack:** Expo SDK 58, Expo Router, expo-dev-client, NativeWind 4.2 (Tailwind 3.4), TanStack Query 5, axios, Orval 8, Better Auth 1.7 (`@better-auth/expo` client), expo-apple-authentication, @react-native-google-signin/google-signin 16, expo-image-picker, expo-image-manipulator, expo-haptics, jest-expo + @testing-library/react-native. Backend: @aws-sdk/client-s3 + s3-request-presigner.

**Spec:** `/Users/bornapavlic/UrLate/Ur Late — Project Brief.md` (sections "MVP features", "Mobile app (Expo)", "Brand and tone", "Tech stack"). Earlier backend plan: `/Users/bornapavlic/UrLate/urlate-backend/docs/superpowers/plans/2026-10-23-backend-foundation.md`.

## Global Constraints

- Mobile only: no web target (`platforms: ['ios', 'android']`), and web-only template files are deleted.
- Identifiers: bundle ID / package `app.urlate`, scheme `urlate`. The display name is "Ur Late".
- Copy (exact, from the brief): the balance always reads in one direction: "`<Name>` owes you `<n>` min", "You owe `<Name>` `<n>` min" or "All square". Empty state: "No one's late yet. Give it time." After logging: "Noted. `<n>` more minutes on their tab." when they were late; my call for when I was late: "Noted. `<n>` minutes off your tab… or onto it." All square, subtitle: "Enjoy it while it lasts."
- Quick log minute chips are exactly 1, 2, 5, 10, 15, plus a stepper. The date defaults to now. Saving fires `expo-haptics` success.
- Visual direction (my call, centralised in theme tokens so it is one edit to change):
  - Accent `#FF5A36` (late orange).
  - Ink `#17120F` on paper `#FFF7F2` in light mode; paper `#F6EEE8` on `#120E0C` in dark mode.
  - Surfaces `#FFFFFF` (light) and `#1E1916` (dark).
  - The balance is a huge numeral: system font, weight 900, `tabular-nums`, 96pt.
  - Stopwatch motif: SF Symbol `stopwatch` on iOS, Material `timer` on Android.
  - Light and dark mode follow the system.
- All API calls go through the generated client (`src/api/generated/`). Never hand-write request types.
- The API base URL comes from `EXPO_PUBLIC_API_URL` if set, otherwise from the Metro host in `Constants.expoConfig.hostUri` with port 4000.
- Local ports: API 4000, web 3001, Metro 8081, Mailpit 8025, S3 8333.
- The workspace's `EXPO_HOST` (the Mac's LAN IP, set by `make up`) is what Metro advertises and what presigned S3 URLs use, so the simulator, emulator and real phones can all reach them.
- Git: identity comes from includeIf (`bopavlic` no-reply). Commits end with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`. Never use `gh`. Push `main` after each task in the repo it touches.

## Review Focus

1. **A user opening the app on a real phone or an Android emulator** must reach both the API and the avatar bucket. Metro advertises `EXPO_HOST`, the API URL is derived from the Metro host, and presigned URLs use `S3_PUBLIC_ENDPOINT`. Test in Task 4 (`resolveApiUrl`) and Task 2 (presigned URL host).
2. **A double-tapped Save in quick log** must log once. Each open of the log modal makes one `clientRequestId`, sent with every retry of that save. Test in Task 10.
3. **An expired or revoked session** while using the app returns 401: the app must sign out and land on the sign-in screen instead of spinning or erroring. Test in Task 4 (interceptor) and Task 5 (auth gate).
4. **Avatar keys**: a user must not be able to point their avatar at another user's object or a missing object. Test in Task 2 (403 or 422 for a foreign prefix, 422 for a missing object).
5. **A placeholder-only or brand-new ledger** shows "All square" and an empty history, not an empty screen or a crash. Test in Task 9.

---

### Task 1: One-command dev stack (workspace repo, web and Metro containers)

**Repos:** `~/UrLate` (new workspace repo), `urlate-frontend`, `urlate-mobile`.

**Files:**
- Create `~/UrLate/.gitignore` (ignore `urlate-backend/`, `urlate-mobile/`, `urlate-frontend/`, `.env`, `.DS_Store`), `~/UrLate/docker-compose.yml`, `~/UrLate/Makefile`, `~/UrLate/README.md`, `~/UrLate/.env.example`.
- Create `urlate-frontend/Dockerfile` (targets `dev` and `prod`, the latter standalone and non-root) and `urlate-frontend/.dockerignore`.
- Create `urlate-mobile/Dockerfile.dev` and `urlate-mobile/.dockerignore`.

Root compose:
- `name: urlate`.
- `include: [urlate-backend/docker-compose.yml]`.
- Override the `api` service with `S3_PUBLIC_ENDPOINT: http://${EXPO_HOST:-localhost}:8333` and `CORS_ORIGINS: http://localhost:3001`. If `include` can't override, put the env in the backend compose with the same `${EXPO_HOST:-localhost}` default.
- `web`: build `urlate-frontend` target `dev`, port `3001:3001`, bind mount plus anonymous `node_modules` and `.next` volumes, command `pnpm dev -p 3001 -H 0.0.0.0`.
- `mobile`: build `urlate-mobile/Dockerfile.dev`, port `8081:8081`, bind mount plus anonymous `node_modules`, env `REACT_NATIVE_PACKAGER_HOSTNAME=${EXPO_HOST:-localhost}` and `EXPO_NO_TELEMETRY=1`, command `pnpm expo start --dev-client --port 8081`.

Makefile targets:
- `up`: `EXPO_HOST=$$(ipconfig getifaddr en0 || echo localhost) docker compose up -d --build`, then print the URLs.
- `down`, `logs`.
- `ios`: `xcrun simctl openurl booted "urlate://expo-development-client/?url=http%3A%2F%2F$$EXPO_HOST%3A8081"`.
- `android`: `adb shell am start -a android.intent.action.VIEW -d "urlate://expo-development-client/?url=http%3A%2F%2F$$EXPO_HOST%3A8081"`.
- `build-ios` / `build-android`: `cd urlate-mobile && pnpm expo run:ios --no-bundler` (the android equivalent for the other).

- [ ] **Step 1:** Write the Dockerfiles and the compose files. Then `git init` the workspace and move the brief and SETUP.md into its first commit as they are.
- [ ] **Step 2: Verify.** Run `cd ~/UrLate && make up`, then:
  - `curl -sf localhost:4000/health` → `{"status":"ok","database":"ok"}`
  - `curl -s -o /dev/null -w '%{http_code}' localhost:3001` → `200`
  - `curl -s localhost:8081/status` → `packager-status:running`
- [ ] **Step 3: Commit.** Commit and push the web and mobile Dockerfiles. Commit the workspace repo locally; it has no GitHub remote until the owner creates one.

---

### Task 2: Backend avatar storage (presigned S3 uploads)

**Repo:** `urlate-backend`

**Files:**
- Create `src/lib/storage.ts` and `test/integration/avatar.test.ts`.
- Modify `src/env.ts`, `src/env.test.ts`, `.env.example`, `docker-compose.yml` (api env), `src/app.ts`/`src/server.ts` (wire storage, ensure the bucket outside production), `src/http/route.ts` (`RouteDeps.storage`), `src/routes/me.ts`, `src/routes/access.ts` and `src/routes/schemas.ts` (`avatarUrl` on `MemberDto`), and `.github/workflows/ci.yml` (start SeaweedFS with `docker run` before the integration tests).

**Interfaces:**
- Env (all optional except in production): `S3_ENDPOINT` (internal, e.g. `http://seaweedfs:8333`; unset for AWS), `S3_PUBLIC_ENDPOINT` (what phones see; defaults to `S3_ENDPOINT`), `S3_REGION` (default `eu-central-1`), `S3_BUCKET` (default `urlate-dev`), `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` (default `true` when `S3_ENDPOINT` is set).
- `createStorage(env): Storage` where `Storage = { presignPut(key: string, contentType: string): Promise<{ url: string; expiresAt: Date }>; presignGet(key: string): Promise<string>; exists(key: string): Promise<boolean>; remove(key: string): Promise<void>; ensureBucket(): Promise<void> }`.
  - Presigning uses a client on `S3_PUBLIC_ENDPOINT`; network calls use one on `S3_ENDPOINT`.
  - `presignPut` expires in 10 minutes, `presignGet` in 1 hour.
- `RouteDeps` gains `storage: Storage`.
- `POST /me/avatar-upload` (operationId `createAvatarUpload`), body `{ contentType: 'image/jpeg' | 'image/png' }`, returns `201 { uploadUrl, key, expiresAt }`. The key is `avatars/<userId>/<uuid>.jpg|png`.
- `PATCH /me` also accepts `avatarKey: string | null`:
  - The key must start with `avatars/<userId>/`, else 422 `INVALID_AVATAR_KEY`.
  - The object must exist, else 422 `AVATAR_NOT_UPLOADED`.
  - The old object is removed after a successful switch; `null` clears the avatar and removes the object.
- `MeDto.avatarUrl` and `MemberDto.avatarUrl` (new, nullable) are presigned GET URLs.

- [ ] **Step 1: Failing tests.** In `test/integration/avatar.test.ts`, against SeaweedFS on `localhost:8333` with bucket `urlate-test`:
  - `createAvatarUpload` returns a URL whose host is `S3_PUBLIC_ENDPOINT`'s host.
  - A `PUT` of a small JPEG to that URL succeeds.
  - `PATCH /me { avatarKey }` sets `avatarUrl`, and a `GET` of that URL returns the bytes.
  - Another user's prefix → 422 `INVALID_AVATAR_KEY`.
  - A never-uploaded key → 422 `AVATAR_NOT_UPLOADED`.
  - Replacing the avatar removes the old object (`exists` → false).
  - `null` clears it.
  - Ledger members carry `avatarUrl`.
  - In `src/env.test.ts`, the S3 defaults apply.
- [ ] **Step 2:** Run them and see them fail.
- [ ] **Step 3:** Implement. `pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`.
- [ ] **Step 4:** `pnpm lint && pnpm typecheck && pnpm test && pnpm test:integration && pnpm openapi:generate` → all pass; `openapi.json` shows the new route.
- [ ] **Step 5:** Commit and push.

---

### Task 3: Mobile foundation (clean template, config, styling, tests, CI)

**Repo:** `urlate-mobile`

**Files:**
- Delete the template demo code: `src/app/explore.tsx`, `src/components/*` (template), `src/hooks/*`, `src/constants/theme.ts`, `src/global.css`, `scripts/reset-project.js`, `assets/images/*` except icon, splash and android icons.
- Create `app.config.ts` (replaces `app.json`), `eas.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`, `jest.config.js`, `src/lib/config.ts`, `src/lib/config.test.ts`, `src/theme/tokens.ts`, `.github/workflows/ci.yml`, `.env.example`.
- Modify `package.json` scripts (`start`, `ios`, `android`, `test`, `typecheck`, `lint`, `api:generate`) and `.gitignore` (add `/ios`, `/android`, `.env`).

**Interfaces:**
- `resolveApiUrl(input: { envUrl?: string; hostUri?: string | null; platform: 'ios' | 'android' }): string`:
  - A non-empty `envUrl` wins.
  - Otherwise use `http://<host part of hostUri>:4000`.
  - If `hostUri` is missing: `http://localhost:4000` on iOS, `http://10.0.2.2:4000` on Android.
- `app.config.ts`:
  - name `Ur Late`, slug `urlate`, scheme `urlate`, `platforms: ['ios','android']`.
  - `ios.bundleIdentifier` `app.urlate` with `usesAppleSignIn: true`; `android.package` `app.urlate`.
  - plugins: `expo-router`, `expo-dev-client`, `expo-secure-store`, `expo-apple-authentication`, `expo-image-picker` (photos permission text "Pick a profile photo"), `expo-splash-screen` (background `#FF5A36`). Add `@react-native-google-signin/google-signin` with `{ iosUrlScheme: process.env.GOOGLE_IOS_URL_SCHEME }` only when that env var is set.
  - `extra.eas.projectId` comes from `EAS_PROJECT_ID` when set.
- `eas.json` profiles:
  - `development`: `developmentClient: true`, `distribution: internal`, `ios.simulator: true`.
  - `development-device`: like `development` but builds for real devices.
  - `preview`: internal distribution.
  - `production`: autoIncrement.
  - Each sets `env.EXPO_PUBLIC_API_URL` (the production one is `https://api.urlate.app`).

- [ ] **Step 1:** `npx expo install` the deps: `expo-dev-client nativewind react-native-reanimated react-native-safe-area-context expo-secure-store expo-network expo-haptics expo-apple-authentication expo-image-picker expo-image-manipulator @react-native-community/datetimepicker` plus the `pnpm add` deps `better-auth @better-auth/expo @tanstack/react-query axios @react-native-google-signin/google-signin`. Dev deps: `tailwindcss@^3.4 jest-expo jest @testing-library/react-native @types/jest orval`.
- [ ] **Step 2: Failing test** `src/lib/config.test.ts`:
  ```ts
  expect(resolveApiUrl({ envUrl: 'https://api.urlate.app', hostUri: '10.0.0.5:8081', platform: 'ios' })).toBe('https://api.urlate.app');
  expect(resolveApiUrl({ hostUri: '10.168.11.59:8081', platform: 'android' })).toBe('http://10.168.11.59:4000');
  expect(resolveApiUrl({ hostUri: null, platform: 'ios' })).toBe('http://localhost:4000');
  expect(resolveApiUrl({ hostUri: undefined, platform: 'android' })).toBe('http://10.0.2.2:4000');
  expect(resolveApiUrl({ envUrl: '', hostUri: 'localhost:8081', platform: 'ios' })).toBe('http://localhost:4000');
  ```
- [ ] **Step 3:** Implement; run `pnpm test` → pass. Add a placeholder `src/app/index.tsx` that renders "Ur Late" with a NativeWind class, so styling is exercised. `pnpm typecheck && pnpm lint` → clean (the template's web type error is gone with the web files).
- [ ] **Step 4:** `pnpm expo-doctor` (via `pnpm dlx expo-doctor@latest`) → all checks pass. Commit and push.

---

### Task 4: API client (axios instance, Orval hooks, Query provider)

**Repo:** `urlate-mobile`

**Files:**
- Create `orval.config.ts`, `src/api/client.ts`, `src/api/client.test.ts`, `src/api/generated/*` (committed), `src/providers/query.tsx`.

**Interfaces:**
- `src/api/client.ts`:
  - `export const api: AxiosInstance`, with baseURL `${apiUrl}/v1`.
  - `export function configureApiAuth(opts: { getCookie: () => string | null | Promise<string | null>; onUnauthorized: () => void }): void`.
  - `export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T>`, the Orval mutator. It returns `response.data` and supports abort via `signal`.
  - The request interceptor sets the `Cookie` header from `getCookie()` when non-empty.
  - The response interceptor calls `onUnauthorized()` on 401 (once per burst) and rethrows.
- Orval: input `process.env.OPENAPI_PATH ?? '../urlate-backend/openapi.json'`, output `src/api/generated` in mode `tags-split`, `client: 'react-query'`, `httpClient: 'axios'`, mutator `src/api/client.ts#customInstance`. Infinite queries are enabled for `listLedgers` and `getLedgerHistory` with `useInfinite: true, useInfiniteQueryParam: 'cursor'`.

- [ ] **Step 1: Failing tests** in `src/api/client.test.ts`, using `axios-mock-adapter`, or a custom adapter set on `api.defaults.adapter`:
  - The Cookie header is added when `getCookie` returns `'better-auth.session_token=abc'`.
  - There is no Cookie header when `getCookie` returns null.
  - A 401 response calls `onUnauthorized` once, and the promise rejects.
  - `customInstance` resolves to `data`.
- [ ] **Step 2:** Implement, then `pnpm api:generate` → files generated. Run `pnpm typecheck` → clean.
- [ ] **Step 3:** Commit and push.

---

### Task 5: Sign-in (email code, Apple, Google), auth gate, onboarding

**Repo:** `urlate-mobile`

**Files:**
- Create `src/lib/auth.ts`, `src/app/_layout.tsx` (providers + `Stack.Protected` guards), `src/app/(auth)/_layout.tsx`, `src/app/(auth)/sign-in.tsx`, `src/app/(auth)/code.tsx`, `src/app/onboarding.tsx`, `src/features/auth/email.ts` (+ test), `src/features/auth/SocialButtons.tsx`, `src/features/auth/code-input.tsx` (+ test).

**Interfaces:**
- `authClient = createAuthClient({ baseURL: `${apiUrl}/v1/auth`, plugins: [expoClient({ scheme: 'urlate', storagePrefix: 'urlate', storage: SecureStore }), emailOTPClient()] })`.
- `configureApiAuth` is wired with `getCookie: () => authClient.getCookie()`. `onUnauthorized` does `authClient.signOut()`, `queryClient.clear()` and redirects to sign-in.
- `isValidEmail(value: string): boolean` — trim, one `@`, a dot in the domain.
- `normaliseCode(value: string): string` — digits only, max 6.
- Root guards:
  - Signed out → `(auth)` stack.
  - Signed in with an empty name → `onboarding`, which sets the display name and an optional username via `useUpdateMe`.
  - Otherwise → `(tabs)`.
- Apple: shown only on iOS when `AppleAuthentication.isAvailableAsync()`. It signs in with the identity token via `authClient.signIn.social({ provider: 'apple', idToken: { token } })`.
- Google: shown only when `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set. It runs `GoogleSignin.configure({ webClientId, iosClientId: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID })`, then `GoogleSignin.signIn()`, then `signIn.social({ provider: 'google', idToken: { token: data.idToken } })`.
- Copy:
  - Sign-in title "Who's been waiting on who?"
  - Email button "Email me a code"
  - Code screen "Check your inbox" / "We sent a 6-digit code to {email}."
  - Errors "That code didn't work. Try again?"

- [ ] **Step 1: Failing tests:**
  - `isValidEmail` table: `'a@b.co'` true; `' ana@example.com '` true; `'ana'`, `'ana@'`, `'@x.com'`, `'a@b'` false.
  - `normaliseCode('12 34-56789')` → `'123456'`.
  - `CodeInput` calls `onComplete('123456')` once, when the sixth digit is entered.
- [ ] **Step 2:** Implement. Run `pnpm test && pnpm typecheck && pnpm lint` → clean.
- [ ] **Step 3: Build the dev client** on the iOS simulator: `pnpm expo run:ios --no-bundler` with Metro running in compose. Open it via `make ios`. Take a screenshot (`xcrun simctl io booted screenshot`) and check that the sign-in screen renders.
- [ ] **Step 4:** Commit and push.

---

### Task 6: Design system and balance copy

**Repo:** `urlate-mobile`

**Files:**
- Create `src/theme/tokens.ts` (extend), `src/ui/Text.tsx`, `src/ui/Button.tsx`, `src/ui/Screen.tsx`, `src/ui/Avatar.tsx`, `src/ui/BigBalance.tsx`, `src/ui/Stopwatch.tsx`, `src/features/balance/copy.ts` (+ test), `src/ui/avatar-initials.ts` (+ test).

**Interfaces:**
- `balanceSentence(view: { direction: BalanceDirection; minutes: number }, otherName: string): string`:
  - THEY_OWE_YOU → `"${otherName} owes you ${n} min"`
  - YOU_OWE_THEM → `"You owe ${otherName} ${n} min"`
  - ALL_SQUARE → `"All square"`
- `groupBalanceSentence(view): string`: THEY_OWE_YOU → `"The group owes you ${n} min"`; YOU_OWE_THEM → `"You owe the group ${n} min"`; otherwise `"All square"`.
- `loggedToast(minutes: number, lateWasMe: boolean): string` — exact copy from Global Constraints.
- `initials(name: string): string` — the first letters of the first two words, uppercased; `'?'` for an empty name.
- `BigBalance` props `{ view, otherName, kind }`. It renders the numeral (0 for square) above the sentence, coloured accent when they owe you, ink when you owe, and muted when square with the "Enjoy it while it lasts." subtitle.

- [ ] **Step 1: Failing tests:**
  - `balanceSentence({direction:'THEY_OWE_YOU',minutes:18},'Brother')` → `'Brother owes you 18 min'`
  - `balanceSentence({direction:'YOU_OWE_THEM',minutes:3},'Ana')` → `'You owe Ana 3 min'`
  - square → `'All square'`
  - `loggedToast(2,false)` → `'Noted. 2 more minutes on their tab.'`
  - `initials('Borna Pavlic')` → `'BP'`; `initials('ana')` → `'A'`; `initials('  ')` → `'?'`
- [ ] **Step 2:** Implement (load superpowers-independent `frontend-design` guidance before writing UI). Tests pass. Commit and push.

---

### Task 7: Tabs, Home and the central "+ Late" button

**Repo:** `urlate-mobile`

**Files:**
- Create `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/index.tsx` (Home), `src/app/(tabs)/activity.tsx`, `src/app/(tabs)/profile.tsx` (stub until Task 11), `src/features/ledgers/LedgerRow.tsx` (+ test).

The tabs are Home, Activity and Profile, with a central raised "+ Late" button that pushes the `log` modal (`/log`).
- Home:
  - Lists ledgers via `useListLedgersInfinite`, pull-to-refresh.
  - Each row: avatar, name (the ledger name, or the other member's name for a pair), and the balance sentence.
  - Empty state: "No one's late yet. Give it time." with a "Start a tally" button → `/ledgers/new`.
  - Header button "+" → `/ledgers/new`.
- Activity: an empty state ("Nothing new. Everyone's on time, suspiciously.") until the activity feed (build step 10).

- [ ] **Step 1: Failing test:** `LedgerRow` for a PAIR with Brother owing 18 renders "Brother" and "Brother owes you 18 min". A GROUP named Football renders "Football" and the group sentence.
- [ ] **Step 2:** Implement; tests pass; typecheck/lint clean. Commit and push.

---

### Task 8: Create a ledger (pair or group, placeholder people)

**Repo:** `urlate-mobile`

**Files:**
- Create `src/app/ledgers/new.tsx` and `src/features/ledgers/new-ledger.ts` (+ test).

**Interfaces:**
- `buildCreateLedgerBody(form: { kind: 'PAIR' | 'GROUP'; name: string; people: string[] }): CreateLedgerBody | { error: string }`:
  - PAIR: exactly one non-blank person; `name` is omitted.
  - GROUP: a name and 1–49 non-blank people, de-duplicated case-insensitively.
  - Errors: "Who's the late one?", "Give the group a name", "Add at least one person".

The screen has a segmented PAIR/GROUP control and text inputs ("Their name", "Group name", "Add person"). It calls `useCreateLedger` and, on success, `router.replace('/ledgers/<id>')`.

- [ ] **Step 1: Failing tests** for `buildCreateLedgerBody`:
  - `{PAIR,'',['Brother']}` → `{ kind:'PAIR', members:[{placeholderName:'Brother'}] }`
  - `{PAIR,'',['  ']}` → error "Who's the late one?"
  - `{GROUP,'',['A']}` → error "Give the group a name"
  - `{GROUP,'Football',['Ana','ana',' Bro ']}` → members `Ana`, `Bro`
- [ ] **Step 2:** Implement. Tests pass. Commit and push.

---

### Task 9: Ledger screen (big balance, history, Forgive/Reset, leaderboard)

**Repo:** `urlate-mobile`

**Files:**
- Create `src/app/ledgers/[id].tsx`, `src/features/ledgers/HistoryItem.tsx` (+ test), `src/features/ledgers/settle.ts` (+ test).

**Interfaces:**
- `settleOptions(detail: LedgerDetail, myMemberId: string)` returns `{ canSettle: boolean; owedMinutes: number; counterpartId: string | null }`. `canSettle` is true only for PAIR ledgers where `myBalance.direction === 'THEY_OWE_YOU'`; group settling is build step 11.
- `HistoryItem` renders:
  - an entry as "`<Late name>` was `<n>` min late" or "You were `<n>` min late", with the note, the relative date, "edited" when `editedAt` is set, and struck through with "deleted" when `deletedAt` is set;
  - a settlement as "You forgave `<n>` min" or "`<Name>` forgave `<n>` min", and Reset as "Reset to all square".

The screen:
- `BigBalance` at the top.
- A "+ Late" button opening `/log?ledgerId=<id>`.
- Forgive (a stepper sheet, 1…owed) and Reset (confirm "Wipe the slate? This can't be undone, but it stays in history.") when `canSettle`. Both send a `clientRequestId`.
- History via `useGetLedgerHistoryInfinite`.
- Groups show a leaderboard (name and net minutes, sorted).

- [ ] **Step 1: Failing tests:**
  - `settleOptions` with Brother owing 18 → `{ canSettle: true, owedMinutes: 18, counterpartId: broId }`; when I owe, or all square → `canSettle: false`.
  - `HistoryItem` renders "Brother was 5 min late", the "deleted" mark, and "You forgave 8 min".
  - A brand-new ledger renders "All square" and the empty history text "No one's late yet. Give it time." (render the screen with mocked hooks).
- [ ] **Step 2:** Implement. Tests pass. Commit and push.

---

### Task 10: Quick log modal

**Repo:** `urlate-mobile`

**Files:**
- Create `src/app/log.tsx` (modal presentation), `src/features/log/log-form.ts` (+ test) and `src/features/log/MinutePicker.tsx` (+ test).

**Interfaces:**
- `logReducer(state, action)` over `{ ledgerId: string | null; lateMemberId: string | null; minutes: number; note: string; occurredAt: Date | null }`. Actions:
  - `pickLedger`
  - `pickLate`
  - `chip(n)` sets minutes to n
  - `step(+1 | -1)`, clamped to 1–1440
  - `note`
  - `date`
- `toCreateEntryBody(state, clientRequestId)` returns `CreateEntryBody | null`: null until a ledger and a late member are picked; `occurredAt` is included only when set; a blank note is omitted.
- The screen:
  - If there's no `ledgerId` param, picks a ledger first (recent ledgers list).
  - "Who was late?" shows two big buttons for a pair (them / me) and a member list for a group.
  - The `MinutePicker` chips are 1, 2, 5, 10, 15, plus − / +.
  - An optional note and a "When" control (default "Just now", tap → date-time picker).
  - Save: `useCreateEntry`, then haptics success, a toast with `loggedToast`, and dismiss.
  - Save is disabled while a request is in flight. The `clientRequestId` is created once per modal open (`useRef(randomUUID())` via `expo-crypto`).

- [ ] **Step 1: Failing tests:**
  - The reducer: chip 5 → 5; step +1 from 15 → 16; step −1 from 1 → 1; step +1 from 1440 → 1440.
  - `toCreateEntryBody` returns null without a late member.
  - The body omits a blank note and includes `clientRequestId`.
  - `MinutePicker` renders exactly the chips 1, 2, 5, 10, 15, and pressing "10" calls `onChange(10)`.
- [ ] **Step 2:** Implement (`npx expo install expo-crypto`). Tests pass. Commit and push.

---

### Task 11: Profile (avatar upload, name, username, sign out)

**Repo:** `urlate-mobile`

**Files:**
- Modify `src/app/(tabs)/profile.tsx`.
- Create `src/features/profile/upload-avatar.ts` (+ test).

**Interfaces:**
- `uploadAvatar(deps: { pick: () => Promise<{ uri: string } | null>; resize: (uri: string) => Promise<{ uri: string }>; requestUpload: (body: { contentType: 'image/jpeg' }) => Promise<{ uploadUrl: string; key: string }>; put: (url: string, fileUri: string, contentType: string) => Promise<void>; save: (key: string) => Promise<unknown> }): Promise<'cancelled' | 'saved'>`.
  - The real wiring uses expo-image-picker (square crop), expo-image-manipulator (512×512 JPEG at 0.8), `createAvatarUpload`, a `fetch` PUT of the file blob, and `updateMe({ avatarKey })`.

The profile screen:
- Avatar (tap to change).
- Display name and username fields, saved with `useUpdateMe`. Show the 409 "That username is taken" inline.
- Email (read-only).
- "Sign out".

- [ ] **Step 1: Failing tests:**
  - `uploadAvatar` returns `'cancelled'` when `pick` returns null, without calling the others.
  - On success, the calls run in order (pick → resize → requestUpload → put → save) with the key from `requestUpload`.
- [ ] **Step 2:** Implement. Tests pass. Commit and push.

---

### Task 12: End-to-end check on the simulator and docs

- [ ] **Step 1:** With `make up` running and the dev client built, open the app (`make ios`). Screenshot the sign-in screen. Request a code for `me@example.com` through the API, then verify:
  - the email arrives in Mailpit, with the right copy.
  - the app's sign-in → code → onboarding → home flow works. The owner checks this by hand, since there's no tap automation; screenshot whatever is reachable by deep link.
- [ ] **Step 2:** Update `urlate-mobile/README.md` (run with Docker, build the dev client, simulator and phone, env vars, Google/Apple setup) and `~/UrLate/SETUP.md` (Google client IDs and the Apple capability now needed). Commit and push.
