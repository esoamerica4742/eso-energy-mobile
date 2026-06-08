# Monnify sandbox — mobile app only

The **phone never talks to Monnify directly**. Monnify keys live in **Supabase** (edge functions).  
The mobile app only needs Supabase URL + anon key + the Eso Pay API URL below.

---

## What you put in `eso-energy-mobile/.env` (only this)

```env
EXPO_PUBLIC_SUPABASE_URL=https://pndsuzscjedumjhadtio.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-jwt...

EXPO_PUBLIC_ESO_PAY_API_URL=https://pndsuzscjedumjhadtio.supabase.co/functions/v1/eso-pay-api
```

Do **not** add `MONNIFY_API_KEY` or `MONNIFY_SECRET_KEY` to the mobile app.

Restart after edits:

```powershell
cd eso-energy-mobile
npx expo start -c
```

---

## What you do in Supabase (one-time, in the browser)

Project: [pndsuzscjedumjhadtio](https://supabase.com/dashboard/project/pndsuzscjedumjhadtio)

### 1. Payments database

**SQL → New query** → run the file from the backend repo (copy/paste):

`eso-energy-com/supabase/migrations/20260528120000_payments_monnify.sql`

(Or ask someone to run `npm run db:migrate` once with `DATABASE_URL`.)

### 2. Monnify secrets (edge only)

**Project Settings → Edge Functions → Secrets** (or CLI from backend repo):

| Secret | Value |
|--------|--------|
| `MONNIFY_ENV` | `sandbox` |
| `MONNIFY_API_KEY` | From Monnify Developer |
| `MONNIFY_SECRET_KEY` | From Monnify Developer |
| `MONNIFY_CONTRACT_CODE` | From Monnify Developer |
| `SUPABASE_URL` | `https://pndsuzscjedumjhadtio.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | From API settings (server only) |
| `SUPABASE_ANON_KEY` | Same anon JWT as mobile |

### 3. Deploy functions (one-time)

From a PC with the backend repo + Supabase CLI:

```powershell
cd eso-energy-com
npx supabase login
npx supabase link --project-ref pndsuzscjedumjhadtio
npx supabase functions deploy monnify-webhook --no-verify-jwt
npx supabase functions deploy eso-pay-api
```

You do **not** need a full `eso-energy-com/.env` on your machine if secrets are set in the Supabase dashboard.

### 4. Monnify webhook

Monnify Dashboard → **Settings → Webhooks**:

```
https://pndsuzscjedumjhadtio.supabase.co/functions/v1/monnify-webhook
```

### 5. User must have a company

After first email login, ensure `profiles.company_id` is set (SQL or one-time bootstrap from backend).

---

## Test on the phone

1. Sign in (email).  
2. **Eso Pay → Bills**.  
3. **Fund wallet** — NUBAN should show.  
4. Monnify sandbox transfer → balance updates.  
5. Set **transaction PIN** (Home or Settings).  
6. **Quick Pay** — validate + pay.

---

## If something fails

| Symptom | Fix |
|---------|-----|
| 401 on wallet | Sign in; check `profiles.company_id` |
| Empty billers | Monnify bills product + call providers once |
| Fund wallet error | Edge secrets + `eso-pay-api` deployed |
| Balance not updating | Webhook URL in Monnify dashboard |

Mobile `.env` is already correct if the three `EXPO_PUBLIC_*` lines above match your project.
