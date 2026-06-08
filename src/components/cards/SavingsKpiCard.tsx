import { View, Text, StyleSheet } from 'react-native';
import { CARD_WIDTH } from './KpiCard';
import { SavingsSparkline } from '@/components/charts/SavingsSparkline';
import { colors, fontSize, fonts, radius, shadowGold, spacing } from '@/theme/tokens';

export function SavingsKpiCard() {
  return (
    <View style={[styles.card, shadowGold]}>
      {/* Gold top bar */}
      <View style={styles.goldBar} />

      <View style={styles.inner}>
        <Text style={styles.label}>SAVINGS TODAY</Text>
        <Text style={styles.value}>₦412,750</Text>
        <View style={styles.deltaRow}>
          <View style={styles.deltaPill}>
            <Text style={styles.deltaArrow}>↑</Text>
            <Text style={styles.deltaText}>12.4%</Text>
          </View>
          <Text style={styles.deltaSub}>vs 7-day avg</Text>
        </View>
        <SavingsSparkline />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH + 40,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    overflow: 'hidden',
  },
  goldBar: {
    height: 2,
    backgroundColor: colors.gold,
  },
  inner: {
    padding: spacing.lg,
    paddingTop: spacing.md + 2,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.label,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
    lineHeight: 32,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.positiveBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 100,
  },
  deltaArrow: {
    fontFamily: fonts.bold,
    fontSize: fontSize.micro,
    color: colors.positiveText,
  },
  deltaText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.badge,
    color: colors.positiveText,
    fontVariant: ['tabular-nums'],
  },
  deltaSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textTertiary,
  },
});
