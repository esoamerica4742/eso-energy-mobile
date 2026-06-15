import { useLocalSearchParams } from 'expo-router';
import InverterProfileScreen from '@/monitoring/auth/inverter/InverterProfileScreen';
import EsoPayRegisterScreen from '@/screens/EsoPayRegisterScreen';
import { paramString } from '@/lib/authRouteParams';

export default function RegisterRoute() {
  const params = useLocalSearchParams();
  const module = paramString(params.module) || 'inverter';
  if (module === 'esopay') return <EsoPayRegisterScreen />;
  return <InverterProfileScreen />;
}
