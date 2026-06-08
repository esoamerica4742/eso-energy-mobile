import * as Haptics from 'expo-haptics';
import { memo, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '@/tokens/design';
import { Fonts } from '@/tokens/fonts';
import type { DbDevice } from '@/services/supabase/types';

type Props = {
  devices: DbDevice[];
  selectedId: string | null;
  onSelect: (deviceId: string) => void;
};

function statusMeta(status: DbDevice['status']) {
  if (status === 'fault') return { label: 'FAULT', accent: Colors.fault, bg: Colors.alertMuted, border: Colors.alertBorder };
  if (status === 'maintenance')
    return { label: 'MAINT', accent: Colors.warning, bg: Colors.warningWhisper, border: Colors.warningBorder };
  if (status === 'offline') return { label: 'OFF', accent: Colors.textMuted, bg: Colors.surfaceRaised, border: Colors.borderSubtle };
  return { label: 'ON', accent: Colors.mint, bg: Colors.mintGlow, border: Colors.mintBorder };
}

export const InverterChipRow = memo(function InverterChipRow({ devices, selectedId, onSelect }: Props) {
  const visible = devices.length > 1;

  const chips = useMemo(
    () =>
      devices.map((device) => {
        const selected = device.id === selectedId;
        const meta = statusMeta(device.status);
        return (
          <Pressable
            key={device.id}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(device.id);
            }}
            style={({ pressed }) => [
              styles.chip,
              { borderColor: selected ? Colors.goldBorderStrong : meta.border, backgroundColor: selected ? Colors.goldWhisper : meta.bg },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Select inverter ${device.name}`}
            accessibilityState={{ selected }}
          >
            <View style={styles.chipTop}>
              <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={1}>
                {device.name}
              </Text>
              {selected ? (
                <View style={[styles.primaryBadge]}>
                  <Text style={[styles.primaryBadgeText]}>PRIMARY</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { borderColor: meta.border, backgroundColor: meta.bg }]}>
                <Text style={[styles.badgeText, { color: meta.accent }]}>{meta.label}</Text>
              </View>
            </View>
            <Text style={styles.sub} numberOfLines={1}>
              {device.model ?? 'Inverter'} · {device.serial ?? '—'}
            </Text>
          </Pressable>
        );
      }),
    [devices, onSelect, selectedId],
  );

  if (!visible) return null;

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      removeClippedSubviews
    >
      {chips}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  chip: {
    minWidth: 220,
    maxWidth: 280,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  chipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontFamily: Fonts.medium,
    fontSize: 12.5,
    color: Colors.textPrimary,
  },
  nameSelected: {
    color: Colors.goldSoft,
  },
  sub: {
    marginTop: 4,
    fontFamily: Fonts.regular,
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  badge: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  badgeRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryBadge: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.goldBorderStrong,
    backgroundColor: Colors.goldWhisper,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  primaryBadgeText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    letterSpacing: 0.9,
    color: Colors.gold,
  },
});

