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
  tierLabel?: string;
};

function statusStyles(tone: MonitorConnectionTone) {
  if (tone === 'online' || tone === 'live') {
    return {
      border: Colors.mintBorder,
      bg: Colors.mintGlow,
      text: Colors.mint,
      label: tone === 'live' ? 'LIVE' : 'ONLINE',
      pulse: true as const,
    };
  }
  return {
    border: Colors.borderSubtle,
    bg: Colors.surfaceRaised,
    text: Colors.textMuted,
    label: 'OFFLINE',
    pulse: false as const,
  };
}

export const MonitorFleetHeader = memo(function MonitorFleetHeader({
  inverterCount = 0,
  syncLabel = 'Awaiting sync',
  connectionTone = 'offline',
  tierLabel = 'SOVEREIGN FLEET TIER',
}: Props) {
  const reducedMotion = useReducedMotion();
  const status = statusStyles(connectionTone);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>ESO ENERGY</Text>
          <Text style={styles.eyebrow}>GRID INTELLIGENCE</Text>
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
        Fleet site · {inverterCount} inverter{inverterCount === 1 ? '' : 's'} · {syncLabel}
      </Text>

      <View style={styles.tierPill}>
        <Text style={styles.tierText}>{tierLabel}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.bg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  brandBlock: {
    flex: 1,
    minWidth: 0,
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 26,
    letterSpacing: -0.4,
    color: Colors.textPrimary,
    lineHeight: 30,
  },
  eyebrow: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    letterSpacing: 2.4,
    color: Colors.gold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  statusText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    letterSpacing: 1,
  },
  meta: {
    marginTop: Spacing.md,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tierPill: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldWhisper,
  },
  tierText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    letterSpacing: 1.4,
    color: Colors.gold,
  },
});
