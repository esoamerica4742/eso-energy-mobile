import { format, parseISO } from 'date-fns';
import type { RecentUtilityPayment, UtilityProvider } from '@/esopay/api/types';
import { getBillerBrandStyle } from '@/esopay/data/billerBrands';

export type BillHistoryFilter = 'ALL' | 'ELECTRICITY' | 'AIRTIME' | 'DATA' | 'OTHERS';

export type BillHistoryRowModel = {
  id: string;
  filterCategory: 'electricity' | 'airtime' | 'data' | 'others';
  serviceName: string;
  distributor: string;
  dateTime: string;
  amountKobo: number;
  status: 'success' | 'pending' | 'failed';
  brand: ReturnType<typeof getBillerBrandStyle>;
  payment: RecentUtilityPayment;
};

const CATEGORY_SERVICE: Record<UtilityProvider['category'], string> = {
  electricity: 'Electricity',
  airtime: 'Airtime',
  data: 'Data',
  tv: 'Cable TV',
  water: 'Water',
  other: 'Bill payment',
};

function filterCategoryFor(provider: UtilityProvider): BillHistoryRowModel['filterCategory'] {
  if (provider.category === 'electricity') return 'electricity';
  if (provider.category === 'airtime') return 'airtime';
  if (provider.category === 'data') return 'data';
  return 'others';
}

export function matchesBillHistoryFilter(
  row: BillHistoryRowModel,
  filter: BillHistoryFilter,
): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'ELECTRICITY') return row.filterCategory === 'electricity';
  if (filter === 'AIRTIME') return row.filterCategory === 'airtime';
  if (filter === 'DATA') return row.filterCategory === 'data';
  return row.filterCategory === 'others';
}

export function recentPaymentToHistoryRow(payment: RecentUtilityPayment): BillHistoryRowModel {
  const serviceName = CATEGORY_SERVICE[payment.provider.category] ?? payment.provider.name;

  let dateTime = payment.paid_at;
  try {
    dateTime = format(parseISO(payment.paid_at), 'd MMM yyyy · HH:mm');
  } catch {
    // keep raw ISO
  }

  return {
    id: payment.id,
    filterCategory: filterCategoryFor(payment.provider),
    serviceName,
    distributor: payment.provider.name,
    dateTime,
    amountKobo: payment.amount_kobo,
    status: 'success',
    brand: getBillerBrandStyle(payment.provider),
    payment,
  };
}

export const BILL_HISTORY_FILTERS: { key: BillHistoryFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ELECTRICITY', label: 'Electricity' },
  { key: 'AIRTIME', label: 'Airtime' },
  { key: 'DATA', label: 'Data' },
  { key: 'OTHERS', label: 'Others' },
];
