import { memo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/tokens/design';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { LiveTelemetryCard } from '@/components/chart/LiveTelemetryCard';
import { useLiveData } from '@/hooks/useLiveData';
import { mockTelemetry } from '@/data/mockTelemetry';
import type { TelemetryData } from '@/types/telemetry';

type Props = {
  initialData?: TelemetryData;
  embedded?: boolean;
  live?: boolean;
  smooth?: boolean;
  hideHeader?: boolean;
  faultTint?: boolean;
};

export const LiveChartModule = memo(function LiveChartModule({
  initialData = mockTelemetry,
  embedded = false,
  live = false,
  smooth = true,
  hideHeader = false,
  faultTint = false,
}: Props) {
  const telemetryData = useLiveData(initialData, live, smooth);

  const body = (
    <>
      {hideHeader ? null : (
        <ScreenHeader leftLabel="Live Chart" rightLabel="Power / Storage" />
      )}
      <LiveTelemetryCard data={telemetryData} animateChart={smooth} faultTint={faultTint} />
    </>
  );

  if (embedded) {
    return <View style={styles.embedded}>{body}</View>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {body}
      </ScrollView>
    </SafeAreaView>
  );
});

export default function LiveChartScreen({ initialData }: { initialData?: TelemetryData }) {
  return <LiveChartModule initialData={initialData} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  embedded: {
    gap: 0,
  },
});
