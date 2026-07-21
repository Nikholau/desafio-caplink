# Acme — Technical Test Case

Welcome! Acme is a small but fully-featured post platform: anyone can create and edit posts, and every reader currently viewing a post sees edits appear live, over a GraphQL realtime backplane that fans out across backend replicas via RabbitMQ.

The app works end to end today — but this codebase has been deliberately seeded with bugs across backend domain logic, dependency injection wiring, the realtime/RabbitMQ layer, and the frontend. **Your objective is to find as many bugs as you can and improve the code.**

## Rules

- No hints will be given. Diagnose everything yourself, the way you would on a real codebase you just inherited.
- Some bugs are covered by a failing unit test — that's your objective signal for those. Others only show up by actually running the app and using it.
- Don't assume there's exactly one bug per file, one bug per layer, or that bugs are evenly distributed across the stack.

## Stack

- **Frontend** — React 19, Vite, Tailwind CSS v4, Radix UI, Apollo Client, React Router.
- **Backend** — Node/TypeScript, Express, Apollo Server, `type-graphql`, `tsyringe` for dependency injection, Prisma + PostgreSQL, RabbitMQ.
- **Monorepo** — npm workspaces (`backend`, `frontend`).

## Getting started

```
npm install
docker compose up --watch
```

- Frontend: http://localhost:3000
- Backend GraphQL: http://localhost:8000/graphql
- RabbitMQ management UI: http://localhost:15672 (guest/guest) — useful for inspecting exchange/queue topology if you suspect a realtime issue

## Verifying your fixes

```
npm test
```

Runs the backend's Vitest suite. **Right now this fails** — that's expected. Some of the seeded bugs have a corresponding test; get the whole suite green as part of (not the entirety of) confirming your fixes.

Not everything is covered by an automated test — there's no frontend test runner in this project, so frontend correctness needs to be verified by actually using the app in a browser (try normal flows: creating posts, editing them, watching realtime updates across two tabs, checking the connections dashboard).

```
npm run lint
npm run build
```

Both should stay clean throughout — none of the seeded bugs are compiler or lint errors.
