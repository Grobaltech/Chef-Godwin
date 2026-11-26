# Chef Godwin Uganda

The Chef Godwin public website, PWA and Android app, connected to a live Supabase-powered customer management workspace.

**Stack:** React 18, Vite, Tailwind CSS, Animate.css + WOW.js, Supabase Auth/Postgres, Cloudflare Worker + static assets, Cloudflare Turnstile and Capacitor Android.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The public catering and cooking-school forms submit to `POST /api/lead`. Local Worker API testing can use Wrangler:

```bash
npm run build
npx wrangler dev
```

## Live Supabase project

The application is connected to the existing Chef Godwin Supabase project. **Do not run the old `supabase/schema.sql` setup instructions or create a separate `admins` table.** The live database already contains the website content, bookings, applications, customers, CRM activities, events, payments and staff-profile tables, with row-level security enabled.

Staff authentication is invitation-only:
- The existing Super Administrator account is the root `owner`.
- Staff are invited from **Staff & access** inside the management workspace.
- Available staff roles are Administrator, Manager, Content editor, Chef, Events, Admissions, Finance and Receptionist.
- Role permissions are enforced by Supabase RLS policies. The service-role key is only used inside the Cloudflare Worker and must never be added to frontend variables.

## Cloudflare deployment

Deploy through the Cloudflare dashboard's Git-connected Workers & Pages build. The repository is configured with:
- Build command: `npm run build`
- Build output directory: `dist`
- Worker entry point: `src/worker.js`
- Static assets directory/binding: `dist` / `ASSETS`

The Worker handles `POST /api/lead` and the owner-only `POST /api/staff/invite`. Keep the Worker entry point and assets binding in `wrangler.toml`. Do not add a Wrangler deploy command, API token or account ID to GitHub Actions for dashboard-managed deployment.

### Frontend build variables

Set these as **build-time variables** in the Cloudflare build environment, for both Production and Preview if you use Preview deployments:

- `VITE_SUPABASE_URL=https://tkhavvmijmwajtcyqklm.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = the project's active publishable key
- `VITE_WHATSAPP_NUMBER` = international digits, for example `2567XXXXXXXX`
- `VITE_TURNSTILE_SITE_KEY` = the public Turnstile site key, if enabled
- `VITE_API_BASE` = leave empty for the live website so API requests use the same origin

The publishable key is designed for browser use. Never use a Supabase secret/service-role key as a `VITE_*` variable.

### Worker runtime variables and secrets

Set these in the Worker runtime environment:

- `SUPABASE_URL` = the Supabase project URL
- `SUPABASE_SERVICE_KEY` = the Supabase service-role/secret key (**secret**)
- `TURNSTILE_SECRET` = the private Turnstile secret, if enabled

Keep the service key secret. It is required by the Worker to save public enquiries and securely invite staff after verifying that the caller is the active Super Administrator.

## Management workspace

Open `/login` or `/admin` to access the staff login. The dashboard includes:
- Enquiry pipeline, catering bookings and cooking-school applications
- Customers, follow-up activities and events
- Payments
- Website pages, services, courses, menu, gallery and testimonials
- Staff profiles, role assignment and suspension controls
- Website settings

Public website sections read published services, courses, menu items and testimonials from Supabase. New public enquiries are stored in the relevant booking/application records.

## Android APK

The APK wraps the built site with Capacitor.

```bash
npm run cap:add
npm run apk:debug
```

A local Android build requires JDK 17 and Android Studio. Keep signing keystores out of Git. Configure `VITE_API_BASE` to the live Worker/site origin when building an APK that must submit forms to the hosted API.

## Brand and content

- `src/config.js` contains fallback brand details, WhatsApp number, event types and course labels.
- Published website content is managed from the staff workspace and stored in Supabase.
- Add the approved Chef Godwin photos to `public/` and manage public-facing image URLs through the content records.
