import { useLocalSearchParams } from 'expo-router';
import { WalletFundScreen } from '@/esopay/screens/WalletFundScreen';

export default function WalletFundRoute() {
  const { amountKobo, billId } = useLocalSearchParams<{
    amountKobo?: string;
    billId?: string;
  }>();

  const parsedAmount = Number(amountKobo ?? 0);

  return (
    <WalletFundScreen
      amountKobo={Number.isFinite(parsedAmount) ? parsedAmount : 0}
      billId={billId}
    />
  );
}
