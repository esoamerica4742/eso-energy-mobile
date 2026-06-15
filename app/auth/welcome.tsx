import { Redirect, useLocalSearchParams } from 'expo-router';
import {
  ESOPAY_HOME_ROUTE,
  ESOPAY_PIN_GATE_ROUTE,
  MONITORING_HOME_ROUTE,
} from '@/lib/navigation/productRoutes';

function paramString(value: unknown) {
  if (Array.isArray(value)) return value[0] ?? '';
  return (value ?? '').toString();
}

/** Legacy welcome URL — always land on the correct product dashboard (no mixed UI). */
export default function AuthWelcomeRedirect() {
  const params = useLocalSearchParams();
  const module = paramString(params.module) || 'inverter';
  if (module === 'esopay') {
    return <Redirect href={ESOPAY_PIN_GATE_ROUTE} />;
  }
  return <Redirect href={MONITORING_HOME_ROUTE} />;
}
