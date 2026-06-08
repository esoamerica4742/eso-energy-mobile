/**
 * Quick probe for mobile .env Supabase config (no secrets printed).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');
const env = {};
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

const url = env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const refMatch = url.match(/https:\/\/([^.]+)\.supabase\.co/);
const ref = refMatch?.[1] ?? '?';
const jwtRef = key.startsWith('eyJ')
  ? JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).ref
  : null;

console.log('Project ref (URL):', ref);
console.log('Anon key format:', key.startsWith('eyJ') ? 'JWT OK' : key ? 'INVALID (need eyJ...)' : 'MISSING');
console.log('JWT matches URL ref:', jwtRef === ref ? 'yes' : jwtRef ? `no (JWT ref=${jwtRef})` : 'n/a');

const sb = createClient(url, key || 'invalid');

const authRes = await fetch(`${url}/auth/v1/settings`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
console.log('Auth API:', authRes.ok ? 'OK' : `HTTP ${authRes.status}`);
if (authRes.ok) {
  const settings = await authRes.json();
  const email = settings.external?.email ?? settings.email;
  const phone = settings.external?.phone ?? settings.phone;
  console.log('  Email provider:', email ? 'enabled' : 'off');
  console.log('  Phone provider:', phone ? 'enabled' : 'off');
}

const { error: profilesErr } = await sb.from('profiles').select('id').limit(1);
if (!profilesErr) {
  console.log('Database profiles table: OK');
} else {
  console.log('Database profiles table:', profilesErr.code ?? profilesErr.message);
}

for (const fn of ['eso-pay-api', 'enode-api']) {
  const res = await fetch(`${url}/functions/v1/${fn}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  console.log(`Edge ${fn}:`, res.status === 404 ? 'not deployed' : `HTTP ${res.status}`);
}

const { error: otpErr } = await sb.auth.signInWithOtp({
  email: 'probe-invalid@eso-energy.invalid',
  options: { shouldCreateUser: false },
});
console.log(
  'Email OTP endpoint:',
  otpErr?.message?.includes('Signups not allowed') ||
    otpErr?.message?.includes('User not found') ||
    !otpErr
    ? 'reachable'
    : otpErr.message,
);
