import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_BENEFICIARIES = 10;
const STORAGE_PREFIX = 'esopay:beneficiaries:';

export type EsoPayBeneficiary = {
  id: string;
  providerId: string;
  providerName: string;
  accountNumber: string;
  customerName: string | null;
  savedAt: string;
};

function storageKey(companyId: string): string {
  return `${STORAGE_PREFIX}${companyId}`;
}

export async function loadBeneficiaries(companyId: string): Promise<EsoPayBeneficiary[]> {
  if (!companyId) return [];
  try {
    const raw = await AsyncStorage.getItem(storageKey(companyId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EsoPayBeneficiary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveBeneficiaries(
  companyId: string,
  beneficiaries: EsoPayBeneficiary[],
): Promise<void> {
  if (!companyId) return;
  await AsyncStorage.setItem(storageKey(companyId), JSON.stringify(beneficiaries));
}

export async function upsertBeneficiary(
  companyId: string,
  input: Omit<EsoPayBeneficiary, 'id' | 'savedAt'> & { id?: string },
): Promise<EsoPayBeneficiary[]> {
  const existing = await loadBeneficiaries(companyId);
  const normalizedAccount = input.accountNumber.trim();
  const withoutDuplicate = existing.filter(
    (item) =>
      !(
        item.providerId === input.providerId &&
        item.accountNumber.trim() === normalizedAccount
      ),
  );

  const entry: EsoPayBeneficiary = {
    id: input.id ?? `${input.providerId}:${normalizedAccount}:${Date.now()}`,
    providerId: input.providerId,
    providerName: input.providerName,
    accountNumber: normalizedAccount,
    customerName: input.customerName,
    savedAt: new Date().toISOString(),
  };

  const next = [entry, ...withoutDuplicate].slice(0, MAX_BENEFICIARIES);
  await saveBeneficiaries(companyId, next);
  return next;
}

export async function removeBeneficiary(
  companyId: string,
  beneficiaryId: string,
): Promise<EsoPayBeneficiary[]> {
  const existing = await loadBeneficiaries(companyId);
  const next = existing.filter((item) => item.id !== beneficiaryId);
  await saveBeneficiaries(companyId, next);
  return next;
}

export async function clearAllBeneficiaries(companyId: string): Promise<void> {
  if (!companyId) return;
  try {
    await AsyncStorage.removeItem(storageKey(companyId));
  } catch {
    // Best-effort clear.
  }
}
