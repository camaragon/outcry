# Outcry — Deployment Notes

## Required Environment Variables

Set all of the following in your Vercel project settings (values omitted — never commit secrets):

```
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RESEND_API_KEY
```

> **Note:** `NEXT_PUBLIC_APP_URL` should be set to `https://outcry.app` in production (not localhost).

---

## Cloudflare DNS Setup

Add the following DNS record in Cloudflare for the `outcry.app` domain:

| Type  | Name | Target                   | Proxy |
|-------|------|--------------------------|-------|
| CNAME | @    | cname.vercel-dns.com     | DNS only (grey cloud) |

- If using `www`, add a second CNAME: `www` → `cname.vercel-dns.com`
- **Disable Cloudflare proxy (orange cloud)** for the Vercel CNAME — Vercel manages its own TLS and CDN. Use "DNS only" mode.

---

## Vercel Deployment — Step by Step

### 1. Connect GitHub Repository
1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New Project"**.
3. Import the `camaragon/outcry` GitHub repository.
4. Select the **main** branch for production deployments.

### 2. Configure Build Settings
- **Framework Preset:** Next.js (Vercel auto-detects this)
- **Build Command:** `next build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (or `pnpm install` if using pnpm)

### 3. Add Environment Variables
1. Go to **Project Settings → Environment Variables**.
2. Add every variable listed above with production values.
3. Make sure `NEXT_PUBLIC_*` variables are set for all environments (Production, Preview, Development).
4. For `STRIPE_WEBHOOK_SECRET`, use the production webhook secret (create a new Stripe webhook endpoint pointing to `https://outcry.app/api/webhooks/stripe`).

### 4. Set Up Custom Domain
1. Go to **Project Settings → Domains**.
2. Add `outcry.app`.
3. Vercel will verify the CNAME record from Cloudflare.
4. TLS certificate is provisioned automatically.

### 5. Deploy
1. Push to `main` — Vercel auto-deploys.
2. Verify the deployment at `https://outcry.app`.
3. Test Stripe webhooks, Clerk auth, and database connectivity.

### 6. Post-Deploy Checklist
- [ ] Verify Clerk sign-in/sign-up flows work
- [ ] Verify Stripe checkout creates subscriptions
- [ ] Verify Stripe webhook receives events
- [ ] Verify Neon database is reachable (run a test query)
- [ ] Verify email notifications send via Resend
- [ ] Verify subdomain routing (e.g., `test.outcry.app`)
- [ ] Verify AI duplicate detection triggers on post creation
