import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingProgressDot } from '@/screens/onboarding/components/OnboardingProgressDot';
import { footerBottomPadding } from '@/lib/layout/safeArea';
import { ONBOARDING_COLORS as C, ONBOARDING_SLIDE_COUNT } from '@/screens/onboarding/theme';

type Props = {
  index: number;
  bottomInset: number;
  onSkip: () => void;
  onNext: () => void;
};

export function OnboardingBottomNav({ index, bottomInset, onSkip, onNext }: Props) {
  const last = index === ONBOARDING_SLIDE_COUNT - 1;

  const paddingBottom = footerBottomPadding(
    { top: 0, right: 0, bottom: bottomInset, left: 0 },
  );

  return (
    <View
      className="flex-row items-center justify-between px-5"
      style={{ paddingBottom }}
    >
      {!last ? (
        <Pressable onPress={onSkip} hitSlop={10} accessibilityRole="button" accessibilityLabel="Skip onboarding">
          <View
            className="rounded-full px-4 py-2"
            style={{
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: 'rgba(245,200,66,0.20)',
            }}
          >
            <Text style={{ color: C.muted, fontFamily: 'Inter_500Medium', fontSize: 14 }}>Skip</Text>
          </View>
        </Pressable>
      ) : (
        <View style={{ width: 72 }} />
      )}

      <View className="flex-row items-center gap-2">
        {Array.from({ length: ONBOARDING_SLIDE_COUNT }, (_, i) => (
          <OnboardingProgressDot key={i} active={index === i} />
        ))}
      </View>

      <View className="items-end">
        {last ? (
          <Text
            className="mb-2 text-[11px]"
            style={{
              color: C.muted,
              fontFamily: 'Inter_400Regular',
              textAlign: 'right',
              maxWidth: 240,
              alignSelf: 'flex-end',
              opacity: 0.85,
            }}
          >
            Free to start · No hardware required
          </Text>
        ) : null}
        <Pressable
          onPress={onNext}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={last ? 'Get started' : 'Next slide'}
        >
          {last ? (
            <LinearGradient
              colors={['#F8D56A', '#E8B923', '#C8940F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 999,
                paddingHorizontal: 22,
                paddingVertical: 13,
                borderWidth: 1,
                borderColor: 'rgba(255,235,160,0.45)',
              }}
            >
              <Text style={{ color: '#1A1205', fontFamily: 'Inter_700Bold', fontSize: 14 }}>
                Get Started →
              </Text>
            </LinearGradient>
          ) : (
            <View
              className="rounded-full px-5 py-3"
              style={{
                backgroundColor: 'rgba(245,200,66,0.16)',
                borderWidth: 1,
                borderColor: 'rgba(245,200,66,0.35)',
              }}
            >
              <Text style={{ color: C.gold, fontFamily: 'Inter_700Bold', fontSize: 14 }}>
                Next →
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
