# Chef Godwin Uganda

Website, PWA and Android app for Chef Godwin's catering and cooking school.

Stack: React + Tailwind, Animate.css + WOW.js, vite-plugin-pwa, Cloudflare Pages + Pages Functions,
Cloudflare Turnstile, Supabase (Postgres), Capacitor (Android APK), GitHub Actions.

Brand palette: forest green (#0B3B2E), warm gold (#D8A52B), deep red (#A52A2A), and cream (#FFF9E8).
The supplied emblem is stored at `public/logo.jpg` and used in the website header and PWA icon.

## 1. Run locally
```bash
npm install
cp .env.example .env
npm run dev
```
Forms need the API. To test them locally:
```bash
cp .dev.vars.example .dev.vars   # fill in Supabase values
npm run build
npx wrangler pages dev dist
```

## 2. Supabase
1. Create a project, then run `supabase/schema.sql` in the SQL Editor.
2. Settings > API: copy the project URL and the **service_role** key (keep it secret).
3. Authentication > Users: create Chef Godwin's and his manager's accounts, then add each user id to `admins`:
   `insert into admins (user_id) values ('<user-uuid>');`

## 3. Cloudflare
1. Turnstile: create a widget for `chefgodwinuganda.com` and `localhost` (localhost is needed for the Android app). Copy the site key and secret.
2. Pages: create a project named `chef-godwin-uganda` (Direct Upload is fine, GitHub Actions deploys it).
3. Pages > Settings > Variables and secrets, add: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `TURNSTILE_SECRET`.
4. Add the custom domain `chefgodwinuganda.com`.

## 4. GitHub
Repo settings > Secrets and variables > Actions:
- Secrets: `CLOUDFLARE_API_TOKEN` (Pages edit permission), `CLOUDFLARE_ACCOUNT_ID`
- Variables: `VITE_TURNSTILE_SITE_KEY`, `VITE_WHATSAPP_NUMBER` (e.g. 2567XXXXXXXX), `VITE_API_BASE` (https://chefgodwinuganda.com)

Every push to `main` builds and deploys the site.

## 5. Android APK
The APK wraps the built site with Capacitor.
- In GitHub: Actions > "Build Android APK" > Run workflow. Download `chef-godwin-debug-apk`.
- Locally (needs JDK 17 and Android Studio):
  ```bash
  npm run cap:add      # first time only, creates android/
  npm run apk:debug    # output: android/app/build/outputs/apk/debug/app-debug.apk
  ```
- Debug APKs install directly on phones. For Google Play you need a signed release build (keystore + `npm run apk:release`). Keep the keystore out of Git.
- App id is `com.chefgodwin.uganda` in `capacitor.config.json`. Change it before publishing, because it cannot change later.

## 6. Replace placeholders
- `src/config.js`: WhatsApp number, course list, event types, tagline
- Add Chef Godwin's photos and TikTok/YouTube links

## Next
Admin dashboard (Supabase Auth), courses and menu loaded from Supabase, photo gallery on R2.
