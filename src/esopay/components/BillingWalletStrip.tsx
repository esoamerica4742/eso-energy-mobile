import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Wallet } from 'lucide-react-native';
import { useWallet } from '@/esopay/api/hooks/useBilling';
import { luxury } from '@/esopay/theme/luxury';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
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
      <LinearGradient
        colors={['rgba(201,168,76,0.16)', 'rgba(13,15,23,0.95)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Wallet size={18} color={luxury.gold} strokeWidth={2.2} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Wallet balance</Text>
          {loading ? (
            <ActivityIndicator color={luxury.gold} size="small" />
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
          <Plus size={14} color="#1A1200" strokeWidth={2.6} />
          <Text style={styles.fundText}>Fund</Text>
        </Pressable>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.24)',
    overflow: 'hidden',
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,168,76,0.12)',
  },
  copy: {
    flex: 1,
    gap: 2,
    minHeight: 40,
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: luxury.textMuted,
    letterSpacing: 0.4,
  },
  balance: {
    fontFamily: fonts.uiMedium,
    fontSize: 20,
    color: luxury.textPrimary,
    letterSpacing: 0.2,
  },
  fundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: luxury.gold,
  },
  fundBtnPressed: {
    opacity: 0.88,
  },
  fundText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: '#1A1200',
  },
});
