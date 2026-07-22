# Elevex Frontend

Next.js App Router UI for Elevex (internship management).

## Setup

```bash
cp .env.example .env.local
# LARAVEL_API_URL=http://localhost:8000
npm install
npm run dev
```

Requires the Laravel API running (see root [README.md](../README.md)).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npx tsc --noEmit` — typecheck

## Deploy (Vercel)

1. Project **Root Directory**: `frontend`
2. Env: `LARAVEL_API_URL=https://<railway-laravel-url>` (no trailing slash)
3. Framework preset: Next.js ([`vercel.json`](./vercel.json))

Browser calls go to `/api/*`; the route proxy forwards to Laravel with Sanctum cookies.

## Notes

- Roles land on `/admin/dashboard` or `/intern/dashboard` after login.
