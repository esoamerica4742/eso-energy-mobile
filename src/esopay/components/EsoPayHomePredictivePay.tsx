import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePaymentModal } from '@/esopay/context/PaymentModalContext';
import { useQuickPayInsights } from '@/esopay/hooks/useQuickPayInsights';
import {
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
} from '@/esopay/theme/brandColors';
import { grid } from '@/esopay/theme/homeGrid';
import { inter } from '@/theme/fonts';

/** Home habit CTA — predictive Pay now → trusted PIN. */
export const EsoPayHomePredictivePay = memo(function EsoPayHomePredictivePay() {
  const { openPayment } = usePaymentModal();
  const { predictiveAction, predictiveNudge } = useQuickPayInsights();

  const runPredictivePay = useCallback(() => {
    if (!predictiveAction) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openPayment({
      provider: predictiveAction.provider,
      accountNumber: predictiveAction.accountNumber,
      amountKobo: predictiveAction.amountKobo,
    });
  }, [openPayment, predictiveAction]);

  if (!predictiveAction && !predictiveNudge) return null;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={predictiveAction ? runPredictivePay : undefined}
        disabled={!predictiveAction}
        style={({ pressed }) => [
          styles.nudgeOuter,
          predictiveAction && styles.nudgePressable,
          pressed && predictiveAction && styles.nudgePressed,
        ]}
        accessibilityRole={predictiveAction ? 'button' : undefined}
        accessibilityLabel={
          predictiveAction
            ? `${predictiveAction.label}. Tap to pay`
            : predictiveNudge ?? undefined
        }
      >
        <Text style={styles.nudgeText}>
          {predictiveAction?.label ?? predictiveNudge}
        </Text>
        {predictiveAction ? <Text style={styles.nudgeCta}>Pay now</Text> : null}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: grid.sm,
    marginBottom: grid.sm,
  },
  nudgeOuter: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  nudgePressable: {
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  nudgePressed: {
    opacity: 0.88,
  },
  nudgeText: {
    fontFamily: inter.regular,
    fontSize: 13,
    lineHeight: 18,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  nudgeCta: {
    fontFamily: inter.semibold,
    fontSize: 13,
    color: ESO_PAY_TEXT_PRIMARY,
  },
});
