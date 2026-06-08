import { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Bell, Zap } from 'lucide-react-native';
import type { PowerShieldMeter } from '@/esopay/api/types';
import { PowerShieldCountdownRing } from '@/esopay/components/PowerShieldCountdownRing';
import { PowerShieldFeedbackPrompt } from '@/esopay/components/PowerShieldFeedbackPrompt';
import { GoldCTAButton } from '@/esopay/components/GoldCTAButton';
import { useUpdatePowerShieldMeter } from '@/esopay/hooks/usePowerShield';
import { POWER_SHIELD_ALERT_COPY, isPowerShieldCriticalPanic } from '@/esopay/lib/powerShieldUi';
import { PS } from '@/esopay/components/power-shield/powerShieldTheme';
import { smartDailySpendOptionsKobo } from '@/esopay/lib/powerShieldSchedules';
import { PowerShieldDailySpendSetup } from '@/esopay/components/PowerShieldDailySpendSetup';
import { usePaymentModal } from '@/esopay/context/PaymentModalContext';
import { luxury } from '@/esopay/theme/luxury';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';
import { formatCurrency } from '@/esopay/utils/currency';

type Props = {
  meter: PowerShieldMeter;
};

export const PowerShieldMeterCard = memo(function PowerShieldMeterCard({ meter }: Props) {
  const { openPayment } = usePaymentModal();
  const updateMeter = useUpdatePowerShieldMeter();
  const copy = POWER_SHIELD_ALERT_COPY[meter.alert_level];
  const crisis = isPowerShieldCriticalPanic(meter);
  const pulse = useSharedValue(1);
  const [showTuning, setShowTuning] = useState(false);

  useEffect(() => {
    if (!crisis) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 550, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 550, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [crisis, pulse]);

  const crisisStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  const [alertFeedbackDone, setAlertFeedbackDone] = useState(false);
  const showAlertFeedback = meter.feedback_pending && !alertFeedbackDone;

  const recharge = () => {
    if (!meter.provider) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openPayment({
      provider: meter.provider,
      accountNumber: meter.account_number,
      amountKobo: meter.last_purchase_amount_kobo ?? meter.daily_spend_kobo,
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        crisis ? styles.cardCrisis : { borderColor: `${copy.tone}44` },
        crisisStyle,
      ]}
    >
      <View style={styles.topRow}>
        <PowerShieldCountdownRing meter={meter} tone={copy.tone} />
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Zap size={14} color={copy.tone} strokeWidth={2.4} />
            <Text style={styles.label}>{meter.label}</Text>
          </View>
          <Text style={styles.provider} numberOfLines={1}>
            {meter.provider?.name ?? 'Electricity'} · {meter.account_number}
          </Text>
          <Text style={[styles.status, { color: copy.tone }]}>{copy.title}</Text>
          {meter.shield_context_text ? (
            <Text style={styles.contextLine}>{meter.shield_context_text}</Text>
          ) : null}
          <Text style={styles.hint}>{copy.hint}</Text>
        </View>
      </View>

      {meter.last_purchase_at ? (
        <Text style={styles.meta}>
          Last top-up {formatCurrency(meter.last_purchase_amount_kobo ?? 0)} ·{' '}
          {new Date(meter.last_purchase_at).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
      ) : null}

      {meter.needs_daily_spend_setup ? <PowerShieldDailySpendSetup meter={meter} compact /> : null}

      <GoldCTAButton
        label="Recharge before blackout"
        onPress={recharge}
        isDisabled={!meter.provider}
      />

      {showAlertFeedback ? (
        <PowerShieldFeedbackPrompt
          context="alert_check"
          meter={meter}
          compact
          onSubmitted={() => setAlertFeedbackDone(true)}
        />
      ) : null}

      <Pressable onPress={() => setShowTuning((v) => !v)} style={styles.tuneBtn}>
        <Bell size={14} color={luxury.gold} />
        <Text style={styles.tuneText}>{showTuning ? 'Hide alert settings' : 'Alert settings'}</Text>
      </Pressable>

      {showTuning ? (
        <View style={styles.tuning}>
          <Text style={styles.tuningLabel}>Average daily spend</Text>
          <View style={styles.chipRow}>
            {smartDailySpendOptionsKobo(meter).map((amountKobo) => {
              const active =
                (meter.user_daily_spend_kobo ?? meter.learned_daily_spend_kobo ?? meter.daily_spend_kobo) ===
                amountKobo;
              return (
                <Pressable
                  key={amountKobo}
                  onPress={() =>
                    updateMeter.mutate({ meterId: meter.id, patch: { daily_spend_kobo: amountKobo } })
                  }
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {formatCurrency(amountKobo)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Auto top-up at 5% (Monnify)</Text>
            <Switch
              value={meter.auto_top_up_enabled ?? false}
              onValueChange={(auto_top_up_enabled) =>
                updateMeter.mutate({ meterId: meter.id, patch: { auto_top_up_enabled } })
              }
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>10% capacity warning</Text>
            <Switch
              value={meter.notify_warn_10 ?? true}
              onValueChange={(notify_warn_10) =>
                updateMeter.mutate({ meterId: meter.id, patch: { notify_warn_10 } })
              }
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>5% critical panic</Text>
            <Switch
              value={meter.notify_critical_5 ?? true}
              onValueChange={(notify_critical_5) =>
                updateMeter.mutate({ meterId: meter.id, patch: { notify_critical_5 } })
              }
            />
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: luxury.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardCrisis: {
    borderColor: PS.crimsonBorder,
    backgroundColor: PS.crimsonDim,
    borderWidth: 2,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 16,
    color: luxury.textPrimary,
  },
  provider: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: luxury.textMuted,
  },
  status: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    marginTop: 4,
  },
  contextLine: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 19,
    color: luxury.textSecondary,
    marginTop: 4,
  },
  hint: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 18,
    color: luxury.textMuted,
  },
  meta: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: luxury.textMuted,
  },
  tuneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  tuneText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: luxury.gold,
  },
  tuning: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: luxury.goldBorder,
  },
  tuningLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: luxury.gold,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: luxury.goldBorder,
  },
  chipActive: {
    backgroundColor: 'rgba(201,168,76,0.14)',
    borderColor: luxury.gold,
  },
  chipText: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: luxury.textMuted,
  },
  chipTextActive: {
    color: luxury.gold,
    fontFamily: fonts.uiMedium,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: luxury.textPrimary,
  },
});
