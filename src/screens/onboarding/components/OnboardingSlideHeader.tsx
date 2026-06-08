import { Text, View } from 'react-native';
import { ONBOARDING_COLORS as C, ONBOARDING_SLIDE_COUNT } from '@/screens/onboarding/theme';

export function OnboardingSlideHeader({ index }: { index: number }) {
  const counter = String(index + 1).padStart(2, '0');
  const total = String(ONBOARDING_SLIDE_COUNT).padStart(2, '0');

  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[12px] font-jakarta-bold tracking-[2.4px]" style={{ color: C.gold }}>
        ESO ENERGY
      </Text>
      <Text className="text-[12px] font-jakarta tracking-[1px]" style={{ color: C.muted }}>
        {counter} / {total}
      </Text>
    </View>
  );
}
