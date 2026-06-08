import { useEffect, useState } from 'react';
import { useWallet } from '@/esopay/api/hooks/useBilling';

/**
 * Stable wallet balance for Home — never flashes skeleton or toggles on background refetch.
 * Latches the first resolved value and only updates when the API balance actually changes.
 */
export function useHomeWalletBalance() {
  const walletQuery = useWallet();
  const [balanceKobo, setBalanceKobo] = useState(0);

  useEffect(() => {
    const raw = walletQuery.data?.balance_kobo;
    if (raw == null) return;
    setBalanceKobo((prev) => (prev === raw ? prev : raw));
  }, [walletQuery.data?.balance_kobo]);

  return { balanceKobo, walletQuery };
}
