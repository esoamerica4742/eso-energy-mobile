import { memo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import {
  AmberSyncDot,
  FaultPulseShell,
  PulseStatusBadge,
} from '@/components/monitoring/WaitingStateMotion';

import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';

import { useReducedMotion } from '@/lib/motion/useReducedMotion';

import { Colors, FontSize, MonitoringLayout, Radius, Spacing } from '@/tokens/design';

import { fonts } from '@/theme/tokens';

import type { DashboardCommandSnapshot } from '@/lib/dashboardCommandData';



type Props = {

  snapshot: DashboardCommandSnapshot;

};



function statusPalette(tone: DashboardCommandSnapshot['statusTone']) {
  if (tone === 'live') {
    return {
      accent: '#FFFFFF',
      bg: 'rgba(255,255,255,0.08)',
      border: 'rgba(255,255,255,0.22)',
    };
  }
  if (tone === 'fault') {
    return { accent: Colors.fault, bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.35)' };
  }
  if (tone === 'warning' || tone === 'degraded') {
    return { accent: Colors.warning, bg: Colors.warningWhisper, border: Colors.warningBorder };
  }
  return { accent: Colors.textMuted, bg: Colors.surfaceRaised, border: Colors.borderSubtle };
}

function syncDotColor(tone: DashboardCommandSnapshot['syncDotTone']) {
  if (tone === 'live') return '#FFFFFF';
  if (tone === 'stale') return Colors.warning;
  return Colors.textMuted;
}



export const DashboardCommandHeader = memo(function DashboardCommandHeader({ snapshot }: Props) {

  const reducedMotion = useReducedMotion();

  const status = statusPalette(snapshot.statusTone);



  return (

    <View style={styles.header}>

      <View style={styles.headerTop}>

        <View style={styles.titleBlock}>

          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>
              {snapshot.siteName} · {snapshot.deviceCount} inverter
              {snapshot.deviceCount === 1 ? '' : 's'} ·{' '}
            </Text>
            {snapshot.syncDotTone !== 'live' ? (
              <AmberSyncDot active color={syncDotColor(snapshot.syncDotTone)} />
            ) : null}
            <Text style={styles.subtitle}>{snapshot.lastSyncLabel}</Text>
          </View>

        </View>

        <View style={styles.statusBadgeRow}>
          {snapshot.isDemoMode ? (
            <View style={styles.demoPill}>
              <Text style={styles.demoPillText}>DEMO</Text>
            </View>
          ) : null}
          {snapshot.statusTone === 'live' ? (
            <View style={[styles.statusBadge, { borderColor: status.border, backgroundColor: status.bg }]}>
              <FleetStatusPulse status="live" size="sm" reducedMotion={reducedMotion} />
              <Text style={[styles.statusText, { color: status.accent }]}>{snapshot.statusLabel}</Text>
            </View>
          ) : (
            <PulseStatusBadge
              label={snapshot.statusLabel}
              accent={status.accent}
              bg={status.bg}
              border={status.border}
              badgeStyle={[styles.statusBadge, styles.statusBadgePadded]}
              textStyle={styles.statusText}
            />
          )}
        </View>

      </View>

      {snapshot.alertCount > 0 ? (
        <View style={styles.alertRow}>
          <FaultPulseShell active style={styles.alertPulseWrap}>
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>{snapshot.alertCount} ALERTS</Text>
            </View>
          </FaultPulseShell>
        </View>
      ) : null}

    </View>

  );

});



const styles = StyleSheet.create({

  header: {
    paddingHorizontal: MonitoringLayout.cardMarginH,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderSubtle,
  },

  headerTop: {

    flexDirection: 'row',

    alignItems: 'flex-start',

    justifyContent: 'space-between',

    gap: Spacing.md,

  },

  titleBlock: {

    flex: 1,

    minWidth: 0,

  },

  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 17,
    letterSpacing: 0.15,
  },
  statusBadgeRow: {
    alignItems: 'flex-end',
  },
  statusBadgePadded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statusBadge: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,

    paddingHorizontal: 10,

    paddingVertical: 5,

    borderRadius: Radius.pill,

    borderWidth: 1,

  },

  statusText: {

    fontFamily: fonts.bold,

    fontSize: FontSize.label,

    letterSpacing: 1,

  },

  alertRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },

  alertPulseWrap: {
    borderRadius: Radius.pill,
    borderWidth: 0,
  },
  alertBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.alertBorder,
    backgroundColor: Colors.alertMuted,
  },

  alertText: {

    fontFamily: fonts.bold,

    fontSize: FontSize.label,

    color: Colors.alert,

    letterSpacing: 0.8,

  },

  demoPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldWhisper,
    marginRight: Spacing.xs,
  },
  demoPillText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 0.6,
  },

});


