import { memo, useEffect, useState } from 'react';
import { InteractionManager, Platform, StyleSheet, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { FleetOverviewMap } from '@/components/fleet/command/FleetOverviewMap';
import { Colors } from '@/tokens/design';
import { colors } from '@/theme/tokens';
import type { FleetSite } from '@/types/fleet';

type Props = {
  active: boolean;
  sites: FleetSite[];
  selectedSiteId: string | null;
  onSelectSite: (siteId: string) => void;
};

/** Defers MapView mount until overview mode is active and UI interactions settle. */
export const LazyFleetOverviewMap = memo(function LazyFleetOverviewMap({
  active,
  sites,
  selectedSiteId,
  onSelectSite,
}: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) {
      setReady(false);
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });

    return () => {
      task.cancel();
      setReady(false);
    };
  }, [active]);

  if (!active || !ready) {
    return (
      <View style={styles.placeholder} accessibilityLabel="Map loading">
        <View style={styles.placeholderOrb}>
          <MapPin size={26} color={colors.gold} strokeWidth={2} />
        </View>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.placeholder} accessibilityLabel="Map preview unavailable on web">
        <View style={styles.placeholderOrb}>
          <MapPin size={26} color={colors.gold} strokeWidth={2} />
        </View>
      </View>
    );
  }

  return (
    <FleetOverviewMap sites={sites} selectedSiteId={selectedSiteId} onSelectSite={onSelectSite} />
  );
});

const styles = StyleSheet.create({
  placeholder: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderOrb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
