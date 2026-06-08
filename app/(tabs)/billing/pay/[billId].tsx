import { useLocalSearchParams } from 'expo-router';
import { PaymentConfirmScreen } from '@/esopay/screens/PaymentConfirmScreen';

export default function PaymentConfirmRoute() {
  const { billId } = useLocalSearchParams<{ billId: string }>();
  if (!billId) return null;
  return <PaymentConfirmScreen billId={billId} />;
}
