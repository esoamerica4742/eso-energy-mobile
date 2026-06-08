import * as Crypto from 'expo-crypto';
import { getSecureItem, removeSecureItem, setSecureItem } from '@/lib/secureStorage';

const PIN_KEY_PREFIX = 'esopay_login_pin_';
export const LOGIN_PIN_LENGTH = 4;
const STORAGE_SEP = '|';

function pinKey(userId: string): string {
  return `${PIN_KEY_PREFIX}${userId}`;
}

async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}${STORAGE_SEP}${pin}`);
}

export async function hasLoginPin(userId: string): Promise<boolean> {
  if (!userId) return false;
  const stored = await getSecureItem(pinKey(userId));
  return Boolean(stored && stored.includes(STORAGE_SEP));
}

export async function setLoginPin(userId: string, pin: string): Promise<void> {
  if (!userId) throw new Error('User required to set login PIN');
  const normalized = pin.replace(/\D/g, '');
  if (normalized.length !== LOGIN_PIN_LENGTH) {
    throw new Error('PIN must be exactly 4 digits');
  }

  const salt = Crypto.randomUUID();
  const digest = await hashPin(normalized, salt);
  await setSecureItem(pinKey(userId), `${salt}${STORAGE_SEP}${digest}`);
}

export async function verifyLoginPin(userId: string, pin: string): Promise<boolean> {
  if (!userId) return false;
  const normalized = pin.replace(/\D/g, '');
  if (normalized.length !== LOGIN_PIN_LENGTH) return false;

  const stored = await getSecureItem(pinKey(userId));
  if (!stored) return false;
  const sepIndex = stored.indexOf(STORAGE_SEP);
  if (sepIndex < 0) return false;

  const salt = stored.slice(0, sepIndex);
  const digest = stored.slice(sepIndex + 1);
  if (!salt || !digest) return false;

  const candidate = await hashPin(normalized, salt);
  return candidate === digest;
}

export async function clearLoginPin(userId: string): Promise<void> {
  if (!userId) return;
  await removeSecureItem(pinKey(userId));
}

