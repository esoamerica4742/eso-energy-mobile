import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus, Wallet } from 'phosphor-react-native';
import { useWallet } from '@/esopay/api/hooks/useBilling';
import { ds } from '@/esopay/theme/designSystem';
import { spacing } from '@/esopay/theme/spacing';
import { inter } from '@/theme/fonts';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  onFundPress: () => void;
  onWalletPress?: () => void;
};

export const BillingWalletStrip = memo(function BillingWalletStrip({
  onFundPress,
  onWalletPress,
}: Props) {
  const walletQuery = useWallet();
  const balanceKobo = walletQuery.data?.balance_kobo ?? 0;
  const loading = walletQuery.isLoading && !walletQuery.data;

  return (
    <Pressable
      onPress={onWalletPress}
      disabled={!onWalletPress}
      style={({ pressed }) => [styles.wrap, pressed && onWalletPress && styles.pressed]}
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Wallet size={20} color={ds.color.teal} weight="duotone" />
        </View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Wallet balance</Text>
          {loading ? (
            <ActivityIndicator color={ds.color.teal} size="small" />
          ) : (
            <Text style={styles.balance}>{formatCurrency(balanceKobo)}</Text>
          )}
        </View>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onFundPress();
          }}
          style={({ pressed }) => [styles.fundBtn, pressed && styles.fundBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Fund wallet"
        >
          <Plus size={16} color={ds.color.bg} weight="bold" />
          <Text style={styles.fundText}>Fund</Text>
        </Pressable>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderRadius: ds.radius.card,
    borderWidth: 1,
    borderColor: ds.color.border,
    backgroundColor: ds.color.surface1,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.92,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: ds.radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ds.color.tealMuted,
  },
  copy: {
    flex: 1,
    gap: 2,
    minHeight: 40,
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: inter.regular,
    fontSize: 11,
    color: ds.color.textMuted,
    letterSpacing: 0.4,
  },
  balance: {
    fontFamily: inter.semibold,
    fontSize: 20,
    color: ds.color.textPrimary,
    letterSpacing: 0.2,
  },
  fundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: ds.radius.pill,
    backgroundColor: ds.color.gold,
  },
  fundBtnPressed: {
    opacity: 0.88,
  },
  fundText: {
    fontFamily: inter.medium,
    fontSize: 13,
    color: ds.color.bg,
  },
});
