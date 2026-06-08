/** Dark operations map style — matches ESO Fleet Command palette. */
export const fleetMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0f1011' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5f6368' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1011' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2c2e30' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#151618' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1c1e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#242628' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c2e30' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#3a3d40' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1628' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d5a80' }] },
] as const;

/** Default fleet overview — Nigeria centroid biased toward Lagos operations. */
export const NIGERIA_FLEET_REGION = {
  latitude: 9.082,
  longitude: 8.6753,
  latitudeDelta: 9.5,
  longitudeDelta: 9.5,
};
