import {
  clearMasterPin,
  hasMasterPin,
  setMasterPin,
  verifyMasterPin,
} from '@/master/masterPin';
import { MASTER_PIN_LENGTH } from '@/master/constants';

export const OPERATOR_PIN_LENGTH = MASTER_PIN_LENGTH;

export async function hasOperatorPin(userId: string): Promise<boolean> {
  return hasMasterPin(userId);
}

export async function setOperatorPin(userId: string, pin: string): Promise<void> {
  return setMasterPin(userId, pin);
}

export async function verifyOperatorPin(userId: string, pin: string): Promise<boolean> {
  return verifyMasterPin(userId, pin);
}

export async function clearOperatorPin(userId: string): Promise<void> {
  return clearMasterPin(userId);
}
