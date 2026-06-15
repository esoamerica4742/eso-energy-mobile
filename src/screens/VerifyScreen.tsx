import { useLocalSearchParams } from 'expo-router';
import EsoPayOtpVerification from '@/esopay/auth/EsoPayOtpVerification';
import MonitoringOtpVerification from '@/monitoring/auth/MonitoringOtpVerification';
import { paramString } from '@/lib/authRouteParams';

export default function VerifyScreen() {
  const params = useLocalSearchParams();
  const module = paramString(params.module) || 'inverter';

  if (module === 'esopay') {
    return <EsoPayOtpVerification />;
  }

  return <MonitoringOtpVerification />;
}
