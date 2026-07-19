import type { PaymentModalTarget } from '@/esopay/components/PaymentModal';
import { loadBeneficiaries } from '@/esopay/storage/beneficiaries';

/**
 * Enrich a complete warm-path target with beneficiary-trusted customer name
 * so PaymentModal can skip re-validate and PIN can execute immediately.
 */
export async function resolveTrustedPaymentTarget(
  companyId: string | null | undefined,
  target: PaymentModalTarget,
): Promise<PaymentModalTarget> {
  if (target.accountValidated && target.customerName?.trim()) {
    return target;
  }

  const account = target.accountNumber?.trim();
  if (!companyId || !target.provider || !account) {
    return target;
  }

  const list = await loadBeneficiaries(companyId);
  const match = list.find(
    (item) =>
      item.providerId === target.provider.id &&
      item.accountNumber.trim() === account &&
      Boolean(item.customerName?.trim()),
  );

  if (!match?.customerName?.trim()) {
    return target;
  }

  return {
    ...target,
    customerName: match.customerName.trim(),
    accountValidated: true,
  };
}

/** Mask meter/account for PIN summary — keep last 4 digits. */
export function maskAccountNumber(account: string): string {
  const trimmed = account.trim();
  if (trimmed.length <= 4) return trimmed;
  return `••••${trimmed.slice(-4)}`;
}
