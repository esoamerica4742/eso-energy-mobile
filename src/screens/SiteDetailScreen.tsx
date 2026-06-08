import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SiteDetailLoadingContent } from '@/components/atoms/Skeleton';
import { EnergyChart } from '@/components/charts/EnergyChart';
import { AmbientControlAtmosphere, OperationalInsightStrip } from '@/components/perceived';
import { SiteAlertsSection } from '@/components/site-detail/SiteAlertsSection';
import { SiteDetailHeader } from '@/components/site-detail/SiteDetailHeader';
import { SiteDetailHero } from '@/components/site-detail/SiteDetailHero';
import { SiteInverterList } from '@/components/site-detail/SiteInverterList';
import { SiteSummaryStrip } from '@/components/site-detail/SiteSummaryStrip';
import { InverterIntelligenceModule } from '@/screens/InverterIntelligenceScreen';
import { useLiveActivityFeed } from '@/hooks/useLiveActivityFeed';
import { useSiteDetail } from '@/hooks/useSiteDetail';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts, spacing as themeSpacing } from '@/theme/tokens';

type Props = {
  siteId: string;
};

export function SiteDetailScreen({ siteId }: Props) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const {
    fleetSite,
    siteMeta,
    chartData,
    inverterRows,
    summary,
    alerts,
    streamingLive,
    smooth,
    operationalInsights,
    sparklineSeed,
    inverterIntelligence,
    isPending,
    isFetching,
    refetch,
  } = useSiteDetail(siteId);

  const activeInsight = useLiveActivityFeed(operationalInsights, streamingLive && smooth);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AmbientControlAtmosphere active={streamingLive} />
      <SiteDetailHeader site={fleetSite} title={siteMeta?.name} onBack={onBack} />

      {isPending ? (
        <SiteDetailLoadingContent />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isFetching}
              onRefresh={onRefresh}
              tintColor={Colors.gold}
            />
          }
        >
          {fleetSite ? (
            <>
              <OperationalInsightStrip insight={activeInsight} streaming={streamingLive} />
              <SiteDetailHero
                site={fleetSite}
                streamingLive={streamingLive}
                smooth={smooth}
                sparklineSeed={sparklineSeed}
              />
              <InverterIntelligenceModule data={inverterIntelligence} embedded hideHeader />
              <View style={styles.block}>
                <EnergyChart data={chartData} />
              </View>
              <SiteSummaryStrip summary={summary} streamingLive={streamingLive} />
              <SiteInverterList
                inverters={inverterRows}
                streamingLive={streamingLive}
                smooth={smooth}
              />
              <SiteAlertsSection alerts={alerts} />
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Site unavailable</Text>
              <Text style={styles.emptyCopy}>
                This site is not in your fleet yet. Pull to refresh or return to the Sites tab.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: themeSpacing.xxxl,
    gap: Spacing.lg,
  },
  block: {
    marginTop: Spacing.sm,
  },
  empty: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
  },
  emptyCopy: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
});

export default SiteDetailScreen;
