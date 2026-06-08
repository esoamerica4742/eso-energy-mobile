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
import Animated, { Easing, FadeInUp } from 'react-native-reanimated';
import { PowerShieldDailySpendSetup } from '@/esopay/components/PowerShieldDailySpendSetup';
import { PowerShieldMeterCard } from '@/esopay/components/PowerShieldMeterCard';
import { PowerShieldAlertTimeline } from '@/esopay/components/power-shield/PowerShieldAlertTimeline';
import { PowerShieldHeader } from '@/esopay/components/power-shield/PowerShieldHeader';
import { PowerShieldHeroCard } from '@/esopay/components/power-shield/PowerShieldHeroCard';
import { PowerShieldHowItWorksSection } from '@/esopay/components/power-shield/PowerShieldHowItWorks';
import { PS } from '@/esopay/components/power-shield/powerShieldTheme';
import { usePowerShield, useSyncPowerShield } from '@/esopay/hooks/usePowerShield';
import { usePowerShieldNotifications } from '@/esopay/hooks/usePowerShieldNotifications';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { usePaymentModal } from '@/esopay/context/PaymentModalContext';
import { ESOPAY_BILLS_HREF } from '@/esopay/navigation/routes';
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
            tintColor={PS.amber}
          />
        }
      >
        <PowerShieldHeader />

        {dashboardQuery.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={PS.amber} size="large" />
          </View>
        ) : (
          <Animated.View
            entering={FadeInUp.duration(400).easing(Easing.out(Easing.cubic))}
            style={styles.heroBlock}
          >
            <PowerShieldHeroCard
              active={isActivated}
              meter={primaryMeter}
              onActivate={() => void handleHeroAction()}
              activating={activating || syncMutation.isPending}
            />
            <PowerShieldAlertTimeline
              alertLevel={primaryMeter?.alert_level}
              active={isActivated}
            />
          </Animated.View>
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
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  heroBlock: {
    gap: spacing.lg,
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
