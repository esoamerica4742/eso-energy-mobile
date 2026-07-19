import { NIGERIA_FLEET_REGION } from '@/constants/fleetMapStyle';
import type { FleetSite } from '@/types/fleet';

export type FleetMapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export function buildFleetMapRegion(sites: FleetSite[]): FleetMapRegion {
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

export function projectFleetSite(
  site: FleetSite,
  region: FleetMapRegion,
  width: number,
  height: number,
): { x: number; y: number } {
  const minLng = region.longitude - region.longitudeDelta / 2;
  const maxLat = region.latitude + region.latitudeDelta / 2;
  const x = ((site.longitude - minLng) / region.longitudeDelta) * width;
  const y = ((maxLat - site.latitude) / region.latitudeDelta) * height;
  return {
    x: Math.min(width - 24, Math.max(24, x)),
    y: Math.min(height - 32, Math.max(32, y)),
  };
}
