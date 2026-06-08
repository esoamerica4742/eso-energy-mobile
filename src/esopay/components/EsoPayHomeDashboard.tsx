import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { EsoPayHomeHero } from '@/esopay/components/EsoPayHomeHero';
import { MonnifyWalletCard } from '@/esopay/components/MonnifyWalletCard';
import { spacing } from '@/esopay/theme/spacing';

type Props = {
  greeting: string;
  dateLabel: string;
  balanceKobo: number;
  onFundPress?: () => void;
  onHistoryPress?: () => void;
  onDetailsPress?: () => void;
};

/** Home command center — greeting + wallet hero. */
export const EsoPayHomeDashboard = memo(function EsoPayHomeDashboard({
  greeting,
  dateLabel,
  balanceKobo,
  onFundPress,
  onHistoryPress,
  onDetailsPress,
}: Props) {
  return (
    <View style={styles.root}>
      <EsoPayHomeHero greeting={greeting} dateLabel={dateLabel} />
      <MonnifyWalletCard
        balanceKobo={balanceKobo}
        stableDisplay
        onFundPress={onFundPress}
        onHistoryPress={onHistoryPress}
        onDetailsPress={onDetailsPress}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    gap: spacing.xl,
  },
});
