/**
 * Monitoring-only boot work — skipped on Eso Pay routes for speed.
 */
import { usePathname } from 'expo-router';
import { TenantBootstrap } from '@/components/auth/TenantBootstrap';
import { AlertsBootstrap } from '@/components/auth/AlertsBootstrap';
import { DataPrefetchBootstrap } from '@/components/cache/DataPrefetchBootstrap';
import { useAuthStore, selectIsLoggedIn } from '@/stores/authStore';


function isBillingPath(pathname: string | null) {
  return Boolean(pathname?.includes('/billing'));
}

export function MonitoringBootstraps() {
  const pathname = usePathname();
  const monitoringSignedIn = useAuthStore(selectIsLoggedIn);

  if (isBillingPath(pathname) && !monitoringSignedIn) {
    return null;
  }

  return (
    <>
      <TenantBootstrap />
      <DataPrefetchBootstrap />
      <AlertsBootstrap />
    </>
  );
}
