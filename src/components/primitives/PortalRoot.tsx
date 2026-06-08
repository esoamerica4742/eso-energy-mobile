import { Platform } from 'react-native';
import { PortalHost as RNPortalHost } from '@rn-primitives/portal';

const DEFAULT_HOST = 'eso-root';

/** Mount once at app root — required for Dialog / AlertDialog portals */
export function AppPortalHost() {
  return <RNPortalHost name={DEFAULT_HOST} />;
}

export const PORTAL_HOST = DEFAULT_HOST;

/** iOS modals render above nav when wrapped — optional enhancement */
export function getPortalHostName() {
  return Platform.OS === 'web' ? undefined : DEFAULT_HOST;
}
