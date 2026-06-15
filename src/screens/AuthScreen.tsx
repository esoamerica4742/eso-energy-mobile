import { Redirect, useLocalSearchParams } from 'expo-router';
import EsoPaySignIn from '@/esopay/auth/EsoPaySignIn';
import { MONITORING_LOGIN_ROUTE } from '@/lib/navigation/productRoutes';
import { paramString } from '@/lib/authRouteParams';

export default function AuthScreen() {
  const params = useLocalSearchParams();
  const module = paramString(params.module) || 'inverter';

  if (module === 'esopay') {
    return <EsoPaySignIn />;
  }

  return <Redirect href={MONITORING_LOGIN_ROUTE} />;
}
