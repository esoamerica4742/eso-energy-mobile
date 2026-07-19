import { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import Constants from 'expo-constants';
import { useRouter, type Href } from 'expo-router';
import {
  Bell,
  Building2,
  KeyRound,
  LogOut,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Wallet,
} from 'lucide-react-native';
import { ConfirmDialog } from '@/components/primitives/AlertDialog';
import { PremiumSwitch } from '@/components/primitives/Switch';
import { PremiumNavRow } from '@/components/navigation/PremiumNavRow';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { SkeletonListRows } from '@/components/atoms/Skeleton';
import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';
import { SettingsProfileHero } from '@/components/settings/SettingsProfileHero';
import { SettingsSectionGroup } from '@/components/settings/SettingsSectionGroup';
import { SettingsWorkspaceStrip } from '@/components/settings/SettingsWorkspaceStrip';
import { persistMotionPrefsFromStore } from '@/components/auth/MotionPrefsBootstrap';
import { useAppAccess } from '@/hooks/useAppAccess';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { navigateToProductHome } from '@/lib/navigation/productNavigation';
import { ONBOARDING_ROUTE, MASTER_SIGN_IN_ROUTE } from '@/lib/navigation/productRoutes';
import { getDefaultLaunchPreference, setDefaultLaunchPreference } from '@/master/launchPreference';
import { SubscriptionBillingModal } from '@/master/components/SubscriptionBillingModal';
import { signOutUnified } from '@/master/signOutUnified';
import { buildSettingsSnapshot } from '@/lib/settingsData';
import { supabaseConfigured } from '@/lib/supabase';
import { useEnodeToast } from '@/providers/EnodeToastProvider';
import { canManageApiKeys } from '@/lib/monitoring/rbac';
import { selectRole, useAuthStore } from '@/stores/authStore';
import { useSiteStore } from '@/stores/siteStore';
import { useMotionPrefsStore } from '@/stores/motionPrefsStore';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts, spacing as themeSpacing } from '@/theme/tokens';

