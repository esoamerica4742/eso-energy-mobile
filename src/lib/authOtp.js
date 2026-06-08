import { isReturningUser } from './authProfile';
import { exitDemoModeForRealAuth } from './demoModeBridge';
import {
  supabase,
  supabaseConfigured,
  supabaseKeyHelp,
  supabaseUsesPublishableKey,
} from './supabase';
import { esoPaySupabase, esoPaySupabaseConfigured } from '@/esopay/lib/supabasePay';

const NOT_CONFIGURED =
  'Email sign-in is not configured. Add EXPO_PUBLIC_SUPABASE_URL and the JWT anon key (eyJ...) to .env, then restart Expo.';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function errMsg(e, fallback) {
  if (e && typeof e === 'object' && typeof e.message === 'string') return e.message;
  return fallback;
}

async function withTimeout(promise, ms, label) {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error(`${label} timed out. Check your network or Supabase Auth settings.`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (t) clearTimeout(t);
  }
}

function friendlySendError(message) {
  const m = message.toLowerCase();
  if (m.includes('invalid api key') || m.includes('invalid apikey')) {
    return supabaseKeyHelp;
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (m.includes('signup') && m.includes('disabled')) {
    return 'Email sign-up is disabled in Supabase. Enable the Email provider for your project.';
  }
  if (m.includes('invalid') && m.includes('email')) {
    return 'Enter a valid work email address.';
  }
  if (m.includes('smtp') || m.includes('mail')) {
    return 'Email could not be sent. Check Supabase Auth email settings (SMTP / templates).';
  }
  if (m.includes('email address not authorized') || m.includes('not authorized')) {
    return 'This email is not allowed for sign-in on this project. Check Supabase Auth allow-list settings.';
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'This email already has an account. Use the same email and enter the new code we send.';
  }
  return message;
}

function friendlyVerifyError(message) {
  const m = message.toLowerCase();
  if (m.includes('invalid api key') || m.includes('invalid apikey')) {
    return supabaseKeyHelp;
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (
    m.includes('invalid') ||
    m.includes('expired') ||
    m.includes('token') ||
    m.includes('otp') ||
    m.includes('does not match')
  ) {
    return "That code doesn't match. Check the 6-digit code in your email and try again.";
  }
  if (m.includes('magiclink') || m.includes('link is invalid')) {
    return 'This project is still sending a sign-in link instead of a 6-digit code. In Supabase → Authentication → Email Templates → Magic Link, use {{ .Token }} only (remove {{ .ConfirmationURL }}). See eso-energy-com/docs/ESO_PAY_EMAIL_OTP.md';
  }
  return message;
}

/**
 * Sends a 6-digit OTP to the user's email via Supabase Auth.
 */
export async function sendEmailOtp(email, client = supabase) {
  if (supabaseUsesPublishableKey) {
    return { ok: false, error: supabaseKeyHelp };
  }
  if (client === supabase && !supabaseConfigured) {
    return { ok: false, error: NOT_CONFIGURED };
  }
  if (client === esoPaySupabase && !esoPaySupabaseConfigured) {
    return { ok: false, error: NOT_CONFIGURED };
  }

  exitDemoModeForRealAuth();

  // No emailRedirectTo — avoids magic-link emails that sign in on tap instead of a 6-digit code.
  let error;
  try {
    const result = await withTimeout(
      client.auth.signInWithOtp({
        email: normalizeEmail(email),
        options: {
          shouldCreateUser: true,
        },
      }),
      12000,
      'Email OTP request',
    );
    error = result.error;
  } catch (e) {
    return { ok: false, error: errMsg(e, 'Could not send verification code') };
  }

  if (error) {
    return { ok: false, error: friendlySendError(error.message) };
  }

  return { ok: true };
}

async function tryVerifyOtp(email, token, type, client = supabase) {
  return withTimeout(
    client.auth.verifyOtp({
      email: normalizeEmail(email),
      token,
      type,
    }),
    12000,
    'Email OTP verification',
  );
}

/**
 * Verifies the 6-digit email OTP, establishes a session, and detects new vs returning user.
 */
export async function verifyEmailOtp(email, token, client = supabase) {
  if (supabaseUsesPublishableKey) {
    return { ok: false, error: supabaseKeyHelp };
  }
  if (client === supabase && !supabaseConfigured) {
    return { ok: false, error: NOT_CONFIGURED };
  }
  if (client === esoPaySupabase && !esoPaySupabaseConfigured) {
    return { ok: false, error: NOT_CONFIGURED };
  }

  const code = token.replace(/\D/g, '').trim();

  if (code.length < 6) {
    return { ok: false, error: 'Enter the full 6-digit code from your email.' };
  }

  const otpToken = code.slice(0, 6);

  // Supabase Email OTP verifies via type "email". (Avoid "signup" here; it can be project-config dependent.)
  const attempts = ['email'];
  let data = null;
  let lastError = null;

  try {
    for (const type of attempts) {
      const result = await tryVerifyOtp(email, otpToken, type, client);
      if (!result.error && result.data?.session) {
        data = result.data;
        lastError = null;
        break;
      }
      lastError = result.error;
      if (result.error && !isRetryableVerifyError(result.error.message)) {
        break;
      }
    }
  } catch (e) {
    return { ok: false, error: errMsg(e, 'Verification failed.') };
  }

  if (!data?.session) {
    return { ok: false, error: friendlyVerifyError(lastError?.message ?? 'Verification failed.') };
  }

  exitDemoModeForRealAuth();

  const user = data.user ?? (await client.auth.getUser()).data.user;

  return {
    ok: true,
    session: data.session,
    user,
    isReturning: isReturningUser(user),
  };
}

/** Eso Pay OTP — session lands on the isolated esopay_auth Supabase client. */
export function sendEsoPayEmailOtp(email) {
  return sendEmailOtp(email, esoPaySupabase);
}

export function verifyEsoPayEmailOtp(email, token) {
  return verifyEmailOtp(email, token, esoPaySupabase);
}

function isRetryableVerifyError(message) {
  const m = message.toLowerCase();
  return (
    m.includes('invalid') ||
    m.includes('expired') ||
    m.includes('token') ||
    m.includes('otp') ||
    m.includes('magiclink') ||
    m.includes('signup')
  );
}

export { supabaseConfigured };
