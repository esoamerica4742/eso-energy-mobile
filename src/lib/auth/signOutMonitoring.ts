import { signOutUnified } from '@/master/signOutUnified';

/** @deprecated Use signOutUnified */
export async function signOutMonitoring(): Promise<void> {
  await signOutUnified();
}
