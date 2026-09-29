# Cloudflare Deployment Guide

The application is a Cloudflare Worker serving the Vite SPA, a D1 database for catalogue/content, and an R2 bucket for images. No Firebase credentials are used by the frontend or Worker.

## Prerequisites

Install and authenticate Wrangler:

```bash
npm install
npm run wrangler -- login
```

On Windows paths containing `&`, use the repository scripts (`npm run deploy`, `npm run db:migrate`) because they invoke Wrangler through Node directly.

## Create Cloudflare resources

```bash
npm run wrangler -- d1 create cakesnmore
npm run wrangler -- r2 bucket create cakesnmore
```

Copy the D1 database ID into `wrangler.toml` in place of `REPLACE_WITH_D1_DATABASE_ID`.

Apply the schema locally or remotely:

```bash
npm run db:migrate
npm run db:migrate -- --remote
```

The first public API request seeds products, categories, store settings, delivery settings, and homepage content from the existing catalogue defaults if the products table is empty.

## Configure admin authentication

The Worker never receives Firebase credentials and never exposes R2 credentials. Set a strong password hash and signing secret as Wrangler secrets.

Generate a PBKDF2 hash:

```bash
node scripts/hash-admin-password.mjs
```

Then configure the Worker:

```bash
npm run wrangler -- secret put ADMIN_PASSWORD_HASH
npm run wrangler -- secret put SESSION_SECRET
```

`ADMIN_EMAIL` is a non-secret variable in `wrangler.toml`; edit it before deployment if needed. The browser receives only an HttpOnly, Secure, SameSite session cookie after login.

## Build and deploy

```bash
npm run lint
npm run build
npm run deploy
```

`wrangler.toml` maps `dist/` to Worker static assets, configures SPA fallback, runs the dynamic `/sitemap.xml` and `/robots.txt` routes through the Worker, binds D1 as `DB`, and binds R2 as `MEDIA`. Public reads are available under `/api/products`, `/api/categories`, `/api/settings/store`, `/api/settings/delivery`, and `/api/homepage/config`. Admin writes and media operations require the admin session.

## Local development

Build first, then run the Worker with bindings:

```bash
npm run build
npm run dev:worker
```

The Vite-only command (`npm run dev`) is still available for UI work and uses cached public data when the Worker API is not running. To use a separately hosted API, set `VITE_API_BASE_URL` in `.env` and configure the Worker's `CORS_ORIGIN` variable with the exact frontend origin. Multiple origins may be comma-separated.

## Custom domain and verification

Attach the Worker to the production domain in Cloudflare Workers & Pages. Confirm:

- `/`, `/shop`, and `/admin/login` load through SPA fallback.
- Public catalogue and category reads return data from D1.
- Admin login creates a session and unauthorized write/upload requests return `401`.
- Product image upload, gallery deletion, and `/media/...` delivery work through R2.
- Delivery-radius settings save and are reflected on the storefront.
- WhatsApp links, sitemap, robots file, and SEO metadata point to the production domain.
