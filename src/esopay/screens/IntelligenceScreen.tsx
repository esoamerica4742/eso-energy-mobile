import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { SpringEntrance } from '@/lib/motion/SpringEntrance';
import { SPRING_PRIMARY } from '@/lib/motion/springMotion';
import { PowerShieldDailySpendSetup } from '@/esopay/components/PowerShieldDailySpendSetup';
import { PowerShieldMeterCard } from '@/esopay/components/PowerShieldMeterCard';
import { PowerShieldFeatureCards } from '@/esopay/components/power-shield/PowerShieldFeatureCards';
import { PowerShieldHeader } from '@/esopay/components/power-shield/PowerShieldHeader';
import { PowerShieldHeroCard } from '@/esopay/components/power-shield/PowerShieldHeroCard';
import { PowerShieldHowItWorksSection } from '@/esopay/components/power-shield/PowerShieldHowItWorks';
import { EsoPayInlineError } from '@/esopay/components/EsoPayInlineError';
import { PS } from '@/esopay/components/power-shield/powerShieldTheme';
import { usePowerShield, useSyncPowerShield } from '@/esopay/hooks/usePowerShield';
import { usePowerShieldNotifications } from '@/esopay/hooks/usePowerShieldNotifications';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { usePaymentModal } from '@/esopay/context/PaymentModalContext';
import { ESOPAY_BILLS_HREF } from '@/esopay/navigation/routes';
import { ds } from '@/esopay/theme/designSystem';
import { spacing } from '@/esopay/theme/spacing';

export function IntelligenceScreen() {
  const router = useRouter();
  const scrollPad = useEsoPayScrollPadding({ topExtra: spacing.md });
  const { openPayment } = usePaymentModal();
  const dashboardQuery = usePowerShield();
  const syncMutation = useSyncPowerShield();
  const [refreshing, setRefreshing] = useState(false);
  const [activating, setActivating] = useState(false);

  const meters = dashboardQuery.data?.meters ?? [];
  const primaryMeter = meters[0] ?? null;
  const isActivated = meters.length > 0;

  const { registerRemote } = usePowerShieldNotifications(isActivated ? meters : [], {
    enabled: isActivated,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncMutation.mutateAsync();
    } finally {
      setRefreshing(false);
    }
  }, [syncMutation]);

  const handleHeroAction = useCallback(async () => {
    if (isActivated && primaryMeter?.provider) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      openPayment({
        provider: primaryMeter.provider,
        accountNumber: primaryMeter.account_number,
        amountKobo: primaryMeter.last_purchase_amount_kobo ?? primaryMeter.daily_spend_kobo,
      });
      return;
    }

    setActivating(true);
    try {
      const data = await syncMutation.mutateAsync();
      await registerRemote();
      if (data.meters.length > 0) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }
    } catch {
      // No electricity history yet — route to bills.
    } finally {
      setActivating(false);
    }
    router.push(ESOPAY_BILLS_HREF);
  }, [isActivated, openPayment, primaryMeter, registerRemote, router, syncMutation]);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, scrollPad]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={PS.gold}
          />
        }
      >
        <PowerShieldHeader />

        {dashboardQuery.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={PS.gold} size="large" />
          </View>
        ) : dashboardQuery.isError ? (
          <EsoPayInlineError
            title="Could not load Power Shield"
            message="Check your connection and try again."
            onRetry={() => void dashboardQuery.refetch()}
          />
        ) : (
          <SpringEntrance
            delay={0}
            offsetY={20}
            scaleFrom={0.92}
            spring={SPRING_PRIMARY}
            style={styles.heroBlock}
          >
            <PowerShieldHeroCard
              active={isActivated}
              meter={primaryMeter}
              onActivate={() => void handleHeroAction()}
              activating={activating || syncMutation.isPending}
            />
            <PowerShieldFeatureCards />
          </SpringEntrance>
        )}

        {isActivated && primaryMeter?.needs_daily_spend_setup ? (
          <PowerShieldDailySpendSetup meter={primaryMeter} />
        ) : null}

        {isActivated && meters.length > 1 ? (
          <View style={styles.metersSection}>
            {meters.slice(1).map((meter) => (
              <View key={meter.id} style={styles.meterBlock}>
                {meter.needs_daily_spend_setup ? (
                  <PowerShieldDailySpendSetup meter={meter} compact />
                ) : null}
                <PowerShieldMeterCard meter={meter} />
              </View>
            ))}
          </View>
        ) : null}

        <PowerShieldHowItWorksSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PS.bg,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: ds.space.screen,
    gap: ds.space.section,
    paddingBottom: spacing.xxxl,
  },
  heroBlock: {
    gap: ds.space.component,
    marginTop: spacing.sm,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  metersSection: {
    gap: spacing.md,
  },
  meterBlock: {
    gap: spacing.sm,
  },
});
