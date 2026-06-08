import { Text, View } from 'react-native';
import { GlassCard } from '@/screens/onboarding/components/GlassCard';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';

function MiniSiteCard({
  name,
  city,
  kw,
  tone,
  full,
}: {
  name: string;
  city: string;
  kw: string;
  tone: 'green' | 'amber';
  full?: boolean;
}) {
  const toneColor = tone === 'green' ? C.green : C.gold;
  return (
    <View
      className={`rounded-[18px] px-4 py-3 ${full ? 'w-full' : 'flex-1'}`}
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        ...(full ? { width: '100%', alignSelf: 'stretch' as const } : {}),
      }}
    >
      <Text
        style={{ color: C.text, fontFamily: 'Inter_700Bold', fontSize: 15 }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
      >
        {name} — {city}
      </Text>
      <Text
        className="mt-2"
        style={{ color: C.muted, fontFamily: 'Inter_400Regular', fontSize: 14 }}
      >
        Portfolio site ·{' '}
        <Text style={{ color: toneColor, fontFamily: 'Inter_500Medium' }}>{kw}</Text>
      </Text>
    </View>
  );
}

export function PortfolioCard() {
  return (
    <GlassCard>
      <View className="w-full overflow-hidden">
        <View className="flex-row gap-3">
          <MiniSiteCard name="Site A" city="Lagos" kw="98kW" tone="green" />
          <MiniSiteCard name="Site B" city="Abuja" kw="74kW" tone="green" />
        </View>
        <View className="mt-3 w-full">
          <MiniSiteCard name="Site C" city="Port Harcourt" kw="61kW" tone="amber" full />
        </View>
        <View className="mt-5 flex-row items-end justify-between">
          <Text
            className="text-[14px] tracking-[1.6px]"
            style={{ color: C.muted, fontFamily: 'Inter_600SemiBold' }}
          >
            TOTAL OUTPUT
          </Text>
          <Text className="text-[27px]" style={{ color: C.gold, fontFamily: 'Inter_600SemiBold' }}>
            233 kW
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}
