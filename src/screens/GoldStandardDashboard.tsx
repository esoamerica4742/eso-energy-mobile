import { type ReactNode, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MonitoringLayout, Spacing } from '@/tokens/design';
import { Fonts } from '@/tokens/fonts';
import { EnergyOrchestrationCard } from '@/components/cards/EnergyOrchestrationCard';
import { KPISavingsCard } from '@/components/cards/KPISavingsCard';
import { NetDailySavingsCard } from '@/components/dashboard/NetDailySavingsCard';
import { DashboardStatusBanner } from '@/components/dashboard/DashboardStatusBanner';
import { TierBadge } from '@/components/ui/TierBadge';
import { SiteSelectorChip } from '@/components/ui/SiteSelectorChip';
import { BottomNav } from '@/components/layout/BottomNav';
import { FadeInBlock } from '@/components/layout/FadeInBlock';
import { SavingsMethodologyPanel } from '@/components/dashboard/SavingsMethodologyPanel';
import { createDashboardShell } from '@/lib/monitoring/dashboardShell';
import {
  applyGridIntelligenceDemoOverlay,
  shouldRunGridIntelligenceSimulation,
} from '@/lib/monitoring/gridIntelligenceSimulation';
import { useGridIntelligenceSimulation } from '@/hooks/useGridIntelligenceSimulation';
import type { DashboardData } from '@/types/dashboard';

type Props = {
  data?: DashboardData;
  showBottomNav?: boolean;
  alertCount?: number;
  onSitePress?: () => void;
  onTabChange?: (tab: string) => void;
  showLegacyHeader?: boolean;
  embedded?: boolean;
};

function Block({
  embedded,
  delay,
  children,
  style,
}: {
  embedded: boolean;
  delay?: number;
  children: ReactNode;
  style?: object;
}) {
  if (embedded) {
    return <View style={style}>{children}</View>;
  }
  return (
    <FadeInBlock delay={delay} style={style}>
      {children}
    </FadeInBlock>
  );
}

export function GoldStandardDashboard({
  data,
  showBottomNav = false,
  alertCount = 0,
  onSitePress,
  onTabChange,
  showLegacyHeader = false,
  embedded = false,
}: Props) {
  const base = data ?? createDashboardShell();
  const simulateLive = shouldRunGridIntelligenceSimulation(base, { isDemoMode });
  const simKw = useGridIntelligenceSimulation(simulateLive);
  const resolved = useMemo(
    () => (simulateLive ? applyGridIntelligenceDemoOverlay(base, simKw) : base),
    [base, simulateLive, simKw],
  );
  const mtd = resolved.kpi.subMetrics.find((m) => m.label === 'MTD')?.rawValue ?? 0;
  const dieselAvoided = resolved.kpi.subMetrics.find((m) => m.label === 'DIESEL AVOIDED')?.rawValue ?? 0;
  const solarShare = resolved.kpi.subMetrics.find((m) => m.label === 'SOLAR SHARE')?.rawValue ?? 0;
  const live = resolved.health.status === 'live';

  return (
    <View style={styles.root}>
      {showLegacyHeader ? (
        <>
          <Block embedded={embedded} delay={0} style={styles.block}>
            <View style={styles.header}>
              <View style={styles.logoSquare}>
                <Ionicons name="shield-outline" size={20} color={Colors.gold} />
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.brand}>ESO Energy</Text>
                <TierBadge tier={resolved.site.tier} />
              </View>
            </View>
          </Block>

          <Block embedded={embedded} delay={60} style={styles.block}>
            <SiteSelectorChip siteName={resolved.site.name} onPress={onSitePress} />
          </Block>
        </>
      ) : null}

      {resolved.health.status !== 'live' ? (
        <Block embedded={embedded} delay={90} style={styles.block}>
          <DashboardStatusBanner
            status={resolved.health.status}
            message={resolved.health.message}
            siteName={resolved.site.name}
            updatedAt={resolved.health.updatedAt}
          />
        </Block>
      ) : null}

      <Block embedded={embedded} delay={120} style={styles.block}>
        <EnergyOrchestrationCard
          subLabel={resolved.orchestrationSubLabel}
          nodes={resolved.nodes}
          battery={resolved.battery}
          connectionStatus={resolved.health.status}
          simulationActive={simulateLive}
        />
      </Block>

      <Block embedded={embedded} delay={200} style={styles.block}>
        {embedded ? (
          <View style={styles.savingsStack}>
            <NetDailySavingsCard
              loading={false}
              muted={!live}
              connectionStatus={resolved.health.status}
              dailySavings={resolved.kpi.primaryValue}
              vsAvg={resolved.kpi.delta}
              monthToDate={mtd}
              dieselAvoided={dieselAvoided}
              solarShare={solarShare}
              deltaLabel={resolved.kpi.deltaLabel}
              deltaDirection={resolved.kpi.deltaDirection}
            />
            <SavingsMethodologyPanel live={live} />
          </View>
        ) : (
          <KPISavingsCard kpi={resolved.kpi} connectionStatus={resolved.health.status} />
        )}
      </Block>

      {showBottomNav ? (
        <BottomNav activeTab="Dashboard" onTabChange={onTabChange} alertCount={alertCount} />
      ) : null}
    </View>
  );
}

export function DashboardScroll({
  data,
  showBottomNav = true,
  alertCount = 0,
  onSitePress,
  onTabChange,
}: Props) {
  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GoldStandardDashboard
          data={data}
          showBottomNav={showBottomNav}
          alertCount={alertCount}
          onSitePress={onSitePress}
          onTabChange={onTabChange}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 100,
    gap: Spacing.sm,
  },
  root: {
    gap: MonitoringLayout.cardGap,
  },
  block: {
    width: '100%',
  },
  savingsStack: {
    gap: Spacing.md,
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoSquare: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  brand: {
    fontFamily: Fonts.light,
    fontSize: 16,
    color: Colors.textPrimary,
  },
});

export default GoldStandardDashboard;
