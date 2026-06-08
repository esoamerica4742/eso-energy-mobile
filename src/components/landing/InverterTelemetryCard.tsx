import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { EnterpriseCard } from './EnterpriseCard';
import { LandingCardSkeleton } from './LandingCardSkeleton';
import { PulsatingLiveDot } from './PulsatingLiveDot';
import { PowerPulseChart } from './PowerPulseChart';
import { useInverterIntelligence } from '@/hooks/useInverterIntelligence';
import { formatKw, formatPercent } from '@/lib/format';
import { telemetrySeriesForPulse } from '@/lib/inverterMetrics';

const LINK_DEVICE_ROUTE = '/link-device' as Href;
const LOGIN_ROUTE = '/login' as Href;

function MetricColumn({
  label,
  value,
  valueClassName = 'text-white',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="flex-1">
      <Text className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{label}</Text>
      <Text className={`mt-2 font-bold text-2xl tracking-tighter ${valueClassName}`}>{value}</Text>
    </View>
  );
}

type Props = {
  enabled: boolean;
};

export function InverterTelemetryCard({ enabled }: Props) {
  const router = useRouter();
  const intel = useInverterIntelligence(enabled);

  if (enabled && intel.isLoading) {
    return <LandingCardSkeleton />;
  }

  const pulseValues = telemetrySeriesForPulse(intel.points);
  const liveBadge = intel.isLive ? '[● LIVE FLOW]' : '[○ SYNCING]';
  const liveBadgeColor = intel.isLive ? 'text-[#00E5FF]' : 'text-zinc-500';

  return (
    <EnterpriseCard>
      <View className="min-h-[48px] flex-row items-start justify-between">
        <Text className="flex-1 pr-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          INVERTER ARRAY TELEMETRY
        </Text>
        <View className="flex-row items-center gap-2">
          {intel.isLive ? <PulsatingLiveDot /> : <View className="h-2 w-2 rounded-full bg-zinc-600" />}
          <Text className={`font-mono text-[10px] uppercase tracking-widest ${liveBadgeColor}`}>
            {liveBadge}
          </Text>
        </View>
      </View>

      {intel.needsSignIn ? (
        <Pressable
          onPress={() => router.push(LOGIN_ROUTE)}
          className="mt-4 min-h-[48px] justify-center rounded-lg border border-zinc-800/60 bg-black/30 px-3 active:opacity-70"
        >
          <Text className="text-center text-sm text-zinc-400">
            Sign in to stream live Enode inverter telemetry
          </Text>
        </Pressable>
      ) : null}

      {intel.needsLink && !intel.needsSignIn ? (
        <Pressable
          onPress={() => router.push(LINK_DEVICE_ROUTE)}
          className="mt-4 min-h-[48px] justify-center rounded-lg border border-zinc-800/60 bg-black/30 px-3 active:opacity-70"
        >
          <Text className="text-center text-sm text-[#00E5FF]">
            Connect inverter via Enode to activate live flow
          </Text>
        </Pressable>
      ) : null}

      <View className="mt-5 flex-row gap-4">
        <MetricColumn label="CURRENT ARRAY LOAD" value={formatKw(intel.loadKw)} />
        <MetricColumn
          label="SYSTEM EFFICIENCY"
          value={formatPercent(intel.efficiencyPct)}
          valueClassName="text-[#00E5FF]"
        />
      </View>

      <PowerPulseChart
        values={pulseValues}
        loading={enabled && intel.isLoading}
        animateFallback={pulseValues.length < 2}
      />

      {intel.device?.display_name ? (
        <Text className="mt-3 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
          {intel.device.display_name}
          {intel.device.vendor ? ` · ${intel.device.vendor}` : ''}
        </Text>
      ) : null}
    </EnterpriseCard>
  );
}
