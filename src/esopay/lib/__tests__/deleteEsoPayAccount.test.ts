import { deleteEsoPayAccount } from '@/esopay/lib/deleteEsoPayAccount';
import { EsoPayApiError, esoPayApi } from '@/esopay/api/client';
import { signOutEsoPay } from '@/esopay/auth/signOutEsoPay';
import { clearTransactionPin } from '@/esopay/storage/transactionPin';
import { clearAllBeneficiaries } from '@/esopay/storage/beneficiaries';
import { clearNotificationPreferences } from '@/esopay/storage/notificationPreferences';

jest.mock('@/esopay/api/client', () => {
  const actual = jest.requireActual<typeof import('@/esopay/api/client')>('@/esopay/api/client');
  return {
    ...actual,
    esoPayApi: {
      profile: {
        deleteAccount: jest.fn(),
      },
    },
  };
});

jest.mock('@/esopay/auth/signOutEsoPay', () => ({
  signOutEsoPay: jest.fn(),
}));

jest.mock('@/esopay/storage/transactionPin', () => ({
  clearTransactionPin: jest.fn(),
}));

jest.mock('@/esopay/storage/beneficiaries', () => ({
  clearAllBeneficiaries: jest.fn(),
}));

jest.mock('@/esopay/storage/notificationPreferences', () => ({
  clearNotificationPreferences: jest.fn(),
}));

describe('deleteEsoPayAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('clears local data and signs out when server returns 404', async () => {
    (esoPayApi.profile.deleteAccount as jest.Mock).mockRejectedValue(
      new EsoPayApiError('not found', 404),
    );
    const result = await deleteEsoPayAccount('user-1', 'co-1');
    expect(result).toEqual({ ok: true, serverDeleted: false });
    expect(clearTransactionPin).toHaveBeenCalledWith('user-1');
    expect(clearAllBeneficiaries).toHaveBeenCalledWith('co-1');
    expect(clearNotificationPreferences).toHaveBeenCalledWith('user-1');
    expect(signOutEsoPay).toHaveBeenCalled();
  });

  it('reports server success', async () => {
    (esoPayApi.profile.deleteAccount as jest.Mock).mockResolvedValue({ ok: true });
    const result = await deleteEsoPayAccount('user-1', 'co-1');
    expect(result).toEqual({ ok: true, serverDeleted: true });
  });
});
