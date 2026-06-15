import { bindEsoPayApiCredentials, esoPayApi } from '@/esopay/api/client';
import {
  ensureEsoPayApiSession,
  refreshEsoPayAccessToken,
} from '@/esopay/auth/ensureEsoPayApiSession';
import { useEsoPayAuthStore } from '@/esopay/auth/store';

async function bindEsoPayApiFromSession(): Promise<void> {
  const token = await ensureEsoPayApiSession();
  const userId = useEsoPayAuthStore.getState().user?.id;
  if (!userId) {
    throw new Error('Sign in to Eso Pay to continue.');
  }

  bindEsoPayApiCredentials({
    authToken: token,
    companyId: userId,
    refreshAuthToken: refreshEsoPayAccessToken,
    ensureAuthSession: ensureEsoPayApiSession,
    onSessionExpired: () => {
      useEsoPayAuthStore.getState().setSession(null);
    },
  });
}

/** After email OTP — opens a 30-minute server recovery window for forgot PIN. */
export async function beginEsoPayPinRecovery(): Promise<void> {
  await bindEsoPayApiFromSession();
  await esoPayApi.security.beginTransactionPinRecovery();
}
