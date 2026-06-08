import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSecureJson, removeSecureItem, setSecureJson } from '@/lib/secureStorage';

const KEYS = {
  enodeTokens: 'secure.eso.enode_tokens.v1',
  meterCredentials: 'secure.eso.meter_credentials.v1',
} as const;

const LEGACY_ASYNC_KEYS = [
  '@eso:enode:access_token',
  '@eso:enode:refresh_token',
  '@eso:meter:credentials',
  '@eso:wallet:balance',
];

export type EnodeTokens = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number | null;
};

export type MeterCredentials = {
  meterId: string;
  username: string;
  password: string;
};

export async function saveEnodeTokens(tokens: EnodeTokens): Promise<void> {
  await setSecureJson(KEYS.enodeTokens, tokens);
}

export function loadEnodeTokens(): Promise<EnodeTokens | null> {
  return getSecureJson<EnodeTokens>(KEYS.enodeTokens);
}

export function clearEnodeTokens(): Promise<void> {
  return removeSecureItem(KEYS.enodeTokens);
}

export async function saveMeterCredentials(credentials: MeterCredentials): Promise<void> {
  await setSecureJson(KEYS.meterCredentials, credentials);
}

export function loadMeterCredentials(): Promise<MeterCredentials | null> {
  return getSecureJson<MeterCredentials>(KEYS.meterCredentials);
}

export function clearMeterCredentials(): Promise<void> {
  return removeSecureItem(KEYS.meterCredentials);
}

export async function migrateLegacySensitiveStorage(): Promise<void> {
  try {
    const [accessToken, refreshToken, meterRaw] = await Promise.all([
      AsyncStorage.getItem(LEGACY_ASYNC_KEYS[0]),
      AsyncStorage.getItem(LEGACY_ASYNC_KEYS[1]),
      AsyncStorage.getItem(LEGACY_ASYNC_KEYS[2]),
    ]);

    if (accessToken) {
      await saveEnodeTokens({
        accessToken,
        refreshToken: refreshToken ?? null,
        expiresAt: null,
      });
    }

    if (meterRaw) {
      try {
        const parsed = JSON.parse(meterRaw) as MeterCredentials;
        if (parsed?.meterId && parsed?.username && parsed?.password) {
          await saveMeterCredentials(parsed);
        }
      } catch {
        // Ignore malformed legacy payloads.
      }
    }

    await AsyncStorage.multiRemove(LEGACY_ASYNC_KEYS);
  } catch {
    // Best-effort migration; app runtime should proceed even if migration fails.
  }
}
