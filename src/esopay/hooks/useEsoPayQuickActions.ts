import { useCallback, useMemo } from 'react';
import {
  ChartBar,
  Lightning,
  Phone,
  Television,
} from 'phosphor-react-native';
import type { QuickActionItem } from '@/esopay/components/QuickActionGrid';
import {
  esopayBillsTabHref,
  QUICK_ACTION_CATEGORY,
  type BillCategoryChip,
} from '@/esopay/navigation/billCategories';
import { getQuickActionHelper } from '@/esopay/lib/billPayCardHelpers';
import { ESO_PAY_GOLD } from '@/esopay/theme/brandColors';
import type { Href } from 'expo-router';

const ACTION_COLORS = {
  electricity: '#F59E0B',
  airtime: ESO_PAY_GOLD,
  data: '#38BDF8',
  cable: '#A855F7',
} as const;

type NavigateFn = (href: Href) => void;

type Options = {
  navigate: NavigateFn;
  /** When set (Billing tab), filter utilities in-place instead of switching tabs. */
  onCategorySelect?: (category: BillCategoryChip | 'MORE') => void;
};

/** Live Monnify VAS services only (education/insurance omitted until products exist). */
export function useEsoPayQuickActions({ navigate, onCategorySelect }: Options) {
  const goCategory = useCallback(
    (chip: BillCategoryChip) => {
      if (onCategorySelect) {
        onCategorySelect(chip);
        return;
      }
      navigate(esopayBillsTabHref(chip));
    },
    [navigate, onCategorySelect],
  );

  return useMemo<QuickActionItem[]>(
    () => [
      {
        key: 'elec',
        label: 'Electricity',
        Icon: Lightning,
        color: ACTION_COLORS.electricity,
        hint: getQuickActionHelper('elec'),
        showDot: true,
        onPress: () => goCategory(QUICK_ACTION_CATEGORY.elec),
      },
      {
        key: 'air',
        label: 'Airtime',
        Icon: Phone,
        color: ACTION_COLORS.airtime,
        hint: getQuickActionHelper('air'),
        showDot: true,
        onPress: () => goCategory(QUICK_ACTION_CATEGORY.air),
      },
      {
        key: 'data',
        label: 'Data',
        Icon: ChartBar,
        color: ACTION_COLORS.data,
        hint: getQuickActionHelper('data'),
        onPress: () => goCategory(QUICK_ACTION_CATEGORY.data),
      },
      {
        key: 'tv',
        label: 'Cable TV',
        Icon: Television,
        color: ACTION_COLORS.cable,
        hint: getQuickActionHelper('tv'),
        onPress: () => goCategory(QUICK_ACTION_CATEGORY.tv),
      },
    ],
    [goCategory],
  );
}
