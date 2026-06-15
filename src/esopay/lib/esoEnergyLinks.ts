import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export const ESO_ENERGY_WEBSITE = 'https://eso-energy.com';
export const ESO_ENERGY_TERMS_URL = 'https://eso-energy.com/terms';
export const ESO_ENERGY_PRIVACY_URL = 'https://eso-energy.com/privacy';
export const ESO_ENERGY_SUPPORT_EMAIL = 'support@eso-energy.com';

export async function openEsoEnergyWebsite(): Promise<void> {
  await WebBrowser.openBrowserAsync(ESO_ENERGY_WEBSITE);
}

export async function openEsoEnergyTerms(): Promise<void> {
  await WebBrowser.openBrowserAsync(ESO_ENERGY_TERMS_URL);
}

export async function openEsoEnergyPrivacy(): Promise<void> {
  await WebBrowser.openBrowserAsync(ESO_ENERGY_PRIVACY_URL);
}

export async function openEsoEnergySupportEmail(): Promise<void> {
  const url = `mailto:${ESO_ENERGY_SUPPORT_EMAIL}`;
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error(`Could not open your email app. Email ${ESO_ENERGY_SUPPORT_EMAIL} directly.`);
  }
  await Linking.openURL(url);
}
