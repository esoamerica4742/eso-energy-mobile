import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { isReturningUser } from '@/lib/authProfile';
import {
  friendlySendError,
  friendlyVerifyError,
  isRetryableVerifyError,
} from '@/lib/authOtpMessages';
import { exitDemoModeForRealAuth } from '@/lib/demoModeBridge';
import {
  supabase,
  supabaseConfigured,
  supabaseKeyHelp,
  supabaseUsesPublishableKey,
} from '@/lib/supabase';
import { esoPaySupabase, esoPaySupabaseConfigured } from '@/esopay/lib/supabasePay';

const NOT_CONFIGURED =
  'Email sign-in is not configured. Add EXPO_PUBLIC_SUPABASE_URL and the JWT anon key (eyJ...) to .env, then restart Expo.';

export type OtpSendResult = { ok: true } | { ok: false; error: string };

export type OtpVerifySuccess = {
  ok: true;
  session: Session;
  user: User;
  isReturning: boolean;
};

export type OtpVerifyResult = OtpVerifySuccess | { ok: false; error: string };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && typeof (e as { message?: string }).message === 'string') {
    return (e as { message: string }).message;
  }
  return fallback;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let t: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    t = setTimeout(
      () => reject(new Error(`${label} timed out. Check your network or Supabase Auth settings.`)),
      ms,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (t) clearTimeout(t);
  }
}

/** Sends a 6-digit OTP to the user's email via Supabase Auth. */
export async function sendEmailOtp(
  email: string,
  client: SupabaseClient = supabase,
): Promise<OtpSendResult> {
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

  let error: { message: string } | null = null;
  try {
    const result = await withTimeout(
      client.auth.signInWithOtp({
        email: normalizeEmail(email),
        options: { shouldCreateUser: true },
      }),
      12_000,
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

async function tryVerifyOtp(
  email: string,
  token: string,
  type: 'email' | 'signup',
  client: SupabaseClient,
) {
  return withTimeout(
    client.auth.verifyOtp({
      email: normalizeEmail(email),
      token,
      type,
    }),
    12_000,
    'Email OTP verification',
  );
}

/** Verifies the 6-digit email OTP and establishes a session. */
export async function verifyEmailOtp(
  email: string,
  token: string,
  client: SupabaseClient = supabase,
): Promise<OtpVerifyResult> {
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
  let data: { session: Session | null; user: User | null } | null = null;
  let lastError: { message: string } | null = null;

  try {
    const verifyTypes: Array<'email' | 'signup'> = ['email', 'signup'];
    for (const type of verifyTypes) {
      const result = await tryVerifyOtp(email, otpToken, type, client);
      if (!result.error && result.data?.session) {
        data = result.data;
        lastError = null;
        break;
      }
      lastError = result.error;
      if (!result.error || !isRetryableVerifyError(result.error.message)) {
        break;
      }
    }
  } catch (e) {
    return { ok: false, error: errMsg(e, 'Verification failed.') };
  }

  if (!data?.session) {
    return {
      ok: false,
      error: friendlyVerifyError(lastError?.message ?? 'Verification failed.'),
    };
  }

  exitDemoModeForRealAuth();

  const user = data.user ?? (await client.auth.getUser()).data.user;
  if (!user) {
    return { ok: false, error: 'Verification succeeded but user profile is missing.' };
  }

  return {
    ok: true,
    session: data.session,
    user,
    isReturning: isReturningUser(user),
  };
}

/** Eso Pay OTP — session lands on the isolated esopay_auth Supabase client. */
export function sendEsoPayEmailOtp(email: string): Promise<OtpSendResult> {
  return sendEmailOtp(email, esoPaySupabase);
}

export function verifyEsoPayEmailOtp(email: string, token: string): Promise<OtpVerifyResult> {
  return verifyEmailOtp(email, token, esoPaySupabase);
}

export { supabaseConfigured };
