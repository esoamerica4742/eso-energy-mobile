/** Unified master account — Eso Energy Tech Limited. */
export const MASTER_PIN_LENGTH = 4;

export const MASTER_PIN_STORAGE_PREFIX = 'master_user_pin_';

export const DEFAULT_LAUNCH_PREFERENCE_KEY = 'default_launch_preference';

export type DefaultLaunchPreference = 'inverter' | 'eso_pay' | null;

export type MasterCountryCode = 'NG' | 'GH' | 'KE' | 'ZA';

export type MasterCountry = {
  code: MasterCountryCode;
  name: string;
  flag: string;
  dialCode: string;
};

export const MASTER_COUNTRIES: MasterCountry[] = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
];
