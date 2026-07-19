import { memo, useEffect, useState } from 'react';
import { ActivityIndicator, InteractionManager, StyleSheet, View } from 'react-native';
import { FleetOverviewMap } from '@/components/fleet/command/FleetOverviewMap';
import { Colors } from '@/tokens/design';
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
        <ActivityIndicator color={Colors.gold} />
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
});
