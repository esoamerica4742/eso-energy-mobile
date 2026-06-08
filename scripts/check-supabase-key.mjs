/**
 * Verifies the mobile Supabase key can call Auth OTP.
 * Usage: node scripts/check-supabase-key.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

if (!existsSync(envPath)) {
  console.error('Missing .env — copy .env.example and add your JWT anon key.');
  process.exit(1);
}

const env = readFileSync(envPath, 'utf8');
const url = env.match(/EXPO_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, '');
const key =
  env.match(/EXPO_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, '') ||
  env.match(/EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(.+)/)?.[1]?.trim().replace(/^["']|["']$/g, '');

if (!url || !key) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

if (key.startsWith('sb_publishable_')) {
  console.error('✗ sb_publishable_* keys do not work for email OTP.');
  console.error('  Use JWT anon key (eyJ...) from Supabase Dashboard → Settings → API → anon public');
  process.exit(1);
}

const res = await fetch(`${url}/auth/v1/otp`, {
  method: 'POST',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: 'key-check@example.com', create_user: true }),
});

const body = await res.json();
if (res.status === 401 || body?.message === 'Invalid API key') {
  console.error('✗ Invalid API key — paste the correct JWT anon key into EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('✓ Supabase auth key is valid (OTP endpoint accepted the request)');
if (body?.msg) console.log(' ', body.msg);
