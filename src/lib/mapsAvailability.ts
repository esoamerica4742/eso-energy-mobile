import Constants from 'expo-constants';
import { Platform } from 'react-native';

function readMapsApiKey(): string {
  const fromEnv = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';
  const fromExtra = Constants.expoConfig?.extra?.googleMapsApiKey;
  const fromExtraStr = typeof fromExtra === 'string' ? fromExtra.trim() : '';
  return fromEnv || fromExtraStr;
}

/** Native Google Maps is only mounted when a non-empty API key is configured. */
export function isGoogleMapsAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  return readMapsApiKey().length > 10;
}

export function getGoogleMapsApiKey(): string {
  return readMapsApiKey();
}
