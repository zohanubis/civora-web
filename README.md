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
- Supabase JS + `@supabase/ssr`
- Vitest + React Testing Library
- Playwright

TypeScript 6.0.3 is intentionally pinned because it is compatible with the active ESLint/typescript-eslint toolchain used by the project; TypeScript 7 is not part of the accepted baseline.

## Local development

Use Node 24 and the repository-pinned pnpm version:

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
cp .env.example .env.local
pnpm install
pnpm dev
```

Configure `.env.local` with:

```text
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

Only the modern Supabase publishable key belongs in browser configuration. Database passwords, secret keys, and service-role credentials must never use `NEXT_PUBLIC_*` variables.

Default web URL: `http://localhost:3000`.

For email confirmation and password recovery, configure the hosted Supabase Auth URL allowlist to include the local callback path (for example `http://localhost:3000/**`) and exact production callback URLs before production use.

## Phase 02 routes

- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/reset-password`
- `/auth/callback`
- `/app` — authenticated Organization workspace

The browser stores/refreshes the Supabase session through the SSR cookie integration. Protected server pages use verified Supabase claims. The raw access token is forwarded only as `Authorization: Bearer ...` to `civora-api`; the frontend is not the business authorization boundary.

## Local verification

GitHub Actions are intentionally disabled/deferred while Actions minutes are constrained. Run quality gates locally before release acceptance:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

The Phase 02 E2E flow can use runtime-only credentials:

```text
E2E_USER_EMAIL=<managed test account>
E2E_USER_PASSWORD=<runtime secret>
```

Never commit those values.

The repository currently has a named verification debt to generate and commit `pnpm-lock.yaml` with Node 24 + pnpm 11.25.0 once a network-enabled project runtime is available. Do not claim frozen dependency installation until that debt is cleared.

## Architecture convention

Business UI belongs under `src/features/<domain>`. Shared platform primitives belong under `src/lib`, `src/components`, and app-level providers.

The shared API client under `src/lib/api` remains the single Civora HTTP extension point. Phase 02 extends it with bearer-token support rather than creating a second client. Protected business operations remain enforced by `civora-api`.

## Current scope

Phase 02 owns Identity & Organization only: Supabase Auth UX/session integration, application-user provisioning, Organization CRUD/archive UI, and owner workspace behavior. Invitations, member lifecycle, reusable RBAC/permissions, events, volunteering, impact, and needs remain outside this phase.
