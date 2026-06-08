import { memo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/tokens/design';
import { InverterHeader } from '@/components/inverter/InverterHeader';
import { InverterCard } from '@/components/inverter/InverterCard';
import { mockInverter } from '@/data/mockInverter';
import type { InverterData } from '@/types/inverter';

type Props = {
  data?: InverterData;
  embedded?: boolean;
  hideHeader?: boolean;
};

export const InverterIntelligenceModule = memo(function InverterIntelligenceModule({
  data = mockInverter,
  embedded = false,
  hideHeader = false,
}: Props) {
  return <ViewContent data={data} embedded={embedded} hideHeader={hideHeader} />;
});

function ViewContent({
  data,
  embedded,
  hideHeader,
}: {
  data: InverterData;
  embedded: boolean;
  hideHeader: boolean;
}) {
  const body = (
    <>
      {hideHeader ? null : (
        <InverterHeader
          title="Inverter Intelligence Module"
          site={data.site}
          isLive={data.isLive}
          connectionStatus={data.connectionStatus ?? (data.isLive ? 'live' : 'offline')}
        />
      )}
      <InverterCard inverter={data} />
    </>
  );

  if (embedded) {
    return <View style={styles.embeddedContent}>{body}</View>;
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
}

export default function InverterIntelligenceScreen({ data }: { data?: InverterData }) {
  return <InverterIntelligenceModule data={data} />;
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
  embeddedContent: {
    gap: 0,
    width: '100%',
  },
});
