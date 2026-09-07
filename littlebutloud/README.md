# Network of Deeds by Kids (`little-but-loud`)

A clone of the Little But Loud / Network of Deeds by Kids website: a full-stack
platform for youth-led social impact initiatives. Members join a public
directory, post collaboration requests, register for events, and connect with
one another through a moderated request flow. Admins manage members, events,
past-event galleries and resources from an in-app dashboard.

This repository is a source clone of the uploaded project. It has been verified
to install, typecheck, build and boot in this form. See
[Verification status](#verification-status) for exactly what was and was not
exercised.

## Stack

| Layer      | Choice                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| Frontend   | React 19, Vite 7, TypeScript, Tailwind CSS 4, shadcn/ui (Radix), Framer Motion |
| Routing    | wouter (patched, see `patches/`)                                       |
| API        | tRPC 11 over Express 4, Zod 4 input validation                          |
| Data       | MySQL via Drizzle ORM, migrations in `drizzle/`                         |
| Auth       | External OAuth portal for admins; bcrypt-backed member accounts         |
| Storage    | Object storage behind a server-side presigning proxy (`/manus-storage/*`) |
| Email      | SendGrid                                                                |
| Tests      | Vitest                                                                  |

## Layout

```
client/          React SPA
  src/pages/     Home, Connect, Collaborate, Convene, Create, Admin, Members Portal, ...
  src/components/ Feature components plus shadcn/ui primitives in components/ui
server/          Express + tRPC backend
  routers.ts     All tRPC routers (members, collaborations, events, pastEvents, resources, connectionRequests)
  db.ts          Drizzle query layer
  _core/         Bootstrap, OAuth, storage proxy, Vite middleware, env, email
shared/          Types and constants shared across client and server
drizzle/         Schema, relations and 9 SQL migrations
scripts/, *.mjs  One-off operational and seeding scripts
docs/            Verification notes carried over from the original project
```

## Routes

`/` `/connect` `/collaborate` `/convene` `/convene/register/:id` `/create`
`/admin` `/members-portal` `/manage-data` `/privacy` `/terms`

## Data model

14 MySQL tables: `users`, `members`, `collaborations`, `events`,
`event_questions`, `event_registrations`, `past_events`, `past_event_images`,
`resources`, `connection_requests`, `member_accounts`, `member_events`,
`member_event_signups`, `notifications`.

## Getting started

Requires Node.js 22+, pnpm 10+, and a reachable MySQL instance.

```bash
pnpm install
pnpm approve-builds        # allow bcrypt, esbuild and @tailwindcss/oxide build scripts
cp .env.example .env       # then fill in real values
pnpm db:push               # generate and apply Drizzle migrations
pnpm dev                   # http://localhost:3000
```

`pnpm approve-builds` matters: pnpm 10 blocks lifecycle scripts by default, and
`bcrypt` is a native module that will not load without its build step.

### Scripts

| Command       | Effect                                              |
| ------------- | --------------------------------------------------- |
| `pnpm dev`    | tsx watch, Express with Vite middleware in dev mode  |
| `pnpm build`  | Vite build to `dist/public`, esbuild server to `dist/index.js` |
| `pnpm start`  | Run the production bundle                            |
| `pnpm check`  | `tsc --noEmit`                                       |
| `pnpm test`   | Vitest                                               |
| `pnpm format` | Prettier                                             |
| `pnpm db:push`| `drizzle-kit generate && drizzle-kit migrate`         |

### Seeding

`seed-content.mjs` inserts sample members, collaborations, events and resources
using `example.com` addresses. It reads `DATABASE_URL` from `.env`.

```bash
node seed-content.mjs
```

## Configuration

Every setting is environment-driven; no credentials are committed. See
`.env.example` for the annotated list. Two are load-bearing beyond the obvious:

- `VITE_OAUTH_PORTAL_URL` is read at render time by `getLoginUrl()` in
  `client/src/const.ts`, which calls `new URL()` on it. Build without it and the
  SPA renders its error boundary with `TypeError: Invalid URL` instead of the
  site.
- `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` back the
  `/manus-storage/*` proxy in `server/_core/storageProxy.ts`. All site imagery
  and every upload resolve through it.

## Verification status

Run in this environment on the committed source:

| Check                      | Result                                                        |
| -------------------------- | ------------------------------------------------------------- |
| `pnpm install`             | Pass                                                          |
| `pnpm check` (typecheck)   | Pass, no errors                                               |
| `pnpm build`               | Pass, client 1,499 kB (410 kB gzip) plus 113 kB server bundle  |
| `pnpm start` and HTTP GET `/` | Pass, HTTP 200, homepage renders with navigation and hero    |
| `pnpm test`                | 131 passed, 41 failed, 58 skipped                             |

The 41 test failures all trace to the absence of a MySQL server: `db` is `null`,
producing `Database not available` and `Cannot read properties of null (reading
'select')`. The suite is written against a live database rather than a mocked
one. No failure was attributable to the source itself. Point `DATABASE_URL` at a
MySQL instance and run `pnpm db:push` before judging the suite.

### Known gaps in this clone

- **Media assets are absent.** Images are referenced as `/manus-storage/<key>`
  and live in the original project's object storage, not in the archive. Without
  forge credentials the proxy returns 500 and images render broken. This is a
  data gap, not a code gap.
- **The OAuth portal is external.** Admin sign-in points at a hosted provider;
  no local substitute is included.
- **The database is empty.** Real site content lives in the production database.
  `seed-content.mjs` provides representative sample data only.

## Licence

MIT, per `package.json`.
