import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type { MapStyleElement } from 'react-native-maps';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { fleetMapStyle } from '@/constants/fleetMapStyle';
import { FleetMapPin } from '@/components/fleet/command/FleetMapPin';
import { FleetOverviewCanvas } from '@/components/fleet/command/FleetOverviewCanvas';
import { buildFleetMapRegion } from '@/lib/fleetMapProjection';
import { isGoogleMapsAvailable } from '@/lib/mapsAvailability';
import { Colors } from '@/tokens/design';
import type { FleetSite } from '@/types/fleet';

type Props = {
  sites: FleetSite[];
  selectedSiteId: string | null;
  onSelectSite: (siteId: string) => void;
};

export function FleetOverviewMap({ sites, selectedSiteId, onSelectSite }: Props) {
  const region = useMemo(() => buildFleetMapRegion(sites), [sites]);

  if (!isGoogleMapsAvailable()) {
    return (
      <FleetOverviewCanvas
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSelectSite={onSelectSite}
      />
    );
  }

  if (Platform.OS === 'web') {
    return (
      <FleetOverviewCanvas
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSelectSite={onSelectSite}
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={fleetMapStyle as unknown as MapStyleElement[]}
        initialRegion={region as Region}
        region={sites.length === 1 ? (region as Region) : undefined}
        showsCompass={false}
        showsPointsOfInterests={false}
        showsBuildings={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        mapType="standard"
      >
        {sites.map((site) => (
          <Marker
            key={site.id}
            coordinate={{ latitude: site.latitude, longitude: site.longitude }}
            onPress={() => onSelectSite(site.id)}
            accessibilityLabel={`${site.name}, ${site.status}`}
          >
            <FleetMapPin status={site.status} selected={selectedSiteId === site.id} />
          </Marker>
        ))}
      </MapView>
      <View style={styles.vignetteTop} pointerEvents="none" />
      <View style={styles.vignetteBottom} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Colors.bg,
    overflow: 'hidden',
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'rgba(9,9,11,0.35)',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: 'rgba(9,9,11,0.55)',
  },
});
