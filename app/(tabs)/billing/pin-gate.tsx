import { Redirect } from 'expo-router';
import { ESOPAY_HOME_ROUTE } from '@/lib/navigation/productRoutes';

export default function BillingPinGateRoute() {
  return <Redirect href={ESOPAY_HOME_ROUTE} />;
}
