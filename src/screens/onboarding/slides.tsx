import { Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { AlertTimelineCard } from '@/screens/onboarding/cards/AlertTimelineCard';
import { PortfolioCard } from '@/screens/onboarding/cards/PortfolioCard';
import { SiteOverviewCard } from '@/screens/onboarding/cards/SiteOverviewCard';
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
        className="text-[44px] leading-[52px]"
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

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'overview',
    title: 'See Everything. Instantly.',
    subtitle: 'Live site data across every asset, in one place.',
    badgeText: 'LIVE',
    renderCard: () => <SiteOverviewCard />,
  },
  {
    id: 'predict',
    title: 'Predict Before It Fails.',
    subtitle: 'AI-powered fault detection across every inverter in your fleet.',
    badgeText: 'ALERTS',
    renderCard: () => <AlertTimelineCard />,
  },
  {
    id: 'portfolio',
    title: 'Your Whole Portfolio. One View.',
    subtitle: 'Compare performance across all your sites at a glance.',
    badgeText: 'PORTFOLIO',
    footerText: 'Trusted by energy operators across Africa.',
    renderCard: () => <PortfolioCard />,
  },
];

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
