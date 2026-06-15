import { useMemo, useState } from 'react';
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
  Shield,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from 'lucide-react-native';
import { ConfirmDialog } from '@/components/primitives/AlertDialog';
import { PremiumSwitch } from '@/components/primitives/Switch';
import { PremiumNavRow } from '@/components/navigation/PremiumNavRow';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { SkeletonListRows } from '@/components/atoms/Skeleton';
import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';
import { OperatorPinModal } from '@/components/settings/OperatorPinModal';
import { SettingsProfileHero } from '@/components/settings/SettingsProfileHero';
import { SettingsSectionGroup } from '@/components/settings/SettingsSectionGroup';
import { SettingsWorkspaceStrip } from '@/components/settings/SettingsWorkspaceStrip';
import { persistMotionPrefsFromStore } from '@/components/auth/MotionPrefsBootstrap';
import { useAppAccess } from '@/hooks/useAppAccess';
import { useOperatorPin } from '@/hooks/useOperatorPin';
import { useDemoModeActive } from '@/providers/DemoModeProvider';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { signOutMonitoring } from '@/lib/auth/signOutMonitoring';
import { ACCESS_ROUTE, MONITORING_LOGIN_ROUTE } from '@/lib/navigation/productRoutes';
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
  const [pinOpen, setPinOpen] = useState(false);
  const toast = useEnodeToast();
  const { pinConfigured, isChecking: pinChecking, configurePin } = useOperatorPin();

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

  const signOut = async () => {
    await signOutMonitoring();
    router.replace('/access' as Href);
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
              title="Operator PIN"
              subtitle={
                pinChecking
                  ? 'Checking…'
                  : pinConfigured
                    ? 'Tap to change your 4-digit PIN'
                    : 'Set a 4-digit PIN for operator actions'
              }
              icon={Shield}
              value={pinConfigured ? 'Set' : 'Off'}
              onPress={() => {
                if (!isAuthenticated || isDemoMode) {
                  router.push(MONITORING_LOGIN_ROUTE);
                  return;
                }
                setPinOpen(true);
              }}
            />
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
              onPress={() => router.push(MONITORING_LOGIN_ROUTE)}
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
        title="Sign out of monitoring?"
        description="You'll need to sign in again to access fleet monitoring on this device. Your Eso Pay session stays signed in."
        actionLabel="Sign out"
        destructive
        onAction={() => {
          setSignOutOpen(false);
          void signOut();
        }}
      />

      <OperatorPinModal
        open={pinOpen}
        onOpenChange={setPinOpen}
        pinConfigured={pinConfigured}
        onSave={async (pin) => {
          await configurePin(pin);
          toast.show(
            pinConfigured ? 'Operator PIN updated' : 'Operator PIN created',
            'success',
          );
        }}
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
