import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import type { PowerShieldMeter } from '@/esopay/api/types';
import { PowerShieldAlertPills } from '@/esopay/components/power-shield/PowerShieldAlertPills';
import { PowerShieldSpendSparkline } from '@/esopay/components/power-shield/PowerShieldSpendSparkline';
import { PowerShieldTokenRing } from '@/esopay/components/power-shield/PowerShieldTokenRing';
import {
  formatBurnRateLabel,
  PS,
  psFont,
  psStyles,
} from '@/esopay/components/power-shield/powerShieldTheme';
import { countdownProgress, formatCapacityPct } from '@/esopay/lib/powerShieldUi';
import type { AlertPillKey } from '@/esopay/components/power-shield/PowerShieldAlertPills';

type Props = {
  meter?: PowerShieldMeter | null;
  ghost?: boolean;
  locked?: boolean;
  animateRing?: boolean;
  onAlertArm?: (pill: AlertPillKey) => void;
};

export const PowerShieldDashboardCard = memo(function PowerShieldDashboardCard({
  meter,
  ghost = false,
  locked = false,
  animateRing = true,
  onAlertArm,
}: Props) {
  const progress = locked || !meter ? 0 : countdownProgress(meter);
  const dailyKobo =
    meter?.learned_daily_spend_kobo ?? meter?.user_daily_spend_kobo ?? meter?.daily_spend_kobo ?? 74_000;

  return (
    <View style={[styles.card, ghost && styles.cardGhost]}>
      <PowerShieldTokenRing
        progress={progress}
        dimmed={locked}
        animateOnMount={animateRing && !locked}
      />

      <View style={styles.stats}>
        {locked ? (
          <>
            <Text style={[psStyles.daysLarge, styles.lockedStat]}>— remaining</Text>
            <View style={styles.lockedRow}>
              <Lock size={12} color={PS.locked} strokeWidth={2.2} />
              <Text style={[psStyles.burnRate, styles.lockedStat]}>Burn rate locked</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={psStyles.daysLarge}>
              {formatCapacityPct(meter?.capacity_remaining_pct ?? meter?.volume_remaining_pct)} remaining
            </Text>
            <Text style={psStyles.burnRate}>{formatBurnRateLabel(dailyKobo)}</Text>
          </>
        )}
      </View>

      <PowerShieldAlertPills
        locked={locked}
        alertLevel={meter?.alert_level}
        notifyWarn10={meter?.notify_warn_10 ?? true}
        notifyCritical5={meter?.notify_critical_5 ?? true}
        onArmHaptic={onAlertArm}
      />

      {!locked ? (
        <View style={styles.sparklineBlock}>
          <Text style={styles.sparklineLabel}>7-day spend</Text>
          <PowerShieldSpendSparkline
            values={buildSparklineFromMeter(dailyKobo)}
          />
        </View>
      ) : null}
    </View>
  );
});

function buildSparklineFromMeter(dailyKobo: number): number[] {
  const base = dailyKobo / 100;
  return [0.94, 1.02, 0.97, 1.06, 0.99, 1.03, 1].map((m) => Math.round(base * m));
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PS.border,
    backgroundColor: PS.surface,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 20,
    alignItems: 'stretch',
  },
  cardGhost: {
    opacity: 0.45,
  },
  stats: {
    alignItems: 'center',
    gap: 2,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  lockedStat: {
    color: PS.textDim,
  },
  sparklineBlock: {
    gap: 8,
    paddingTop: 4,
  },
  sparklineLabel: {
    fontFamily: psFont.regular,
    fontSize: 11,
    color: PS.textDim,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});
