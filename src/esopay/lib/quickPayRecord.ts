import type { UtilityProvider } from '@/esopay/api/types';
import type { QuickPayBrandId, QuickPayCategoryKey } from '@/esopay/data/quickPayCatalog';
import { recordQuickPayTransaction } from '@/esopay/storage/quickPayHistory';

function inferBrandId(provider: UtilityProvider): QuickPayBrandId {
  const name = provider.name.toLowerCase();
  if (name.includes('mtn')) return 'mtn';
  if (name.includes('dstv')) return 'dstv';
  if (name.includes('airtel')) return 'airtel';
  if (name.includes('glo')) return 'glo';
  if (name.includes('ikeja') || name.includes('electric')) return 'ikeja';
  return 'mtn';
}

function inferCategoryKey(provider: UtilityProvider): QuickPayCategoryKey | null {
  const cat = provider.category.toLowerCase();
  if (cat === 'electricity') return 'elec';
  if (cat === 'airtime') return 'air';
  if (cat === 'data') return 'data';
  if (cat === 'tv') return 'tv';
  return null;
}

export async function recordQuickPayFromProvider(
  companyId: string,
  provider: UtilityProvider,
  amountKobo: number,
): Promise<void> {
  const categoryKey = inferCategoryKey(provider);
  if (!categoryKey || !companyId) return;

  await recordQuickPayTransaction(companyId, {
    categoryKey,
    brandId: inferBrandId(provider),
    providerName: provider.name,
    amountKobo,
  });
}
