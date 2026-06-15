import { Text, View } from 'react-native';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';

export function OnboardingSlideHeader() {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[12px] font-jakarta-bold tracking-[2.4px]" style={{ color: C.gold }}>
        ESO ENERGY
      </Text>
    </View>
  );
}
