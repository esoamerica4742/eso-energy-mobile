import type { Href } from 'expo-router';
import { ESOPAY_HOME_ROUTE } from '@/lib/navigation/productRoutes';
import type { UtilityCategorySlug } from '@/esopay/data/nigeriaBillers';
import { slugFromFilterTab } from '@/esopay/data/nigeriaBillers';
import type { BillFilterTab } from '@/esopay/data/utilities';

/** Eso Pay home tab (Monnify wallet command center). */
export const ESOPAY_HOME_HREF = ESOPAY_HOME_ROUTE;

export const ESOPAY_BILLS_HREF = '/billing/bills' as Href;
export const ESOPAY_WALLET_HREF = '/billing/wallet' as Href;
export const ESOPAY_INTELLIGENCE_HREF = '/billing/intelligence' as Href;
export const ESOPAY_HISTORY_HREF = '/billing/history' as Href;
export const ESOPAY_INVOICES_HREF = '/billing/invoices' as Href;
export const ESOPAY_SETTINGS_HREF = '/billing/settings' as Href;

/** Main app fleet / inverter monitor (outside Eso Pay tabs). */
export const ESOPAY_FLEET_MONITOR_HREF = '/monitor' as Href;

/** @deprecated Use ESOPAY_HOME_HREF */
export const ESOPAY_BILLING_LIST_HREF = ESOPAY_BILLS_HREF;

export function esopayBillDetailHref(billId: string): Href {
  return {
    pathname: '/billing/[billId]',
    params: { billId },
  } as Href;
}

export function esopayPayBillHref(billId: string): Href {
  return {
    pathname: '/billing/pay/[billId]',
    params: { billId },
  } as Href;
}

export function esopayFundWalletHref(options?: {
  amountKobo?: number;
  billId?: string;
}): Href {
  return {
    pathname: '/billing/fund',
    params: {
      ...(options?.amountKobo != null ? { amountKobo: String(options.amountKobo) } : {}),
      ...(options?.billId ? { billId: options.billId } : {}),
    },
  } as Href;
}

export function esopayBuyUtilitiesHref(): Href {
  return '/billing/utilities' as Href;
}

/** OPay-style utility purchase flow for a category. */
export function esopayUtilityCategoryHref(slug: UtilityCategorySlug): Href {
  return {
    pathname: '/billing/utility/[category]',
    params: { category: slug },
  } as Href;
}

export function esopayUtilityCategoryFromTab(tab: BillFilterTab): Href | null {
  const slug = slugFromFilterTab(tab);
  return slug ? esopayUtilityCategoryHref(slug) : ESOPAY_BILLS_HREF;
}
