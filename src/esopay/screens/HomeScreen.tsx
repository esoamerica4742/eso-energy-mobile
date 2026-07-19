import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { EsoPayHomeDashboard } from '@/esopay/components/EsoPayHomeDashboard';
import { EsoPayInlineError } from '@/esopay/components/EsoPayInlineError';
import { useHomeWalletBalance } from '@/esopay/hooks/useHomeWalletBalance';
import { EsoPayHomePayAgain } from '@/esopay/components/EsoPayHomePayAgain';
import { EsoPayHomePredictivePay } from '@/esopay/components/EsoPayHomePredictivePay';
import { EsoPayRecentBillers } from '@/esopay/components/EsoPayRecentBillers';
import { HomeRecentTransactions } from '@/esopay/components/HomeRecentTransactions';
import { EsoPayCashbackGlance } from '@/esopay/components/EsoPayCashbackGlance';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { homeGreeting } from '@/esopay/lib/homeGreeting';
import { grid } from '@/esopay/theme/homeGrid';
import {
  esopayFundWalletHref,
  ESOPAY_BILLS_HREF,
  ESOPAY_HISTORY_HREF,
  ESOPAY_WALLET_HREF,
} from '@/esopay/navigation/routes';


const HOME_SCREEN_DEBUG = false;

function formatFirstName(raw: string): string {
  const first = raw.split(/\s+/)[0] ?? 'there';
  if (!first || first === 'there') return 'there';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function HomeScreen() {
  const scrollPad = useEsoPayScrollPadding({ topExtra: 16, bottomExtra: 16 });
  const router = useRouter();
  const { balanceKobo, walletQuery } = useHomeWalletBalance();
  const user = useEsoPayAuthStore((s) => s.user);

  const firstName = useMemo(() => {
    const meta = user?.user_metadata as { full_name?: string; name?: string } | undefined;
    const raw =
      meta?.full_name?.trim() ||
      meta?.name?.trim() ||
      user?.email?.split('@')[0] ||
      'there';
    return formatFirstName(raw);
  }, [user]);

  const greeting = useMemo(() => homeGreeting(firstName), [firstName]);
  const headerPad = useMemo(() => ({ paddingTop: scrollPad.paddingTop }), [scrollPad.paddingTop]);
  const bodyPad = useMemo(() => ({ paddingBottom: scrollPad.paddingBottom }), [scrollPad.paddingBottom]);

  const navigate = useCallback(
    (href: Parameters<typeof router.push>[0]) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(href);
    },
    [router],
  );

  if (HOME_SCREEN_DEBUG) {
    return (
      <EsoPayScreenShell>
        <View style={styles.debug}>
          <Text style={styles.debugText}>HOME SCREEN TEST</Text>
        </View>
      </EsoPayScreenShell>
    );
  }

  return (
    <EsoPayScreenShell>
      <View style={styles.container}>
        <View style={[styles.heroBlock, headerPad]}>
            <EsoPayHomeDashboard
              greeting={greeting}
              balanceKobo={balanceKobo}
              loading={walletQuery.isLoading && walletQuery.data == null}
              onFundPress={() => navigate(esopayFundWalletHref())}
              onManagePress={() => navigate(ESOPAY_WALLET_HREF)}
            />

            <View style={styles.walletMeta}>
              <EsoPayCashbackGlance />
              {walletQuery.isError && walletQuery.data == null ? (
                <EsoPayInlineError
                  title="Wallet unavailable"
                  message="We could not load your balance. Check your connection and try again."
                  onRetry={() => void walletQuery.refetch()}
                />
              ) : null}

              {walletQuery.isError && walletQuery.data != null ? (
                <EsoPayInlineError
                  title="Balance may be outdated"
                  message="We could not refresh your wallet. The amount shown may not be current."
                  onRetry={() => void walletQuery.refetch()}
                  retryLabel="Refresh balance"
                />
              ) : null}
            </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, bodyPad]}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
        >
          <EsoPayHomePredictivePay />

          <EsoPayRecentBillers onSeeAll={() => navigate(ESOPAY_BILLS_HREF)} />

          <EsoPayHomePayAgain />

          <HomeRecentTransactions onViewAll={() => navigate(ESOPAY_HISTORY_HREF)} />
        </ScrollView>
      </View>
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
  },
  heroBlock: {
    paddingHorizontal: grid.sm,
    marginBottom: 0,
  },
  walletMeta: {
    marginTop: grid.xs,
    marginBottom: grid.md,
    gap: grid.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: grid.sm,
    gap: grid.md,
    paddingTop: grid.md,
  },
  debug: {
    flex: 1,
    minHeight: 400,
    backgroundColor: 'blue',
    borderWidth: 5,
    borderColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center',
    padding: grid.md,
  },
  debugText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
