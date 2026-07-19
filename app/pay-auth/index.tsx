import { Redirect } from 'expo-router';
import { MASTER_SIGN_IN_ROUTE } from '@/lib/navigation/productRoutes';

export default function PayAuthRoute() {
  return <Redirect href={MASTER_SIGN_IN_ROUTE} />;
}
