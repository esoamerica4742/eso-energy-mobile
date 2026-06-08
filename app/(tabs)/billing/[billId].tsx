import { useLocalSearchParams } from 'expo-router';
import { BillDetailScreen } from '@/esopay/screens/BillDetailScreen';

export default function BillDetailRoute() {
  const { billId } = useLocalSearchParams<{ billId: string }>();
  if (!billId) return null;
  return <BillDetailScreen billId={billId} />;
}
