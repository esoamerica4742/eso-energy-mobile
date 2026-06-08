import { View } from 'react-native';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';

export function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="rounded-[24px] px-5 py-5"
      style={{
        backgroundColor: C.glass,
        borderColor: C.border,
        borderWidth: 1,
      }}
    >
      {children}
    </View>
  );
}
