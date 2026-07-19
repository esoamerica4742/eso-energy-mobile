import { Redirect } from 'expo-router';
import { MASTER_REGISTER_ROUTE } from '@/lib/navigation/productRoutes';

export default function InverterProfileRoute() {
  return <Redirect href={MASTER_REGISTER_ROUTE} />;
}
