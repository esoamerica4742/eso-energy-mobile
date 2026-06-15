import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { EsoPayHomeHero } from '@/esopay/components/EsoPayHomeHero';
import { MonnifyWalletCard } from '@/esopay/components/MonnifyWalletCard';
import { grid } from '@/esopay/theme/homeGrid';

type Props = {
  greeting: string;
  balanceKobo: number;
  loading?: boolean;
  onFundPress?: () => void;
  onManagePress?: () => void;
};

/** Home command center — greeting + wallet hero (fixed top block). */
export const EsoPayHomeDashboard = memo(function EsoPayHomeDashboard({
  greeting,
  balanceKobo,
  loading,
  onFundPress,
  onManagePress,
}: Props) {
  return (
    <View style={styles.root}>
      <EsoPayHomeHero greeting={greeting} />
      <View style={styles.walletAnchor}>
        <MonnifyWalletCard
          balanceKobo={balanceKobo}
          loading={loading}
          stableDisplay
          onFundPress={onFundPress}
          onManagePress={onManagePress}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    gap: 0,
  },
  walletAnchor: {
    marginTop: grid.sm,
  },
});
