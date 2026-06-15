import {
  clearMasterPin,
  hasMasterPin,
  setMasterPin,
  verifyMasterPin,
} from '@/master/masterPin';
import { MASTER_PIN_LENGTH } from '@/master/constants';

/** @deprecated Use MASTER_PIN_LENGTH — kept for existing imports. */
export const TRANSACTION_PIN_LENGTH = MASTER_PIN_LENGTH;

const LEGACY_PIN_KEY_PREFIX = 'esopay_tx_pin_';
const LEGACY_PIN_KEY_PREFIX_DOT = 'esopay.tx_pin.';

export async function hasTransactionPin(userId: string): Promise<boolean> {
  return hasMasterPin(userId);
}

export async function setTransactionPin(userId: string, pin: string): Promise<void> {
  return setMasterPin(userId, pin);
}

export async function verifyTransactionPin(userId: string, pin: string): Promise<boolean> {
  return verifyMasterPin(userId, pin);
}

export async function clearTransactionPin(userId: string): Promise<void> {
  await clearMasterPin(userId);
}

export { LEGACY_PIN_KEY_PREFIX, LEGACY_PIN_KEY_PREFIX_DOT };
