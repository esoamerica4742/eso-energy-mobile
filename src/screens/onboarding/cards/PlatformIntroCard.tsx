import { Text, View } from 'react-native';
import { Pulse, Wallet } from 'phosphor-react-native';
import { GlassCard } from '@/screens/onboarding/components/GlassCard';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';

function ModuleTile({
  title,
  subtitle,
  tone,
  Icon,
}: {
  title: string;
  subtitle: string;
  tone: 'teal' | 'gold';
  Icon: typeof Pulse;
}) {
  const accent = tone === 'teal' ? C.green : C.gold;
  const bg = tone === 'teal' ? 'rgba(0,196,140,0.12)' : 'rgba(245,200,66,0.12)';

  return (
    <View
      className="flex-1 rounded-2xl px-4 py-4"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      <View
        className="mb-3 h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: bg }}
      >
        <Icon size={20} color={accent} weight="fill" />
      </View>
      <Text style={{ color: C.text, fontFamily: 'Inter_700Bold', fontSize: 15 }}>{title}</Text>
      <Text
        className="mt-1"
        style={{ color: C.muted, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

export function PlatformIntroCard() {
  return (
    <GlassCard>
      <Text
        className="mb-3 text-[12px] tracking-[1.6px]"
        style={{ color: C.muted, fontFamily: 'Inter_600SemiBold' }}
      >
        YOUR COMMAND CENTERS
      </Text>
      <View className="flex-row gap-3">
        <ModuleTile
          title="Monitoring"
          subtitle="Fleet telemetry, alerts, and site intelligence"
          tone="teal"
          Icon={Pulse}
        />
        <ModuleTile
          title="Eso Pay"
          subtitle="Wallet, utilities, and bill settlements"
          tone="gold"
          Icon={Wallet}
        />
      </View>
      <View
        className="mt-4 rounded-2xl px-4 py-3"
        style={{
          backgroundColor: 'rgba(245,200,66,0.08)',
          borderWidth: 1,
          borderColor: 'rgba(245,200,66,0.22)',
        }}
      >
        <Text style={{ color: C.gold, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>
          One sign-in per module
        </Text>
        <Text
          className="mt-1"
          style={{ color: C.muted, fontFamily: 'Inter_400Regular', fontSize: 12 }}
        >
          Independent sessions · Separate data · Enterprise security
        </Text>
      </View>
    </GlassCard>
  );
}
