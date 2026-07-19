import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

export type MonitorConnectionTone = 'offline' | 'online' | 'live';

type Props = {
  inverterCount?: number;
  syncLabel?: string;
  connectionTone?: MonitorConnectionTone;
  /** @deprecated Unused — kept for call-site compatibility. */
  tierLabel?: string;
};

function statusStyles(tone: MonitorConnectionTone) {
  if (tone === 'online' || tone === 'live') {
    return {
      border: 'rgba(255,255,255,0.18)',
      bg: 'rgba(255,255,255,0.06)',
      text: '#FFFFFF',
      label: tone === 'live' ? 'LIVE' : 'ONLINE',
      pulse: true as const,
    };
  }
  return {
    border: 'rgba(255,255,255,0.12)',
    bg: 'rgba(255,255,255,0.03)',
    text: 'rgba(255,255,255,0.45)',
    label: 'OFFLINE',
    pulse: false as const,
  };
}

export const MonitorFleetHeader = memo(function MonitorFleetHeader({
  inverterCount = 0,
  syncLabel = 'Awaiting sync',
  connectionTone = 'offline',
}: Props) {
  const reducedMotion = useReducedMotion();
  const status = statusStyles(connectionTone);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>ESO ENERGY</Text>
          <Text style={styles.eyebrow}>Monitoring</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: status.border, backgroundColor: status.bg }]}>
          {status.pulse ? (
            <FleetStatusPulse status="live" size="sm" reducedMotion={reducedMotion} />
          ) : (
            <View style={styles.offlineDot} />
          )}
          <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>

      <Text style={styles.meta}>
        {inverterCount} inverter{inverterCount === 1 ? '' : 's'} · {syncLabel}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.bg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  brandBlock: {
    flex: 1,
    minWidth: 0,
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 2.4,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  eyebrow: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    letterSpacing: 0.2,
    color: 'rgba(255,255,255,0.4)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 28,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
  },
  statusText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  meta: {
    marginTop: Spacing.sm,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 16,
  },
});
