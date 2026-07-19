import { StyleSheet, Text, View } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { SettingsSnapshot } from '@/lib/settingsData';

type Props = {
  snapshot: SettingsSnapshot;
};

export function SettingsProfileHero({ snapshot }: Props) {
  const pulseStatus =
    snapshot.connectionStatus === 'live'
      ? 'live'
      : snapshot.connectionStatus === 'degraded'
        ? 'degraded'
        : 'offline';

  return (
    <CardShell glowColor="none" borderVariant="muted" style={styles.shell}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{snapshot.initials}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.name}>{snapshot.displayName}</Text>
          <Text style={styles.email} numberOfLines={1} ellipsizeMode="middle">
            {snapshot.email}
          </Text>
          <View style={styles.badges}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{snapshot.roleLabel.toUpperCase()}</Text>
            </View>
            {snapshot.isDemoMode ? (
              <View style={styles.demoBadge}>
                <Text style={styles.demoText}>DEMO</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.statusCol}>
          <FleetStatusPulse status={pulseStatus} size="sm" />
          <Text style={styles.statusText}>{snapshot.connectionLabel.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.companyRow}>
        <Text style={styles.companyLabel}>ORGANIZATION</Text>
        <Text style={styles.companyName}>{snapshot.companyName}</Text>
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.goldBorderStrong,
    backgroundColor: Colors.goldWhisper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.gold,
    letterSpacing: 0.6,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  email: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldWhisper,
  },
  roleText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1,
  },
  demoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  demoText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  statusCol: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.micro,
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  companyRow: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  companyLabel: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  companyName: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
});
