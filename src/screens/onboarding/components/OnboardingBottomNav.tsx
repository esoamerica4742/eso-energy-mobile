import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { footerBottomPadding } from '@/lib/layout/safeArea';
import { GOLD } from '@/theme/colors';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';

type Props = {
  bottomInset: number;
  onGetStarted: () => void;
};

export function OnboardingBottomNav({ bottomInset, onGetStarted }: Props) {
  const paddingBottom = footerBottomPadding({ top: 0, right: 0, bottom: bottomInset, left: 0 });

  return (
    <View className="items-center px-5" style={{ paddingBottom }}>
      <Pressable
        onPress={onGetStarted}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Get started"
      >
        <LinearGradient
          colors={[GOLD, GOLD, GOLD]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 999,
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: 'rgba(255,235,160,0.35)',
          }}
        >
          <Text style={{ color: '#1A1205', fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>
            Get Started
          </Text>
        </LinearGradient>
      </Pressable>
      <Text
        className="mt-3 text-center text-[12px]"
        style={{ color: C.muted, fontFamily: 'Inter_400Regular' }}
      >
        Monitoring and Eso Pay — choose your module on the next screen
      </Text>
    </View>
  );
}
