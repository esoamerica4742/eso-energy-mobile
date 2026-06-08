import { memo, useMemo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { format, parseISO } from 'date-fns';

import {

  ArrowDownLeft,

  ArrowUpRight,

  type LucideIcon,

} from 'lucide-react-native';

import { useWalletTransactions } from '@/esopay/api/hooks/useBilling';

import { EsoPayOutlinePillButton } from '@/esopay/components/EsoPayOutlinePillButton';

import type { EsoPayWalletTransaction } from '@/esopay/api/types';

import { luxury } from '@/esopay/theme/luxury';

import { spacing } from '@/esopay/theme/spacing';

import { fonts } from '@/esopay/theme/typography';

import { formatCurrency } from '@/esopay/utils/currency';



type RowModel = {

  id: string;

  merchant: string;

  dateLabel: string;

  amountKobo: number;

  direction: 'in' | 'out';

  Icon: LucideIcon;

  iconBg: string;

  iconColor: string;

};



function mapTransaction(tx: EsoPayWalletTransaction): RowModel {

  const direction =

    tx.type === 'credit' || tx.type === 'refund' || tx.type === 'reversal' ? 'in' : 'out';

  let dateLabel = tx.created_at;

  try {

    dateLabel = format(parseISO(tx.created_at), 'MMM d · h:mm a');

  } catch {

    // keep raw

  }

  const merchant =

    tx.narration?.trim() ||

    tx.monnify_transaction_reference?.slice(0, 18) ||

    (direction === 'in' ? 'Wallet credit' : 'Payment');



  return {

    id: tx.id,

    merchant,

    dateLabel,

    amountKobo: direction === 'in' ? Math.abs(tx.amount_kobo) : -Math.abs(tx.amount_kobo),

    direction,

    Icon: direction === 'in' ? ArrowDownLeft : ArrowUpRight,

    iconBg: direction === 'in' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.06)',

    iconColor: direction === 'in' ? luxury.green : luxury.gold,

  };

}



type Props = {

  onViewAll?: () => void;

};



export const HomeRecentTransactions = memo(function HomeRecentTransactions({ onViewAll }: Props) {

  const ledgerQuery = useWalletTransactions({ page: 1, limit: 4 });



  const rows = useMemo(() => {

    return (ledgerQuery.data?.data ?? []).map(mapTransaction).slice(0, 4);

  }, [ledgerQuery.data?.data]);



  return (

    <View style={styles.wrap}>

      <View style={styles.headerRow}>

        <Text style={styles.sectionLabel}>Recent transactions</Text>

        {onViewAll ? (
          <EsoPayOutlinePillButton
            label={rows.length === 0 ? 'OPEN HISTORY' : 'View all'}
            onPress={onViewAll}
            accessibilityLabel="View all transactions"
          />
        ) : null}

      </View>



      {rows.length === 0 ? (

        <View style={styles.empty}>

          <Text style={styles.emptyTitle}>No transactions yet</Text>

          <Text style={styles.emptyBody}>

            Fund your wallet or pay a bill — your activity will show here.

          </Text>

        </View>

      ) : (

        <View style={styles.list}>

          {rows.map((row) => (

            <View key={row.id} style={styles.row}>

              <View style={[styles.iconCircle, { backgroundColor: row.iconBg }]}>

                <row.Icon size={18} color={row.iconColor} strokeWidth={2.4} />

              </View>

              <View style={styles.copy}>

                <Text style={styles.merchant} numberOfLines={1}>

                  {row.merchant}

                </Text>

                <Text style={styles.date}>{row.dateLabel}</Text>

              </View>

              <Text

                style={[

                  styles.amount,

                  row.direction === 'in' ? styles.amountIn : styles.amountOut,

                ]}

              >

                {row.direction === 'in' ? '+' : '−'}

                {formatCurrency(Math.abs(row.amountKobo))}

              </Text>

            </View>

          ))}

        </View>

      )}



    </View>

  );

});



const styles = StyleSheet.create({

  wrap: {

    gap: spacing.md,

  },

  headerRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

  },

  sectionLabel: {

    fontFamily: fonts.uiMedium,

    fontSize: 10,

    letterSpacing: 2.4,

    textTransform: 'uppercase',

    color: luxury.warmWhite,

  },

  empty: {

    borderRadius: 16,

    borderWidth: StyleSheet.hairlineWidth,

    borderColor: 'rgba(255,255,255,0.06)',

    backgroundColor: luxury.surface,

    padding: spacing.lg,

    gap: spacing.sm,

  },

  emptyTitle: {

    fontFamily: fonts.uiMedium,

    fontSize: 14,

    color: luxury.textPrimary,

  },

  emptyBody: {

    fontFamily: fonts.ui,

    fontSize: 13,

    lineHeight: 18,

    color: luxury.textMuted,

  },

  list: {

    gap: spacing.sm,

  },

  row: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.md,

    paddingVertical: spacing.md,

    paddingHorizontal: spacing.md,

    borderRadius: 16,

    borderWidth: StyleSheet.hairlineWidth,

    borderColor: 'rgba(255,255,255,0.06)',

    backgroundColor: luxury.surface,

  },

  iconCircle: {

    width: 40,

    height: 40,

    borderRadius: 20,

    alignItems: 'center',

    justifyContent: 'center',

  },

  copy: {

    flex: 1,

    minWidth: 0,

    gap: 2,

  },

  merchant: {

    fontFamily: fonts.uiMedium,

    fontSize: 14,

    color: luxury.textPrimary,

  },

  date: {

    fontFamily: fonts.ui,

    fontSize: 12,

    color: luxury.textMuted,

  },

  amount: {

    fontFamily: fonts.uiMedium,

    fontSize: 14,

    letterSpacing: 0.2,

  },

  amountIn: {

    color: '#34D399',

  },

  amountOut: {

    color: '#F87171',

  },

});


