import { memo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckCircle2 } from 'lucide-react-native';
import type {
  PowerShieldFeedbackContext,
  PowerShieldFeedbackOutcome,
  PowerShieldMeter,
} from '@/esopay/api/types';
import { useSubmitPowerShieldFeedback } from '@/esopay/hooks/usePowerShield';
import { luxury } from '@/esopay/theme/luxury';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

type FeedbackOption = {
  outcome: PowerShieldFeedbackOutcome;
  label: string;
};

const POST_PAYMENT_OPTIONS: FeedbackOption[] = [
  { outcome: 'accurate', label: 'Spot on' },
  { outcome: 'too_early', label: 'Too early' },
  { outcome: 'too_late', label: 'Too late' },
  { outcome: 'no_blackout', label: 'No blackout' },
  { outcome: 'had_blackout', label: 'Had blackout' },
];

const ALERT_CHECK_OPTIONS: FeedbackOption[] = [
  { outcome: 'accurate', label: 'Alert matched' },
  { outcome: 'too_early', label: 'Too early' },
  { outcome: 'too_late', label: 'Too late' },
  { outcome: 'no_blackout', label: 'Still have power' },
  { outcome: 'had_blackout', label: 'Already dark' },
];

type Props = {
  context: PowerShieldFeedbackContext;
  meter?: Pick<
    PowerShieldMeter,
    'id' | 'estimated_depletion_at' | 'alert_level' | 'hours_remaining'
  > | null;
  onSubmitted?: () => void;
  compact?: boolean;
};

export const PowerShieldFeedbackPrompt = memo(function PowerShieldFeedbackPrompt({
  context,
  meter,
  onSubmitted,
  compact = false,
}: Props) {
  const submitFeedback = useSubmitPowerShieldFeedback();
  const [submitted, setSubmitted] = useState(false);

  const options = context === 'post_payment' ? POST_PAYMENT_OPTIONS : ALERT_CHECK_OPTIONS;
  const title =
    context === 'post_payment'
      ? 'How accurate was our blackout warning?'
      : 'Did our alert match reality?';

  const handleSelect = (outcome: PowerShieldFeedbackOutcome) => {
    void Haptics.selectionAsync();
    submitFeedback.mutate(
      {
        meter_id: meter?.id,
        context,
        outcome,
        predicted_depletion_at: meter?.estimated_depletion_at,
        alert_level: meter?.alert_level,
        hours_remaining_at_feedback: meter?.hours_remaining,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          onSubmitted?.();
        },
      },
    );
  };

  if (submitted) {
    return (
      <View style={[styles.wrap, compact && styles.wrapCompact]}>
        <CheckCircle2 size={16} color={luxury.gold} strokeWidth={2.2} />
        <Text style={styles.thanks}>Thanks — this improves Power Shield for everyone.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Your answer helps us measure real accuracy.</Text>
      <View style={styles.optionRow}>
        {options.map((option) => (
          <Pressable
            key={option.outcome}
            onPress={() => handleSelect(option.outcome)}
            disabled={submitFeedback.isPending}
            style={({ pressed }) => [
              styles.option,
              pressed && styles.optionPressed,
              submitFeedback.isPending && styles.optionDisabled,
            ]}
          >
            <Text style={styles.optionText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      {submitFeedback.isPending ? (
        <ActivityIndicator color={luxury.gold} size="small" style={styles.loader} />
      ) : null}
      {submitFeedback.isError ? (
        <Text style={styles.errorText}>Could not save feedback. Try again.</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: luxury.goldBorder,
    backgroundColor: 'rgba(232,160,32,0.06)',
  },
  wrapCompact: {
    padding: spacing.sm,
  },
  title: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: luxury.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: luxury.textMuted,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: luxury.goldBorder,
    backgroundColor: luxury.surface,
  },
  optionPressed: {
    backgroundColor: 'rgba(232,160,32,0.14)',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: luxury.textPrimary,
  },
  loader: {
    alignSelf: 'flex-start',
  },
  errorText: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: '#E57373',
  },
  thanks: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 18,
    color: luxury.textMuted,
  },
});
