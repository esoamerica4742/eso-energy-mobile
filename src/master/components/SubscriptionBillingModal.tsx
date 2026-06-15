import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Copy, X } from 'lucide-react-native';
import { useWallet } from '@/esopay/api/hooks/useBilling';
import { useFundWalletProvision } from '@/esopay/hooks/useFundWalletProvision';
import { useEnodeToast } from '@/providers/EnodeToastProvider';

type Props = {
  open: boolean;
  onClose: () => void;
  userName?: string | null;
};

function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

export function SubscriptionBillingModal({ open, onClose, userName }: Props) {
  const toast = useEnodeToast();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { reserved, loading: accountLoading } = useFundWalletProvision();

  const balanceKobo = wallet?.balance_kobo ?? 0;
  const isActive = balanceKobo > 0;
  const loading = walletLoading || accountLoading;

  const copyAccount = useCallback(async () => {
    if (!reserved?.account_number) return;
    await Clipboard.setStringAsync(reserved.account_number);
    toast.show('Account number copied', 'success');
  }, [reserved?.account_number, toast]);

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/70">
        <View className="rounded-t-3xl bg-[#0D1018] px-6 pb-8 pt-5">
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-white">Subscription & Billing</Text>
            <Pressable onPress={onClose} accessibilityRole="button">
              <X size={22} color="#8A94A6" />
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color="#C9A84C" className="my-8" />
          ) : (
            <>
              <View className="mb-6 flex-row items-center justify-between rounded-xl border border-[#1C2030] bg-[#080A0F] p-4">
                <Text className="text-sm text-[#8A94A6]">Subscription status</Text>
                <View
                  className={`rounded-full px-3 py-1 ${isActive ? 'bg-[#00C48C22]' : 'bg-[#EF444422]'}`}
                >
                  <Text
                    className={`text-xs font-bold ${isActive ? 'text-[#00C48C]' : 'text-[#EF4444]'}`}
                  >
                    {isActive ? 'Active' : 'Expired / Paused'}
                  </Text>
                </View>
              </View>

              <Text className="mb-1 text-xs uppercase tracking-wider text-[#8A94A6]">
                Wallet balance
              </Text>
              <Text className="mb-6 text-3xl font-bold text-[#C9A84C]">
                {formatNaira(balanceKobo)}
              </Text>

              {reserved ? (
                <View className="rounded-xl border border-[#1C2030] bg-[#080A0F] p-4">
                  <Text className="mb-3 text-sm font-semibold text-white">Monnify funding</Text>
                  <Row label="Bank" value={reserved.bank_name ?? '—'} />
                  <Row
                    label="Account number"
                    value={reserved.account_number ?? '—'}
                    trailing={
                      reserved.account_number ? (
                        <Pressable onPress={() => void copyAccount()} className="p-1">
                          <Copy size={18} color="#C9A84C" />
                        </Pressable>
                      ) : null
                    }
                  />
                  <Row
                    label="Account name"
                    value={`Eso Energy - ${userName?.trim() || 'Account Holder'}`}
                  />
                  <Text className="mt-3 text-xs leading-5 text-[#6B7280]">
                    Your subscription auto-deducts from this central balance pool.
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Row({
  label,
  value,
  trailing,
}: {
  label: string;
  value: string;
  trailing?: React.ReactNode;
}) {
  return (
    <View className="mb-2 flex-row items-center justify-between gap-3">
      <View className="flex-1">
        <Text className="text-[11px] text-[#6B7280]">{label}</Text>
        <Text className="text-sm text-white">{value}</Text>
      </View>
      {trailing}
    </View>
  );
}
