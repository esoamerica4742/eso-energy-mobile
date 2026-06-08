import * as Crypto from 'expo-crypto';
import { getSecureItem, removeSecureItem, setSecureItem } from '@/lib/secureStorage';

const PIN_KEY_PREFIX = 'monitor.operator_pin.';
export const OPERATOR_PIN_LENGTH = 4;

function pinKey(userId: string): string {
  return `${PIN_KEY_PREFIX}${userId}`;
}

async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export async function hasOperatorPin(userId: string): Promise<boolean> {
  if (!userId) return false;
  const stored = await getSecureItem(pinKey(userId));
  return Boolean(stored);
}

export async function setOperatorPin(userId: string, pin: string): Promise<void> {
  if (!userId) throw new Error('Sign in to set your operator PIN');
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be exactly 4 digits');

  const salt = Crypto.randomUUID();
  const digest = await hashPin(pin, salt);
  await setSecureItem(pinKey(userId), `${salt}:${digest}`);
}

export async function verifyOperatorPin(userId: string, pin: string): Promise<boolean> {
  if (!userId || !/^\d{4}$/.test(pin)) return false;

  const stored = await getSecureItem(pinKey(userId));
  if (!stored) return false;

  const [salt, digest] = stored.split(':');
  if (!salt || !digest) return false;

  const candidate = await hashPin(pin, salt);
  return candidate === digest;
}

export async function clearOperatorPin(userId: string): Promise<void> {
  if (!userId) return;
  await removeSecureItem(pinKey(userId));
}
