# Prince Math Academy

Grade 10-12 mathematics tutoring app. React + Vite + Tailwind, Express API (`server/app.js`), Supabase database and storage, PayFast subscriptions.

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the values.
3. Run the latest `supabase/schema.sql` in the Supabase SQL editor (safe to re-run; required for verified video views and one-vote-per-user forum voting).
4. Terminal 1: `node server/index.js` (API on port 3001). Terminal 2: `npm run dev` (app on port 5000).
5. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` for password-reset email. Gmail requires an app password. Reset requests return an error until SMTP is configured and delivery succeeds; reset codes are never written to server logs.

## Deploy to Netlify

1. Push the repo and connect it in Netlify. Build settings come from `netlify.toml`.
2. Add the environment variables from `.env.example` in Site configuration -> Environment variables.
   - `APP_ORIGIN` must be the live site URL, e.g. `https://www.princemath.co.za` (used for CORS and PayFast return/notify/cancel URLs).
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `JWT_SECRET` are required.
   - `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE`, and `PAYFAST_SANDBOX` must match your PayFast configuration (`PAYFAST_SANDBOX=false` for live payments).
   - Configure SMTP variables with valid credentials so password-reset emails can be delivered.
   - `VITE_API_BASE_URL` is already set to `/api` in `netlify.toml` for production builds.
3. Re-run `supabase/schema.sql` in the Supabase SQL editor when schema changes are deployed.
4. Make an admin by setting `role` to `admin` for your user in the Supabase `users` table.

## Security notes

- RLS is on for every table; only the API (service-role key) reads or writes data.
- Passwords use bcrypt, sessions use short-lived JWTs, and auth routes are rate limited.
- PayFast payments are only activated after signature, merchant, and PayFast server confirmation checks.
- Notes and new video uploads go to a private bucket and are served through short-lived signed links, and only to learners with access.
- Notes downloads are limited per day and per lesson (`DOWNLOAD_LIMIT_PER_DAY`, `DOWNLOAD_LIMIT_PER_LESSON`).
