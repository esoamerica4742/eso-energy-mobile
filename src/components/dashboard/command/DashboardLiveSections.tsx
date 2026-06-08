import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MonitoringLayout } from '@/tokens/design';
import { DashboardSection } from '@/components/dashboard/command/DashboardSection';
import { BatteryLifespanGuardCard } from '@/components/dashboard/command/BatteryLifespanGuardCard';
import { ContractorAuditToolCard } from '@/components/dashboard/command/ContractorAuditToolCard';
import { ThermalLoadStressAlertCard } from '@/components/dashboard/command/ThermalLoadStressAlertCard';
import { DieselFraudAuditHubCard } from '@/components/dashboard/command/DieselFraudAuditHubCard';
import { InverterIntelligenceModule } from '@/screens/InverterIntelligenceScreen';
import { LiveChartModule } from '@/screens/LiveChartScreen';
import type { InverterData } from '@/types/inverter';
import type { TelemetryData } from '@/types/telemetry';
import type { BatteryLifespanSnapshot } from '@/lib/batteryLifespanGuard';
import type { ContractorAuditSnapshot } from '@/lib/contractorAuditData';
import type { ThermalLoadStressSnapshot } from '@/lib/thermalLoadStressAlert';
import type { DieselFraudAuditSnapshot } from '@/lib/dieselFraudAuditData';
import {
  InverterCardSkeleton,
  OperationsGuardSkeleton,
  TelemetryChartSkeleton,
} from '@/components/skeletons';

type DeviceSectionProps = {
  inverterData: InverterData;
  chartData: TelemetryData;
  dieselFraudAudit: DieselFraudAuditSnapshot;
  streamingLive: boolean;
  smooth: boolean;
  telemetryMeta: string;
  chartLoading?: boolean;
  inverterLoading?: boolean;
  faultTint?: boolean;
};

/** Isolates 2s live chart ticks from the rest of the dashboard tree. */
export const DashboardDeviceSection = memo(function DashboardDeviceSection({
  inverterData,
  chartData,
  dieselFraudAudit,
  streamingLive,
  smooth,
  telemetryMeta,
  chartLoading = false,
  inverterLoading = false,
  faultTint = false,
}: DeviceSectionProps) {
  return (
    <DashboardSection title="DEVICE INTELLIGENCE" meta={telemetryMeta}>
      <View style={styles.deviceStack}>
        {inverterLoading ? (
          <InverterCardSkeleton />
        ) : (
          <InverterIntelligenceModule data={inverterData} embedded hideHeader />
        )}
        <DieselFraudAuditHubCard
          snapshot={dieselFraudAudit}
          streamingLive={streamingLive}
          smooth={smooth}
        />
        {chartLoading ? (
          <TelemetryChartSkeleton />
        ) : (
          <LiveChartModule
            initialData={chartData}
            embedded
            live={streamingLive}
            smooth={smooth}
            hideHeader
            faultTint={faultTint}
          />
        )}
      </View>
    </DashboardSection>
  );
});

type GuardSectionProps = {
  batteryGuard: BatteryLifespanSnapshot;
  contractorAudit: ContractorAuditSnapshot;
  thermalLoadStress: ThermalLoadStressSnapshot;
  streamingLive?: boolean;
  smooth?: boolean;
  loading?: boolean;
};

export const DashboardGuardSection = memo(function DashboardGuardSection({
  batteryGuard,
  contractorAudit,
  thermalLoadStress,
  streamingLive = false,
  smooth = true,
  loading = false,
}: GuardSectionProps) {
  if (loading) {
    return (
      <DashboardSection title="OPERATIONS GUARD">
        <OperationsGuardSkeleton />
      </DashboardSection>
    );
  }

  return (
    <DashboardSection title="OPERATIONS GUARD" meta="TELEMETRY MODELS">
      <BatteryLifespanGuardCard
        snapshot={batteryGuard}
        streamingLive={streamingLive}
        smooth={smooth}
      />
      <ContractorAuditToolCard
        snapshot={contractorAudit}
        streamingLive={streamingLive}
        smooth={smooth}
      />
      <ThermalLoadStressAlertCard
        snapshot={thermalLoadStress}
        streamingLive={streamingLive}
        smooth={smooth}
      />
    </DashboardSection>
  );
});

const styles = StyleSheet.create({
  deviceStack: {
    gap: MonitoringLayout.cardGap,
  },
});