export function SettingsCommandScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { user, loading } = useSupabaseSession();
  const { isAuthenticated } = useAppAccess();
  const isDemoMode = useDemoModeActive();
  const tenant = useAuthStore((s) => s.tenant);
  const role = useAuthStore(selectRole);
  const siteCount = useSiteStore((s) => s.sites.length);
  const reducedMotion = useMotionPrefsStore((s) => s.reducedMotionEnabled);
  const ambientParallax = useMotionPrefsStore((s) => s.ambientParallaxEnabled);
  const setReducedMotion = useMotionPrefsStore((s) => s.setReducedMotionEnabled);
  const setAmbientParallax = useMotionPrefsStore((s) => s.setAmbientParallaxEnabled);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [defaultLaunch, setDefaultLaunch] = useState(false);
  const toast = useEnodeToast();

  const snapshot = useMemo(
    () =>
      buildSettingsSnapshot({
        email: user?.email,
        companyName: tenant?.company_name,
        role,
        siteCount: siteCount || tenant?.site_ids.length || 0,
        supabaseConfigured,
        isAuthenticated,
        isDemoMode,
      }),
    [isAuthenticated, isDemoMode, role, siteCount, tenant, user?.email],
  );

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const secureLabel = snapshot.connectionStatus === 'live' ? 'SECURE' : 'OFFLINE';

  useEffect(() => {
    void getDefaultLaunchPreference().then((pref) => setDefaultLaunch(pref === 'inverter'));
  }, []);

  const signOut = async () => {
    await signOutUnified();
    router.replace(ONBOARDING_ROUTE as Href);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>
              {snapshot.companyName} · {snapshot.roleLabel}
            </Text>
          </View>
          <View style={styles.securePill}>
            <FleetStatusPulse
              status={snapshot.connectionStatus === 'live' ? 'live' : 'offline'}
              size="sm"
            />
            <Text style={styles.secureText}>{secureLabel}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + themeSpacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        <SettingsProfileHero snapshot={snapshot} />
        <SettingsWorkspaceStrip snapshot={snapshot} />

        <SectionLabel text="EXPERIENCE" />
        <SettingsSectionGroup glowColor="none">
          <PremiumNavRow
            title="Reduce motion"
            subtitle="Respects system accessibility when off"
            icon={SlidersHorizontal}
            showChevron={false}
            trailing={
              <PremiumSwitch
                checked={reducedMotion}
                onCheckedChange={(enabled) => {
                  setReducedMotion(enabled);
                  void persistMotionPrefsFromStore();
                }}
              />
            }
          />
          <PremiumNavRow
            title="Ambient parallax"
            subtitle="Subtle depth on dashboard cards"
            icon={Sparkles}
            showChevron={false}
            trailing={
              <PremiumSwitch
                checked={ambientParallax}
                onCheckedChange={(enabled) => {
                  setAmbientParallax(enabled);
                  void persistMotionPrefsFromStore();
                }}
              />
            }
          />
        </SettingsSectionGroup>

        <SectionLabel text="COMMAND CENTERS" />
        <SettingsSectionGroup>
          <PremiumNavRow
            title="Switch to Eso Pay"
            subtitle="Wallet, utilities, and bill payments"
            icon={Wallet}
            onPress={() => navigateToProductHome(router, 'esopay')}
          />
          <PremiumNavRow
            title="Set as Default Launch Screen"
            subtitle="Open Inverter Monitoring when you unlock the app"
            icon={SlidersHorizontal}
            showChevron={false}
            trailing={
              <PremiumSwitch
                checked={defaultLaunch}
                onCheckedChange={(enabled) => {
                  setDefaultLaunch(enabled);
                  void setDefaultLaunchPreference(enabled ? 'inverter' : null);
                }}
              />
            }
          />
          <PremiumNavRow
            title="Subscription & Billing"
            subtitle="Wallet pool and Monnify funding details"
            icon={KeyRound}
            onPress={() => setBillingOpen(true)}
          />
        </SettingsSectionGroup>

        <SectionLabel text="WORKSPACE" />
        {loading ? (
          <SkeletonListRows rows={4} />
        ) : (
          <SettingsSectionGroup>
            {isAuthenticated && user?.email ? (
              <PremiumNavRow
                title={user.email}
                subtitle="Primary operator account"
                icon={UserRound}
                showChevron={false}
              />
            ) : null}
            <PremiumNavRow
              title="API keys"
              subtitle="Integrations and automation"
              icon={KeyRound}
              onPress={() => {}}
            />
            <PremiumNavRow
              title="Notifications"
              subtitle="Fleet alerts and thresholds"
              icon={Bell}
              onPress={() => router.push('/(tabs)/alerts' as Href)}
            />
            <PremiumNavRow
              title="Organization"
              subtitle="Company profile and sites"
              icon={Building2}
              onPress={() => router.push('/(tabs)/sites' as Href)}
            />
          </SettingsSectionGroup>
        )}

        <SectionLabel text="SESSION" />
        <SettingsSectionGroup glowColor="mint">
          {isAuthenticated && !isDemoMode ? (
            <PremiumNavRow
              title="Sign out"
              subtitle="Return to access screen"
              icon={LogOut}
              destructive
              onPress={() => setSignOutOpen(true)}
            />
          ) : (
            <PremiumNavRow
              title="Sign in"
              subtitle="Email verification code"
              icon={UserRound}
              onPress={() => router.push(MASTER_SIGN_IN_ROUTE)}
            />
          )}
        </SettingsSectionGroup>

        <SectionLabel text="SYSTEM" />
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Platform status</Text>
          <Text style={styles.noteCopy}>
            Supabase {supabaseConfigured ? 'connected' : 'not configured'} · ESO Energy v{appVersion}
            {snapshot.isDemoMode ? ' · Demo fleet active' : ''}
          </Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out of Eso Energy?"
        description="You'll need to sign in again with your email and PIN to access your account on this device."
        actionLabel="Sign out"
        destructive
        onAction={() => {
          setSignOutOpen(false);
          void signOut();
        }}
      />

      <SubscriptionBillingModal
        open={billingOpen}
        onClose={() => setBillingOpen(false)}
        userName={snapshot.companyName ?? user?.email}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: FontSize.title,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  securePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.goldBorderStrong,
    backgroundColor: Colors.goldWhisper,
  },
  secureText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.gold,
    letterSpacing: 1.2,
  },
  content: {
    paddingTop: Spacing.md,
  },
  noteCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
  },
  noteTitle: {
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  noteCopy: {
    marginTop: Spacing.sm,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default SettingsCommandScreen;
