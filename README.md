# my-cachifa-mobile

React Native app (bare CLI, no Expo) — frontend for the **my-cachifa** personal finance system.
It talks to the `my-cachifa-backend` service (NestJS + Fastify + Prisma + PostgreSQL) over REST.

Package manager: **pnpm** (`node-linker=hoisted` in `.npmrc`, required so React Native's Metro and
CocoaPods can resolve a flat `node_modules`).

## Getting started

```sh
pnpm install
cp .env.example .env        # optional, see "Backend URL" below

# iOS only, on first clone or after adding native deps
bundle install
bundle exec pod install --project-directory=ios
```

Then start Metro and build:

```sh
pnpm start
pnpm ios        # or: pnpm android
```

## Backend URL

Every route lives under `http://<host>:<port>/api/v1`. `src/config/env.ts` resolves the host at
build time, and only a physical device needs anything in `.env`:

| Target           | Host used   | What to set                                        |
| ---------------- | ----------- | -------------------------------------------------- |
| Android emulator | `10.0.2.2`  | nothing — the alias for the host machine           |
| iOS simulator    | `localhost` | nothing — it shares the Mac's network stack        |
| Physical device  | `API_HOST`  | `API_HOST=192.168.1.20` (`ipconfig getifaddr en0`) |

`API_PORT` overrides the port (3000 by default), and `API_BASE_URL` overrides host and port at once
for a backend that is not on the LAN at all (a tunnel, a staging host) — the `/api/v1` prefix is
appended for you. `API_TIMEOUT_MS` caps how long a request may hang; lowering it is the quickest way
to see the timeout state on screen.

`.env` is read at **bundle time** by `react-native-dotenv`, and Metro does not invalidate its
transform cache when the file changes — so after editing `.env` you must restart Metro with
`pnpm start --reset-cache` **and** reload the app. Otherwise the old values stay baked into the
bundle. In dev the app logs `[api] mode=… baseURL=…` on startup so you can see which ones shipped.

`.env` is gitignored; `.env.example` documents the keys. Jest reads `.env.test` instead (committed,
`API_MODE=mock`), so the suite never depends on the `.env` a developer happens to have locally.

## Data layer

Screens talk to a repository interface (`src/api/repositories/interfaces`) with two
implementations, picked by `API_MODE` in `.env`:

- `src/api/repositories/mock` — in-memory seed data with simulated latency.
- `src/api/repositories/http` — axios calls against the real `my-cachifa-backend`.

Screens never import a repository directly — they consume it through a hook in `src/hooks`, backed
by React Query. `src/api/repositoryFactory.ts` is the only file that decides which implementation is
live; an ESLint rule blocks `src/screens` and `src/components` from importing repositories directly.

Two mappers in `src/api/mappers` keep the two modes telling the same story:

- **`categoryMapper`** — categories are the backend's `Category` enum, not a table, so a category id
  in the app _is_ the enum value (`FOOD`, `ENTERTAINMENT`, …) and the mapper owns the Spanish label,
  icon, color and which kinds of movement each one accepts. Both repositories serve that one
  catalog. "Ocio"/"Entretenimiento" and "Alimentación"/"Mercado" are single concepts here.
- **`decimalMapper`** — amounts are Prisma `Decimal`s. The API converts them to numbers today, but a
  Decimal that ever reaches `JSON.stringify` untouched arrives as a string, so every amount is read
  through `toAmount` and can never render as `NaN`.

Failures come out of the HTTP layer as an `ApiError` (`src/api/apiError.ts`) with a message written
for the person holding the phone — the same `error.message` channel the mocks used, so the screens'
error states did not change. A dead backend reads as _offline_, a slow one as _timeout_, a rejected
payload carries the API's own validation message, and a 404 resolves to `null` instead of throwing.

To exercise the whole data path against a running backend without booting a simulator:

```sh
pnpm test:api   # src/api/integration/liveBackend.itest.ts, cleans up after itself
```

## Project structure

```
src/
├── api/          HTTP client and per-resource endpoint modules
├── components/   Reusable presentational components
├── screens/      Screen-level components
├── navigation/   React Navigation stacks/tabs
├── store/        Global state
├── hooks/        Shared React hooks
├── types/        Shared TypeScript types and module declarations
├── theme/        Colors, spacing, typography
├── config/       Environment and app configuration
└── utils/        Framework-agnostic helpers
```

Everything under `src/` is importable through the `@/` alias (`import { env } from '@/config/env'`),
wired in three places that must stay in sync: `tsconfig.json` (`paths`), `babel.config.js`
(`module-resolver`), and `jest.config.js` (`moduleNameMapper`).

## Conventions

- TypeScript `strict`, plus `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`.
- Prettier: single quotes, **no semicolons**, trailing commas, avoid arrow parens.
- File names, identifiers, and comments in English.

## Scripts

| Command          | Description                           |
| ---------------- | ------------------------------------- |
| `pnpm start`     | Metro dev server                      |
| `pnpm ios`       | Build and run on the iOS simulator    |
| `pnpm android`   | Build and run on the Android emulator |
| `pnpm typecheck` | `tsc --noEmit`                        |
| `pnpm lint`      | ESLint                                |
| `pnpm format`    | Prettier write                        |
| `pnpm test`      | Jest                                  |
| `pnpm test:api`  | Round-trip against a running backend  |
