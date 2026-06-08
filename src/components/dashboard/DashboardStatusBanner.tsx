import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { ConnectionStatus } from '@/types/dashboard';
import { statusAccessibilityLabel } from '@/lib/telemetryStatus';

type Props = {
  status: ConnectionStatus;
  message: string;
  siteName: string;
  updatedAt?: string | null;
};

const STATUS_COLORS: Record<ConnectionStatus, { bg: string; border: string; text: string; label: string }> = {
  live: {
    bg: Colors.mintGlow,
    border: Colors.mintBorder,
    text: Colors.mint,
    label: 'LIVE',
  },
  stale: {
    bg: Colors.goldWhisper,
    border: Colors.goldBorder,
    text: Colors.gold,
    label: 'STALE',
  },
  offline: {
    bg: Colors.surfaceRaised,
    border: Colors.borderSubtle,
    text: Colors.textMuted,
    label: 'OFFLINE',
  },
  fault: {
    bg: Colors.alertMuted,
    border: Colors.alertBorder,
    text: Colors.alert,
    label: 'FAULT',
  },
};

export function DashboardStatusBanner({ status, message, siteName, updatedAt }: Props) {
  if (status === 'live') return null;

  const palette = STATUS_COLORS[status];

  return (
    <View
      style={[styles.wrap, { backgroundColor: palette.bg, borderColor: palette.border }]}
      accessibilityRole="text"
      accessibilityLabel={statusAccessibilityLabel(status, siteName, updatedAt)}
    >
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>CONNECTION STATUS</Text>
        <Text style={[styles.badge, { color: palette.text }]}>{palette.label}</Text>
      </View>
      <Text style={[styles.text, { color: palette.text }]} numberOfLines={2}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  eyebrow: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  badge: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    letterSpacing: 1,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    lineHeight: 20,
  },
});
