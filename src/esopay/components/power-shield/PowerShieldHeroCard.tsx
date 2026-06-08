import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PowerShieldMeter } from '@/esopay/api/types';
import { PowerShieldShieldGauge } from '@/esopay/components/power-shield/PowerShieldShieldGauge';
import { PowerShieldShimmerCTA } from '@/esopay/components/power-shield/PowerShieldShimmerCTA';
import {
  PS,
  formatBurnUnitsLabel,
  psFont,
  remainingFraction,
  statusPillForMeter,
} from '@/esopay/components/power-shield/powerShieldTheme';
import { formatCapacityPct } from '@/esopay/lib/powerShieldUi';

type Props = {
  active: boolean;
  meter?: PowerShieldMeter | null;
  onActivate: () => void;
  activating?: boolean;
};

export const PowerShieldHeroCard = memo(function PowerShieldHeroCard({
  active,
  meter,
  onActivate,
  activating = false,
}: Props) {
  const dailyKobo =
    meter?.user_daily_spend_kobo ?? meter?.learned_daily_spend_kobo ?? meter?.daily_spend_kobo ?? 0;
  const remaining = active && meter ? remainingFraction(meter) : 0;
  const headline = active && meter
    ? `${formatCapacityPct(meter.capacity_remaining_pct ?? meter.volume_remaining_pct)} remaining`
    : '—';
  const headlineColor = !active
    ? PS.inactive
    : meter?.alert_level === 'critical'
      ? PS.crimson
      : meter?.alert_level === 'warn_10'
        ? PS.amber
        : PS.green;
  const pill = statusPillForMeter(active, meter);

  return (
    <View style={styles.card}>
      <PowerShieldShieldGauge
        active={active}
        remaining={remaining}
        meter={meter}
        animateArc={active}
      />

      <Text style={[styles.daysHeadline, { color: headlineColor }]}>{headline}</Text>

      <Text style={styles.burnRate}>
        {active && dailyKobo > 0
          ? formatBurnUnitsLabel(dailyKobo)
          : 'Burn rate unlocks after your first top-up'}
      </Text>

      <View style={[styles.statusPill, { backgroundColor: pill.bg }]}>
        <Text style={styles.statusEmoji}>{pill.emoji}</Text>
        <Text style={[styles.statusLabel, { color: pill.text }]}>{pill.label}</Text>
      </View>

      <View style={styles.divider} />

      <PowerShieldShimmerCTA
        label={active ? 'Recharge meter' : 'Activate Power Shield'}
        onPress={onActivate}
        loading={activating}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: PS.card,
    borderWidth: 1,
    borderColor: PS.amberBorder,
    paddingVertical: 28,
    paddingHorizontal: 22,
    gap: 14,
    alignItems: 'center',
    shadowColor: PS.amber,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  daysHeadline: {
    fontFamily: psFont.display,
    fontSize: 32,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  burnRate: {
    fontFamily: psFont.body,
    fontSize: 13,
    color: PS.textMuted,
    textAlign: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusEmoji: {
    fontSize: 12,
  },
  statusLabel: {
    fontFamily: psFont.bodyMedium,
    fontSize: 13,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },
});
