import { StyleSheet, View } from 'react-native';
import { Colors, Shadow } from '@/tokens/design';
import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';
import type { FleetSite } from '@/types/fleet';

type Props = {
  status: FleetSite['status'];
  selected?: boolean;
};

const RING = {
  live: Colors.mintBorderStrong,
  degraded: Colors.goldBorderStrong,
  offline: Colors.alertBorder,
} as const;

export function FleetMapPin({ status, selected = false }: Props) {
  return (
    <View style={[styles.wrap, selected && styles.selected, { borderColor: RING[status] }]}>
      <FleetStatusPulse status={status} size="sm" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.mintGlow,
  },
  selected: {
    transform: [{ scale: 1.12 }],
    borderWidth: 2.5,
  },
});
