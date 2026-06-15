import { bindEsoPayApiCredentials, esoPayApi } from '@/esopay/api/client';
import {
  ensureEsoPayApiSession,
  refreshEsoPayAccessToken,
} from '@/esopay/auth/ensureEsoPayApiSession';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { hasTransactionPin } from '@/esopay/storage/transactionPin';

async function bindEsoPayApiFromSession(): Promise<boolean> {
  try {
    const token = await ensureEsoPayApiSession();
    const userId = useEsoPayAuthStore.getState().user?.id;
    if (!token || !userId) return false;

    bindEsoPayApiCredentials({
      authToken: token,
      companyId: userId,
      refreshAuthToken: refreshEsoPayAccessToken,
      ensureAuthSession: ensureEsoPayApiSession,
      onSessionExpired: () => {
        useEsoPayAuthStore.getState().setSession(null);
      },
    });
    return true;
  } catch {
    return false;
  }
}

/** Local secure storage or BFF — for routing after sign-in. */
export async function isTransactionPinConfigured(userId: string): Promise<boolean> {
  if (!userId) return false;
  if (await hasTransactionPin(userId)) return true;

  const apiReady = await bindEsoPayApiFromSession();
  if (!apiReady) return false;

  try {
    const status = await esoPayApi.security.getTransactionPinStatus();
    return status.configured;
  } catch {
    return false;
  }
}
