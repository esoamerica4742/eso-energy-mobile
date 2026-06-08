import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { Link2, Shield, Zap, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useEnodeLink } from '@/hooks/useEnodeLink';
import { SkeletonBlock } from '@/components/atoms/Skeleton';
import { useEnodeDevices } from '@/hooks/useEnodeDevices';
import { useEnodeToast } from '@/providers/EnodeToastProvider';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

const LINK_SOLARMAN_ROUTE = '/link-solarman' as Href;

const STEPS = [
  { icon: Shield, text: 'Authorize with your inverter or charger vendor' },
  { icon: Link2, text: 'Enode links the device to your company account' },
  { icon: Zap, text: 'Live power data appears on your dashboard' },
];

export default function LinkDeviceScreen() {
  const router = useRouter();
  const toast = useEnodeToast();
  const link = useEnodeLink();
  const { data: devices = [], isPending, refetch } = useEnodeDevices();
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    if (devices.length > 0) setLinked(true);
  }, [devices.length]);

  const startLink = useCallback(async () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await link.mutateAsync();
      if (result.status === 'linked') {
        setLinked(true);
        toast.show('Device connected successfully', 'success');
        await refetch();
        router.back();
        return;
      }
      if (result.status === 'cancelled') {
        toast.show('Connection cancelled', 'info');
        return;
      }
      toast.show('Connection incomplete — try again', 'warning');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      toast.show(msg, 'error');
    }
  }, [link, toast, refetch, router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>E</Text>
          </View>
          <View>
            <Text style={styles.brand}>ESO Energy</Text>
            <Text style={styles.partner}>Powered by Enode</Text>
          </View>
        </View>

        <Text style={styles.title}>Connect your device</Text>
        <Text style={styles.subtitle}>
          Link solar inverters and EV chargers securely. Credentials never pass
          through ESO servers.
        </Text>

        <View style={styles.steps}>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <View key={i} style={styles.step}>
                <View style={styles.stepIcon}>
                  <Icon size={16} color={colors.textAccent} />
                </View>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            );
          })}
        </View>

        {isPending ? (
          <SkeletonBlock width="100%" height={48} borderRadius={radius.card} style={{ marginBottom: spacing.lg }} />
        ) : linked ? (
          <View style={styles.linkedBanner}>
            <CheckCircle2 size={18} color={colors.solarDot} />
            <Text style={styles.linkedText}>
              {devices.length} device{devices.length === 1 ? '' : 's'} connected
            </Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.cta,
            pressed && styles.ctaPressed,
            link.isPending && styles.ctaDisabled,
          ]}
          onPress={startLink}
          disabled={link.isPending}
        >
          {link.isPending ? (
            <ActivityIndicator color={colors.bgBase} />
          ) : (
            <Text style={styles.ctaLabel}>
              {linked ? 'Connect another device' : 'Connect with Enode'}
            </Text>
          )}
        </Pressable>

        <Pressable style={styles.secondary} onPress={() => router.push(LINK_SOLARMAN_ROUTE)}>
          <Text style={styles.secondaryText}>Connect Solarman instead</Text>
        </Pressable>

        <Pressable style={styles.secondary} onPress={() => router.back()}>
          <Text style={styles.secondaryText}>Back to dashboard</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xxl },
  logo: {
    width: 48,
    height: 48,
    borderRadius: radius.card,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.textAccent,
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: fontSize.title,
    color: colors.textPrimary,
  },
  partner: {
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textTertiary,
    marginTop: 2,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  steps: { marginTop: spacing.xxl, gap: spacing.md },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.button,
    backgroundColor: colors.gridBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  linkedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.solarBg,
    borderRadius: radius.card,
  },
  linkedText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.body,
    color: colors.solarText,
  },
  cta: {
    marginTop: spacing.xxl,
    backgroundColor: colors.textAccent,
    borderRadius: radius.button,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaPressed: { opacity: 0.9 },
  ctaDisabled: { opacity: 0.6 },
  ctaLabel: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
    color: colors.bgBase,
  },
  secondary: { marginTop: spacing.lg, alignItems: 'center' },
  secondaryText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
});
