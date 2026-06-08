import type { RecentUtilityPayment, UtilityProvider } from '@/esopay/api/types';
import type { QuickPayCardConfig } from '@/esopay/data/quickPayCatalog';

const CATEGORY_BY_KEY: Record<QuickPayCardConfig['key'], UtilityProvider['category']> = {
  elec: 'electricity',
  air: 'airtime',
  data: 'data',
  tv: 'tv',
};

export function resolveQuickPayProvider(
  card: QuickPayCardConfig,
  providers: UtilityProvider[],
  recent: RecentUtilityPayment[],
): UtilityProvider | null {
  const category = CATEGORY_BY_KEY[card.key];

  const recentMatch = recent.find((row) => row.provider.category === category);
  if (recentMatch) return recentMatch.provider;

  return providers.find((provider) => provider.category === category) ?? null;
}

export function resolveQuickPayPrefill(
  _card: QuickPayCardConfig,
  recent: RecentUtilityPayment[],
  provider: UtilityProvider | null,
): { accountNumber?: string; amountKobo?: number } {
  if (!provider) return {};

  const recentRow = recent.find((row) => row.provider.id === provider.id);
  if (recentRow) {
    return {
      accountNumber: recentRow.account_number,
      amountKobo: recentRow.amount_kobo,
    };
  }

  return {};
}
