import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type { MapStyleElement } from 'react-native-maps';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { fleetMapStyle, NIGERIA_FLEET_REGION } from '@/constants/fleetMapStyle';
import { FleetMapPin } from '@/components/fleet/command/FleetMapPin';
import { Colors } from '@/tokens/design';
import type { FleetSite } from '@/types/fleet';

type Props = {
  sites: FleetSite[];
  selectedSiteId: string | null;
  onSelectSite: (siteId: string) => void;
};

function buildRegion(sites: FleetSite[]): Region {
  if (sites.length === 0) return NIGERIA_FLEET_REGION;
  if (sites.length === 1) {
    return {
      latitude: sites[0].latitude,
      longitude: sites[0].longitude,
      latitudeDelta: 0.45,
      longitudeDelta: 0.45,
    };
  }

  const lats = sites.map((s) => s.latitude);
  const lngs = sites.map((s) => s.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.8, 0.6),
    longitudeDelta: Math.max((maxLng - minLng) * 1.8, 0.6),
  };
}

export function FleetOverviewMap({ sites, selectedSiteId, onSelectSite }: Props) {
  const region = useMemo(() => buildRegion(sites), [sites]);

  if (Platform.OS === 'web') {
    return <View style={styles.fallback} accessibilityLabel="Map preview unavailable on web" />;
  }

  return (
    <View style={styles.wrap}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={fleetMapStyle as unknown as MapStyleElement[]}
        initialRegion={region}
        region={sites.length === 1 ? region : undefined}
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
  fallback: {
    flex: 1,
    backgroundColor: Colors.surface,
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
