import { Redirect } from 'expo-router';
import { ESOPAY_LOGIN_ROUTE } from '@/lib/navigation/productRoutes';

/** Legacy phone OTP route — email OTP via /login?module=esopay is the only Eso Pay auth. */
export default function PayAuthDeprecatedRedirect() {
  return <Redirect href={ESOPAY_LOGIN_ROUTE} />;
}
