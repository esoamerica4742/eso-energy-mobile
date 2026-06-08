import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Zap, Sun, Battery } from 'lucide-react-native';
import type { EnodeDevice } from '@/services/enode.types';
import { EnodeConnectionBadge } from '@/components/enode/EnodeConnectionBadge';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type Props = {
  device: EnodeDevice;
  onPress?: () => void;
};

export function EnodeDeviceCard({ device, onPress }: Props) {
  const Icon =
    device.device_type === 'charger'
      ? Zap
      : device.device_type === 'battery'
        ? Battery
        : Sun;

  const powerKw =
    device.production_rate_kw ??
    device.charge_rate_kw ??
    device.grid_power_kw ??
    0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon size={18} color={colors.solarText} />
        </View>
        <View style={styles.titleCol}>
          <Text style={styles.name} numberOfLines={1}>
            {device.display_name ?? device.vendor ?? 'Energy device'}
          </Text>
          <Text style={styles.vendor}>
            {device.vendor ?? device.device_type} · {device.is_reachable ? 'Reachable' : 'Unreachable'}
          </Text>
        </View>
        <EnodeConnectionBadge status={device.connection_status} />
      </View>

      <View style={styles.stats}>
        <Stat label="Power" value={`${Number(powerKw).toFixed(1)} kW`} />
        {device.battery_level_pct != null ? (
          <Stat label="Battery" value={`${device.battery_level_pct}%`} />
        ) : null}
        <Stat
          label="Last seen"
          value={
            device.last_seen_at
              ? new Date(device.last_seen_at).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'
          }
        />
      </View>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  pressed: { backgroundColor: colors.bgElevated },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.button,
    backgroundColor: colors.solarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  vendor: {
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textTertiary,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  stat: { flex: 1 },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
});
