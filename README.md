# Civora Web

Next.js frontend for the Civora ecosystem.

## Platform baseline

- Node.js 24 LTS
- pnpm 11.25.0
- Next.js 16.3.3 (Active LTS)
- React 19.2.7
- TypeScript 7
- Tailwind CSS 4
- TanStack Query 5
- React Hook Form 7
- Zod 4
- Lucide React

## Local development

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Default web URL: `http://localhost:3000`.

The platform page calls `GET /api/v1/system/ping` on civora-api. Start the API on `http://localhost:8080` or change `NEXT_PUBLIC_API_URL`.

## Architecture convention

Business UI belongs under `src/features/<domain>` and is owned by the corresponding Civora module. Shared platform primitives belong in `src/lib`, `src/components`, and app-level providers.

The frontend is never the authorization boundary; protected business operations must be enforced by civora-api.

## Current status

This branch contains Platform Foundation only. Authentication, organizations, events, volunteering, impact, needs, and notifications are implemented by their owning modules.
