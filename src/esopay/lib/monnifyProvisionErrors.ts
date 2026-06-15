import type { EsoPayApiError } from '@/esopay/api/client';

const DEV_MONNIFY_HINT =
  'In Supabase → Edge Functions → Secrets, add MONNIFY_API_KEY, MONNIFY_SECRET_KEY, MONNIFY_CONTRACT_CODE, and MONNIFY_ENV (sandbox or production), then redeploy eso-pay-api.';

const SUPPORT_SUFFIX = 'If this keeps happening, contact support@esoenergy.com.';

function withDevHint(userMessage: string): string {
  if (!__DEV__) return `${userMessage} ${SUPPORT_SUFFIX}`;
  return `${userMessage} ${DEV_MONNIFY_HINT}`;
}

/** User-facing copy for wallet fund / reserved-account provisioning failures. */
export function getMonnifyProvisionErrorMessage(error: EsoPayApiError): string {
  if (error.code === 'AUTH_SESSION_MISSING' || error.status === 401) {
    return 'Your Eso Pay session expired. Sign in again with your email code.';
  }
  if (error.code === 'MONNIFY_NOT_CONFIGURED') {
    return withDevHint('Wallet setup is temporarily unavailable.');
  }
  if (error.code === 'MONNIFY_AUTH_FAILED') {
    return withDevHint('We could not connect to our payment partner. Try again shortly.');
  }
  if (error.code === 'PROVISION_TIMEOUT') {
    return withDevHint('Bank account setup timed out. Tap Try again.');
  }
  if (error.code === 'MONNIFY_KYC_REQUIRED') {
    return error.message || 'Add your BVN or NIN to activate your wallet.';
  }
  if (error.code === 'RESERVED_ACCOUNT_UNAVAILABLE') {
    return (
      error.message ||
      withDevHint('We could not create your virtual account. Tap Try again.')
    );
  }
  const fallback = error.message || 'Could not load bank details. Tap Try again.';
  if (/supabase|monnify_|edge function|secret/i.test(fallback)) {
    return withDevHint('Wallet setup failed. Tap Try again.');
  }
  return fallback;
}

export function getMonnifyProvisionLoadingHint(): string {
  if (__DEV__) {
    return 'Usually under 20 seconds. If this fails, confirm Monnify secrets are set on Supabase.';
  }
  return 'Usually under 20 seconds. Keep this screen open while we set up your account.';
}
