import { StyleSheet, View } from 'react-native';
import { Colors } from '@/tokens/design';
import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';
import type { FleetSite } from '@/types/fleet';

type Props = {
  status: FleetSite['status'];
  selected?: boolean;
};

const RING = {
  live: 'rgba(255,255,255,0.35)',
  degraded: 'rgba(255,255,255,0.22)',
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
    borderWidth: StyleSheet.hairlineWidth * 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    transform: [{ scale: 1.12 }],
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
  },
});
