import { useInfiniteQuery } from '@tanstack/react-query';
import { parsePaginatedWalletTransactions } from '@/esopay/api/schemas';
import type { WalletTransactionCategory } from '@/esopay/api/types';
import { useEsoPayApiClient } from '@/esopay/api/useEsoPayApiClient';
import { useEsoPayEnabled } from '@/esopay/api/hooks/useEsoPayApiEnabled';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';
import { esoPayKeys } from '@/esopay/api/queryKeys';

const WALLET_STALE_MS = 30_000;
const DEFAULT_LIMIT = 30;

export function useWalletTransactionsInfinite(options?: {
  limit?: number;
  category?: WalletTransactionCategory;
}) {
  const host = useEsoPayHost();
  const api = useEsoPayApiClient();
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const category = options?.category ?? 'all';
  const enabled = useEsoPayEnabled();

  return useInfiniteQuery({
    queryKey: [...esoPayKeys.all, 'wallet-transactions-infinite', host.companyId, limit, category],
    queryFn: async ({ pageParam }) =>
      parsePaginatedWalletTransactions(
        await api.wallet.getTransactions({ page: pageParam, limit, category }),
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled,
    staleTime: WALLET_STALE_MS,
  });
}
