import { Pressable, Text, View, StyleSheet } from 'react-native';
import { footerBottomPadding } from '@/lib/layout/safeArea';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';
import { inter } from '@/theme/fonts';

type Props = {
  bottomInset: number;
  onGetStarted: () => void;
};

export function OnboardingBottomNav({ bottomInset, onGetStarted }: Props) {
  const paddingBottom = footerBottomPadding({ top: 0, right: 0, bottom: bottomInset, left: 0 });

  return (
    <View style={[styles.wrap, { paddingBottom }]}>
      <Pressable
        onPress={onGetStarted}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Get started"
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaText}>Get Started</Text>
      </Pressable>
      <Text style={styles.hint}>
        Monitoring and Eso Pay — choose your module on the next screen
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cta: {
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    minWidth: 200,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.88,
  },
  ctaText: {
    color: '#000000',
    fontFamily: inter.semibold,
    fontSize: 15,
  },
  hint: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 12,
    color: C.muted,
    fontFamily: inter.regular,
  },
});
