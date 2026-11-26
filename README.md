# Chef Godwin Uganda

Website, PWA and Android app for Chef Godwin's catering and cooking school.

Stack: React + Tailwind, Animate.css + WOW.js, Vite PWA, Cloudflare Pages + Pages Functions, Cloudflare Turnstile, Supabase (Postgres), Capacitor (Android APK).

Brand palette: forest green (#0B3B2E), warm gold (#D8A52B), deep red (#A52A2A), and cream (#FFF9E8).
The supplied emblem is stored at `public/logo.jpg` and used in the website header and PWA icon.

## 1. Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The lead forms submit to the same-origin `/api/lead` Cloudflare Pages Function. For local API testing, configure `.dev.vars` from `.dev.vars.example` and run:

```bash
npm run build
npx wrangler pages dev dist
```

## 2. Supabase

1. Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
2. Copy the project URL and service-role key. Keep the service-role key secret.
3. Create the administrator accounts and add their user IDs to the `admins` table as required by the schema.

## 3. Deploy directly from the Cloudflare dashboard — no API token

Use **Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git** and select this GitHub repository.

Set the Pages build configuration:

- Framework preset: **Vite** (or None)
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

Cloudflare's Git integration handles deployment authentication through the dashboard connection. Do not add a Wrangler deployment command, Cloudflare API token, or account ID to GitHub Actions. Pages builds and publishes the site directly from the connected repository.

The `wrangler.toml` file identifies this as a Pages project. The `functions/api/lead.js` file is intentionally retained: Cloudflare Pages deploys it as the `POST /api/lead` endpoint alongside the static website.

### Cloudflare Pages environment variables and secrets

In **Workers & Pages → your Pages project → Settings → Variables and Secrets**, configure:

Build-time variables:
- `VITE_TURNSTILE_SITE_KEY`
- `VITE_WHATSAPP_NUMBER` (international digits, e.g. `2567XXXXXXXX`)

Function secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` (service-role key; secret)
- `TURNSTILE_SECRET` (secret)

Leave `VITE_API_BASE` empty for the live website so the forms use the same-origin `/api/lead` endpoint.

Add the custom domain `chefgodwinuganda.com` in the Pages project's Custom domains settings.

## 4. Android APK

The APK wraps the built site with Capacitor.

- In GitHub: Actions → **Build Android APK** → Run workflow. Download the generated APK artifact.
- Locally (needs JDK 17 and Android Studio):

  ```bash
  npm run cap:add      # first time only, creates android/
  npm run apk:debug    # output: android/app/build/outputs/apk/debug/app-debug.apk
  ```

Debug APKs install directly on phones. For Google Play you need a signed release build (keystore + `npm run apk:release`). Keep the keystore out of Git.

App id is `com.chefgodwin.uganda` in `capacitor.config.json`. Change it before publishing, because it cannot change later.

## 5. Replace placeholders

- `src/config.js`: WhatsApp number, course list, event types, tagline
- Add Chef Godwin's photos and TikTok/YouTube links

## Next

Admin dashboard (Supabase Auth), courses and menu loaded from Supabase, photo gallery on R2.
