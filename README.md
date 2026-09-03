# Civora Web

Next.js frontend for the Civora ecosystem.

## Platform baseline

- Node.js 24 LTS
- pnpm 11.25.0
- Next.js 16.3.3
- React 19.2.7
- TypeScript 6.0.3
- Tailwind CSS 4.3.3
- TanStack Query 5.102.8
- React Hook Form 7.87.0
- Zod 4.5.4
- Lucide React
- Vitest + React Testing Library
- Playwright

TypeScript 6.0.3 is intentionally pinned because it is compatible with the active ESLint/typescript-eslint toolchain used by the project; TypeScript 7 is not part of the accepted Phase 01 baseline.

## Local development

Use Node 24 and the repository-pinned pnpm version:

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
cp .env.example .env.local
pnpm install
pnpm dev
```

Default web URL: `http://localhost:3000`.

The platform page calls `GET /api/v1/system/ping` on `civora-api`. Start the API on `http://localhost:8080` or change `NEXT_PUBLIC_API_URL`.

## Local verification

GitHub Actions are intentionally disabled/deferred while Actions minutes are constrained. Run the same quality gates locally before merging changes:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

The platform smoke test covers the foundation shell and API connectivity states. Business E2E flows are added by their owning phases.

## Architecture convention

Business UI belongs under `src/features/<domain>` and is owned by the corresponding Civora module. Shared platform primitives belong in `src/lib`, `src/components`, and app-level providers.

The shared API client under `src/lib/api` remains the single platform HTTP extension point. The frontend is never the authorization boundary; protected business operations must be enforced by `civora-api`.

## Current scope

Phase 01 contains Platform Foundation only. Authentication, organizations, membership/RBAC, events, volunteering, impact, needs, and notifications belong to later phases.
