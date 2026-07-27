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

`src/config/env.ts` resolves the API base URL at build time:

| Target           | URL used                   |
| ---------------- | -------------------------- |
| Android emulator | `http://10.0.2.2:3000`     |
| iOS simulator    | `http://localhost:3000`    |
| Physical device  | `API_BASE_URL` from `.env` |

`API_BASE_URL` in `.env` overrides the defaults on every platform. Set it to the LAN address of the
machine running the backend (e.g. `http://192.168.1.20:3000`) when testing on a real device.

`.env` is read at **bundle time** by `react-native-dotenv`, so restart Metro with
`pnpm start --reset-cache` after changing it. `.env` is gitignored; `.env.example` documents the keys.

## Data layer

`my-cachifa-backend` isn't deployed yet, so the app talks to a repository interface
(`src/api/repositories/interfaces`) with two implementations:

- `src/api/repositories/mock` — in-memory seed data with simulated latency. Default.
- `src/api/repositories/http` — axios calls against `env.apiBaseUrl`. Untested against a real
  backend; exists so switching later is a one-line config change, not a rewrite.

`API_MODE` in `.env` picks between them (`mock` by default, `http` to call the real API). Screens
never import a repository directly — they consume it through a hook in `src/hooks`, backed by
React Query. `src/api/repositoryFactory.ts` is the only file that decides which implementation is
live; an ESLint rule blocks `src/screens` and `src/components` from importing repositories
directly.

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
