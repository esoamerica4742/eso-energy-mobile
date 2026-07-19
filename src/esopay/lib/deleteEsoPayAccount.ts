import { toEsoPayApiError } from '@/esopay/api/client';
import { esoPayApi } from '@/esopay/api/client';
import { signOutUnified } from '@/master/signOutUnified';
import { clearTransactionPin } from '@/esopay/storage/transactionPin';
import { clearAllBeneficiaries } from '@/esopay/storage/beneficiaries';
import { clearNotificationPreferences } from '@/esopay/storage/notificationPreferences';

export type DeleteEsoPayAccountResult =
  | { ok: true; serverDeleted: boolean }
  | { ok: false; error: string };

/** Removes Eso Pay data on device and requests server account closure when available. */
export async function deleteEsoPayAccount(userId: string, companyId: string): Promise<DeleteEsoPayAccountResult> {
  let serverDeleted = false;

  try {
    await esoPayApi.profile.deleteAccount();
    serverDeleted = true;
  } catch (error) {
    const apiError = toEsoPayApiError(error);
    if (apiError.status !== 404 && apiError.status !== 501) {
      return {
        ok: false,
        error: apiError.message || 'Could not close your Eso Pay account. Try again or contact support.',
      };
    }
  }

  if (userId) await clearTransactionPin(userId);
  if (companyId) await clearAllBeneficiaries(companyId);
  await clearNotificationPreferences(userId);
  await signOutUnified();

  return { ok: true, serverDeleted };
}
