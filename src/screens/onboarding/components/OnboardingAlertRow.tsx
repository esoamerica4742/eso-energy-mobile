import { Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';

export type AlertTone = 'red' | 'amber' | 'green';

type Props = {
  icon: string;
  title: string;
  body: string;
  statusChip: string;
  footnote?: string;
  tone: AlertTone;
};

function toneStyles(tone: AlertTone) {
  const color = tone === 'red' ? C.red : tone === 'amber' ? C.gold : C.green;
  const bg =
    tone === 'red'
      ? 'rgba(255,77,106,0.12)'
      : tone === 'amber'
        ? 'rgba(245,200,66,0.12)'
        : 'rgba(0,196,140,0.12)';
  return { color, bg };
}

export function OnboardingAlertRow({
  icon,
  title,
  body,
  statusChip,
  footnote,
  tone,
}: Props) {
  const { color, bg } = toneStyles(tone);

  return (
    <Animated.View
      entering={FadeInUp.duration(420)}
      className="rounded-[18px] px-4 py-3"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <View className="flex-row items-start gap-3">
        <View className="min-w-0 flex-1 flex-row items-start gap-2">
          <View
            className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: bg, borderWidth: 1, borderColor: `${color}55` }}
          >
            <Text className="text-[16px]">{icon}</Text>
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[15px]" style={{ color: C.text, fontFamily: 'Inter_700Bold' }}>
              {title}
            </Text>
            <Text
              className="mt-0.5 text-[14px] leading-[20px]"
              style={{ color: C.muted, fontFamily: 'Inter_400Regular' }}
              numberOfLines={2}
            >
              {body}
            </Text>
          </View>
        </View>

        <View className="max-w-[108px] shrink-0 items-end pt-0.5">
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: bg, borderWidth: 1, borderColor: `${color}55` }}
          >
            <Text
              className="text-[12px]"
              style={{ color, fontFamily: 'Inter_600SemiBold' }}
              numberOfLines={1}
            >
              {statusChip}
            </Text>
          </View>
          {footnote ? (
            <Text
              className="mt-1 text-[11px] leading-[14px]"
              style={{ color: C.muted, fontFamily: 'Inter_400Regular', textAlign: 'right' }}
              numberOfLines={2}
            >
              {footnote}
            </Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
