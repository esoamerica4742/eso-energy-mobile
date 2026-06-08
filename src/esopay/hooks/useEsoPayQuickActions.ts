import { useCallback, useMemo } from 'react';

import {

  ChartBar,

  GraduationCap,

  Lightning,

  Phone,

  ShieldCheck,

  SquaresFour,

  Target,

  Television,

} from 'phosphor-react-native';

import type { QuickActionItem } from '@/esopay/components/QuickActionGrid';

import {

  esopayBillsTabHref,

  QUICK_ACTION_CATEGORY,

  type BillCategoryChip,

} from '@/esopay/navigation/billCategories';

import { esopayBuyUtilitiesHref } from '@/esopay/navigation/routes';

import { getQuickActionHelper } from '@/esopay/lib/billPayCardHelpers';

import type { Href } from 'expo-router';



const ACTION_COLORS = {

  electricity: '#F59E0B',

  airtime: '#00C48C',

  data: '#38BDF8',

  cable: '#A855F7',

  education: '#FB923C',

  insurance: '#4ADE80',

  betting: '#F43F5E',

  more: '#94A3B8',

} as const;



type NavigateFn = (href: Href) => void;



type Options = {

  navigate: NavigateFn;

  /** When set (Billing tab), filter utilities in-place instead of switching tabs. */

  onCategorySelect?: (category: BillCategoryChip) => void;

};



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

      {

        key: 'edu',

        label: 'Education',

        Icon: GraduationCap,

        color: ACTION_COLORS.education,

        hint: getQuickActionHelper('edu'),

        onPress: () => goCategory(QUICK_ACTION_CATEGORY.edu),

      },

      {

        key: 'ins',

        label: 'Insurance',

        Icon: ShieldCheck,

        color: ACTION_COLORS.insurance,

        hint: getQuickActionHelper('ins'),

        onPress: () => goCategory(QUICK_ACTION_CATEGORY.ins),

      },

      {

        key: 'bet',

        label: 'Betting',

        Icon: Target,

        color: ACTION_COLORS.betting,

        hint: getQuickActionHelper('bet'),

        onPress: () => goCategory(QUICK_ACTION_CATEGORY.bet),

      },

      {

        key: 'more',

        label: 'More',

        Icon: SquaresFour,

        color: ACTION_COLORS.more,

        hint: getQuickActionHelper('more'),

        onPress: () => {

          if (onCategorySelect) {

            onCategorySelect('MORE');

            return;

          }

          navigate(esopayBuyUtilitiesHref());

        },

      },

    ],

    [goCategory, navigate, onCategorySelect],

  );

}

