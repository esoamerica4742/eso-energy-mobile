import { Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { PlatformIntroCard } from '@/screens/onboarding/cards/PlatformIntroCard';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';

export type OnboardingSlide = {
  id: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  footerText?: string;
  renderCard: () => ReactNode;
};

function SlideCopy({ title, subtitle }: Pick<OnboardingSlide, 'title' | 'subtitle'>) {
  return (
    <>
      <Text
        className="text-[40px] leading-[48px]"
        style={{ color: C.text, fontFamily: 'Inter_700Bold' }}
      >
        {title}
      </Text>
      <Text className="text-[14px]" style={{ color: C.muted, fontFamily: 'Inter_400Regular' }}>
        {subtitle}
      </Text>
    </>
  );
}

/** Single onboarding screen — fleet monitoring + Eso Pay in one view. */
export const ONBOARDING_SLIDE: OnboardingSlide = {
  id: 'platform',
  title: 'One Platform.\nTwo Command Centers.',
  subtitle:
    'Monitor your solar fleet and pay utility bills from one secure app — one account. One Secure PIN.',
  badgeText: 'ESO ENERGY',
  footerText: 'Trusted by energy operators across Africa.',
  renderCard: () => <PlatformIntroCard />,
};

/** @deprecated Use ONBOARDING_SLIDE — kept for any legacy imports */
export const ONBOARDING_SLIDES = [ONBOARDING_SLIDE] as const;

export function OnboardingSlideContent({ slide }: { slide: OnboardingSlide }) {
  return (
    <View className="gap-5">
      <SlideCopy title={slide.title} subtitle={slide.subtitle} />
      {slide.renderCard()}
      {slide.footerText ? (
        <Text
          className="text-center text-[12px]"
          style={{ color: C.muted, fontFamily: 'Inter_400Regular', lineHeight: 18 }}
        >
          {slide.footerText}
        </Text>
      ) : null}
    </View>
  );
}
