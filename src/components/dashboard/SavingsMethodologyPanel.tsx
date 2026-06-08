import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronUp, Info } from 'lucide-react-native';
import {
  DIESEL_LITERS_PER_KW_HOUR,
  DIESEL_NAIRA_PER_LITER,
  GENERATOR_KWH_PER_LITER,
  NGN_PER_KWH_DISPLACED,
} from '@/lib/monitoring/monitoringKpiEngine';
import { Colors, FontSize, MonitoringLayout, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  live: boolean;
};

export const SavingsMethodologyPanel = memo(function SavingsMethodologyPanel({ live }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel="Savings calculation methodology"
      >
        <Info size={14} color={Colors.gold} strokeWidth={2.2} />
        <Text style={styles.headerText}>
          {live ? 'Estimated savings · auditable formula' : 'Methodology · resumes with live data'}
        </Text>
        {open ? (
          <ChevronUp size={16} color={Colors.textMuted} />
        ) : (
          <ChevronDown size={16} color={Colors.textMuted} />
        )}
      </Pressable>

      {open ? (
        <View style={styles.body}>
          <Text style={styles.line}>
            <Text style={styles.bold}>Daily savings</Text> = solar kW × 24h × ₦
            {NGN_PER_KWH_DISPLACED.toFixed(0)}/kWh displaced
          </Text>
          <Text style={styles.line}>
            <Text style={styles.bold}>Diesel avoided</Text> = max(0, load − solar×0.92) ×{' '}
            {DIESEL_LITERS_PER_KW_HOUR} L/kWh × 24h
          </Text>
          <Text style={styles.line}>
            <Text style={styles.bold}>Solar share</Text> = solar kW ÷ load kW (capped 0–100%)
          </Text>
          <Text style={styles.line}>
            <Text style={styles.bold}>Constants</Text> — diesel ₦{DIESEL_NAIRA_PER_LITER}/L, generator{' '}
            {GENERATOR_KWH_PER_LITER} kWh/L
          </Text>
          <Text style={styles.footnote}>
            Figures are operational estimates from live Enode telemetry — not audited financial statements.
            Export ledger from Reports for finance reconciliation.
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: MonitoringLayout.cardMarginH,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  headerText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  body: {
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  line: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  bold: {
    fontFamily: fonts.semibold,
    color: Colors.textSecondary,
  },
  footnote: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.micro,
    color: Colors.textMuted,
    lineHeight: 16,
  },
});
