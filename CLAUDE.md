# urlate-mobile

The Ur Late iOS and Android app (Expo + Expo Router). The product brief lives at `../Ur Late — Project Brief.md`; read it before changing behaviour. Its "Decisions" section is authoritative. This repo covers build-order steps 5–6 (scaffold, sign-in, then the MVP screens) and later the mobile parts of steps 8–13.

- Expo-specific rules are in `AGENTS.md` (always check the installed SDK's docs; use `npx expo install`).
- API contract: `../urlate-backend/openapi.json` (also served at `/v1/openapi.json`). Generate the typed axios functions and TanStack Query hooks with Orval (`pnpm api:generate`); never hand-write API types.
- Identifiers: bundle ID / package `app.urlate`, URL scheme `urlate://`. In-app purchases and AdMob need an EAS development build, not Expo Go.
- Local API: http://localhost:4000 (port 3000 is taken on the owner's machine).
- Git: identity comes from `~/.gitconfig-urlate` via includeIf. Never use the `gh` CLI (it's logged into a work account).
