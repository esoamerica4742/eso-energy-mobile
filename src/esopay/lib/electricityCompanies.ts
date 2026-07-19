import type { RecentUtilityPayment } from '@/esopay/api/types';
import type { CategoryBillerEntry } from '@/esopay/lib/buildCategoryBillPayCards';
import { getProviderCardTitle } from '@/esopay/lib/billPayCardHelpers';
import type { NigeriaBillerMeta } from '@/esopay/data/nigeriaBillers';
import { getPopularBillersForCategory } from '@/esopay/data/nigeriaBillers';

export type ElectricityMeterType = 'prepaid' | 'postpaid';

export type ElectricityCompanyGroup = {
  id: string;
  title: string;
  stateLabel: string;
  brandMeta: NigeriaBillerMeta;
  prepaid: CategoryBillerEntry | null;
  postpaid: CategoryBillerEntry | null;
};

/** Opay-style quick amounts for electricity amount cards. */
export const ELECTRICITY_AMOUNT_PRESETS_KOBO = [
  1_000_00, 2_000_00, 3_000_00, 5_000_00, 10_000_00, 20_000_00,
] as const;

export function companyGroupKey(meta: NigeriaBillerMeta): string {
  return meta.id.replace(/-(pre|post)$/i, '').toLowerCase();
}

export function companyDisplayTitle(meta: NigeriaBillerMeta): string {
  return getProviderCardTitle(meta)
    .replace(/\s+(Prepaid|Postpaid)\s*$/i, '')
    .trim();
}

export function detectMeterType(meta: NigeriaBillerMeta): ElectricityMeterType | null {
  if (/postpaid/i.test(meta.name) || /-(post)$/i.test(meta.id)) return 'postpaid';
  if (/prepaid/i.test(meta.name) || /-(pre)$/i.test(meta.id)) return 'prepaid';
  return null;
}

export function groupElectricityCompanies(
  billers: CategoryBillerEntry[],
): ElectricityCompanyGroup[] {
  const map = new Map<string, ElectricityCompanyGroup>();

  for (const entry of billers) {
    const id = companyGroupKey(entry.meta);
    const existing = map.get(id);
    const meter = detectMeterType(entry.meta);

    if (!existing) {
      map.set(id, {
        id,
        title: companyDisplayTitle(entry.meta),
        stateLabel: entry.meta.stateLabel,
        brandMeta: entry.meta,
        prepaid: meter === 'postpaid' ? null : entry,
        postpaid: meter === 'postpaid' ? entry : meter === 'prepaid' ? null : null,
      });
      // Single untyped biller (e.g. BEDC) — treat as prepaid path.
      if (meter === null) {
        const g = map.get(id)!;
        g.prepaid = entry;
      }
      continue;
    }

    if (meter === 'postpaid') existing.postpaid = entry;
    else if (meter === 'prepaid') existing.prepaid = entry;
    else if (!existing.prepaid) existing.prepaid = entry;
  }

  return Array.from(map.values());
}

function normalizeMatchKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function orderElectricityCompanies(
  companies: ElectricityCompanyGroup[],
  recentPayments: RecentUtilityPayment[],
): ElectricityCompanyGroup[] {
  const recentIds: string[] = [];
  const seen = new Set<string>();

  for (const payment of recentPayments) {
    const nameKey = normalizeMatchKey(payment.provider.name);
    const codeKey = normalizeMatchKey(payment.provider.monnify_biller_code);
    const hit = companies.find((c) => {
      const entries = [c.prepaid, c.postpaid].filter(Boolean) as CategoryBillerEntry[];
      return entries.some(({ provider: p, meta }) => {
        if (p.id === payment.provider.id) return true;
        const pName = normalizeMatchKey(p.name);
        const mCode = normalizeMatchKey(meta.monnify_biller_code);
        return pName === nameKey || mCode === codeKey || pName.includes(nameKey) || nameKey.includes(pName);
      });
    });
    if (hit && !seen.has(hit.id)) {
      seen.add(hit.id);
      recentIds.push(hit.id);
    }
  }

  const popularCodes = new Set(
    getPopularBillersForCategory('electricity').map((m) =>
      normalizeMatchKey(companyGroupKey(m)),
    ),
  );

  const recent = recentIds
    .map((id) => companies.find((c) => c.id === id))
    .filter(Boolean) as ElectricityCompanyGroup[];
  const rest = companies.filter((c) => !seen.has(c.id));
  const popular: ElectricityCompanyGroup[] = [];
  const other: ElectricityCompanyGroup[] = [];
  for (const c of rest) {
    if (popularCodes.has(normalizeMatchKey(c.id))) popular.push(c);
    else other.push(c);
  }
  other.sort((a, b) => a.title.localeCompare(b.title));

  return [...recent, ...popular, ...other];
}

export function entryForMeter(
  company: ElectricityCompanyGroup,
  meter: ElectricityMeterType,
): CategoryBillerEntry | null {
  return meter === 'prepaid' ? company.prepaid : company.postpaid;
}

export function defaultMeterType(company: ElectricityCompanyGroup): ElectricityMeterType {
  if (company.prepaid) return 'prepaid';
  return 'postpaid';
}

export function findCompanyForBillerCode(
  companies: ElectricityCompanyGroup[],
  code: string,
): { company: ElectricityCompanyGroup; meter: ElectricityMeterType } | null {
  const codeKey = normalizeMatchKey(code);
  for (const company of companies) {
    for (const meter of ['prepaid', 'postpaid'] as const) {
      const entry = entryForMeter(company, meter);
      if (!entry) continue;
      if (
        normalizeMatchKey(entry.meta.monnify_biller_code) === codeKey ||
        normalizeMatchKey(entry.provider.monnify_biller_code) === codeKey ||
        normalizeMatchKey(entry.meta.id) === codeKey
      ) {
        return { company, meter };
      }
    }
  }
  return null;
}

/** Prefer last-used DISCO, else popular, else first A–Z. */
export function preferElectricityCompany(
  companies: ElectricityCompanyGroup[],
  recentPayments: RecentUtilityPayment[],
): ElectricityCompanyGroup | null {
  if (companies.length === 0) return null;
  return orderElectricityCompanies(companies, recentPayments)[0] ?? null;
}
