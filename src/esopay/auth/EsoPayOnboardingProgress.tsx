import { StyleSheet, Text, View } from 'react-native';
import { GOLD } from '@/theme/colors';

export const ESO_PAY_ONBOARDING_TOTAL_STEPS = 4;

type Props = {
  step: number;
};

export function EsoPayOnboardingStepLabel({ step }: Props) {
  return (
    <Text style={styles.stepText}>
      {step} of {ESO_PAY_ONBOARDING_TOTAL_STEPS}
    </Text>
  );
}

type BarProps = Props & {
  marginBottom?: number;
};

export function EsoPayOnboardingProgressBar({ step, marginBottom = 32 }: BarProps) {
  return (
    <View style={[styles.progressBar, marginBottom != null && { marginBottom }]}>
      {Array.from({ length: ESO_PAY_ONBOARDING_TOTAL_STEPS }, (_, index) => (
        <View
          key={index}
          style={index < step ? styles.progressFilled : styles.progressUnfilled}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stepText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 32,
  },
  progressFilled: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  progressUnfilled: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
