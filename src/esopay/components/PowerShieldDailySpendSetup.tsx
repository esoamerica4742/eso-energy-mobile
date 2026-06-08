import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gauge } from 'lucide-react-native';
import type { PowerShieldMeter } from '@/esopay/api/types';
import { useUpdatePowerShieldMeter } from '@/esopay/hooks/usePowerShield';
import { smartDailySpendOptionsKobo } from '@/esopay/lib/powerShieldSchedules';
import { PS, psFont } from '@/esopay/components/power-shield/powerShieldTheme';
import { spacing } from '@/esopay/theme/spacing';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  meter: PowerShieldMeter;
  compact?: boolean;
};

export const PowerShieldDailySpendSetup = memo(function PowerShieldDailySpendSetup({
  meter,
  compact = false,
}: Props) {
  const updateMeter = useUpdatePowerShieldMeter();
  const options = smartDailySpendOptionsKobo(meter);

  if (!meter.needs_daily_spend_setup) {
    return null;
  }

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <Gauge size={16} color={PS.amber} strokeWidth={2.2} />
        <Text style={styles.title}>Calibrate daily spend</Text>
      </View>
      <Text style={styles.body}>
        Confirm how much this meter uses per day so 10% and 5% capacity alerts stay accurate.
      </Text>
      <View style={styles.chipRow}>
        {options.map((amountKobo) => {
          const active =
            (meter.user_daily_spend_kobo ?? meter.daily_spend_kobo) === amountKobo;
          return (
            <Pressable
              key={amountKobo}
              disabled={updateMeter.isPending}
              onPress={() => updateMeter.mutate({ meterId: meter.id, patch: { daily_spend_kobo: amountKobo } })}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {formatCurrency(amountKobo)}/day
              </Text>
            </Pressable>
          );
        })}
      </View>
      {updateMeter.isPending ? (
        <ActivityIndicator color={PS.amber} size="small" style={styles.spinner} />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PS.amberBorder,
    backgroundColor: PS.amberDim,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardCompact: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: psFont.bodyBold,
    fontSize: 14,
    color: PS.amber,
  },
  body: {
    fontFamily: psFont.body,
    fontSize: 13,
    lineHeight: 19,
    color: PS.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
  },
  chipActive: {
    borderColor: PS.amber,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
  },
  chipText: {
    fontFamily: psFont.bodyMedium,
    fontSize: 12,
    color: PS.textMuted,
  },
  chipTextActive: {
    color: PS.amber,
  },
  spinner: {
    alignSelf: 'flex-start',
  },
});
