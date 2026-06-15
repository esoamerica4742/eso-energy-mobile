import {
  clearMasterPin,
  hasMasterPin,
  setMasterPin,
  verifyMasterPin,
} from '@/master/masterPin';
import { MASTER_PIN_LENGTH } from '@/master/constants';

export const LOGIN_PIN_LENGTH = MASTER_PIN_LENGTH;

export async function hasLoginPin(userId: string): Promise<boolean> {
  return hasMasterPin(userId);
}

export async function setLoginPin(userId: string, pin: string): Promise<void> {
  return setMasterPin(userId, pin);
}

export async function verifyLoginPin(userId: string, pin: string): Promise<boolean> {
  return verifyMasterPin(userId, pin);
}

export async function clearLoginPin(userId: string): Promise<void> {
  return clearMasterPin(userId);
}
