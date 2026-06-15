import { useRouter } from 'expo-router';
import { EsoPayTransactionPinGate } from '@/esopay/auth/EsoPayTransactionPinGate';
import { ESOPAY_HOME_ROUTE } from '@/lib/navigation/productRoutes';

/** App launch / sign-in — transaction PIN before Eso Pay home. */
export default function EsoPayPinGateScreen() {
  const router = useRouter();

  return (
    <EsoPayTransactionPinGate
      onUnlockSuccess={() => router.replace(ESOPAY_HOME_ROUTE)}
    />
  );
}
