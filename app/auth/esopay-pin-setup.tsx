import { Redirect } from 'expo-router';
import { MASTER_PIN_SETUP_ROUTE } from '@/lib/navigation/productRoutes';

export default function EsoPayPinSetupRoute() {
  return <Redirect href={MASTER_PIN_SETUP_ROUTE} />;
}
