import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { CheckCircle2, Sun, Building2, Link2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSolarmanOnboarding } from '@/hooks/useSolarmanOnboarding';
import { useSolarmanConnection } from '@/hooks/useSolarmanConnection';
import { useEnodeToast } from '@/providers/EnodeToastProvider';
import { useSiteStore, selectActiveSite } from '@/stores/siteStore';
import type { SolarmanOrg, SolarmanStation } from '@/services/solarman.types';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type Step = 'credentials' | 'org' | 'station' | 'done';

const STEPS: { icon: typeof Sun; text: string }[] = [
  { icon: Sun, text: 'Sign in with your Solarman / SOLARMAN Smart account' },
  { icon: Building2, text: 'Pick your company org if you use Solarman Business' },
  { icon: Link2, text: 'Link a plant to this ESO site and sync inverters' },
];

export default function LinkSolarmanScreen() {
  const router = useRouter();
  const toast = useEnodeToast();
  const activeSite = useSiteStore(selectActiveSite);
  const connectionQuery = useSolarmanConnection();
  const onboarding = useSolarmanOnboarding();

  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [orgs, setOrgs] = useState<SolarmanOrg[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [stations, setStations] = useState<SolarmanStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [syncSummary, setSyncSummary] = useState<{ stations: number; devices: number } | null>(null);

  const busy =
    onboarding.connect.isPending ||
    onboarding.connectOrg.isPending ||
    onboarding.listStations.isPending ||
    onboarding.linkStation.isPending;

  const credentialPayload = useMemo(
    () => ({
      email: email.trim() || undefined,
      username: username.trim() || undefined,
      password,
    }),
    [email, password, username],
  );

  const onConnect = useCallback(async () => {
    if (!credentialPayload.password || (!credentialPayload.email && !credentialPayload.username)) {
      toast.show('Enter Solarman email or username and password', 'warning');
      return;
    }

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await onboarding.connect.mutateAsync(credentialPayload);

      if (result.requiresOrgSelection) {
        setOrgs(result.orgs);
        setStep('org');
        toast.show('Choose your Solarman business org', 'info');
        return;
      }

      const listed = await onboarding.listStations.mutateAsync();
      setStations(listed.stations);
      setStep('station');
      toast.show('Solarman connected — pick a plant', 'success');
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Solarman connection failed', 'error');
    }
  }, [credentialPayload, onboarding.connect, onboarding.listStations, toast]);

  const onSelectOrg = useCallback(async () => {
    if (!selectedOrgId) {
      toast.show('Select a company org', 'warning');
      return;
    }

    try {
      await onboarding.connectOrg.mutateAsync({
        ...credentialPayload,
        orgId: selectedOrgId,
      });
      const listed = await onboarding.listStations.mutateAsync();
      setStations(listed.stations);
      setStep('station');
      toast.show('Business org linked — pick a plant', 'success');
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Org linking failed', 'error');
    }
  }, [credentialPayload, onboarding.connectOrg, onboarding.listStations, selectedOrgId, toast]);

  const onLinkStation = useCallback(async () => {
    if (!activeSite?.id) {
      toast.show('Select an active site first', 'warning');
      return;
    }
    if (!selectedStationId) {
      toast.show('Select a Solarman plant', 'warning');
      return;
    }

    try {
      const result = await onboarding.linkStation.mutateAsync({
        stationId: selectedStationId,
        siteId: activeSite.id,
      });
      setSyncSummary({ stations: result.stations, devices: result.devices });
      setStep('done');
      toast.show('Solarman plant linked and synced', 'success');
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Plant linking failed', 'error');
    }
  }, [activeSite?.id, onboarding.linkStation, selectedStationId, toast]);

  const linkedCount = connectionQuery.data?.linkedStationCount ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Sun size={22} color={colors.textAccent} />
          </View>
          <View>
            <Text style={styles.brand}>ESO Energy</Text>
            <Text style={styles.partner}>Solarman OpenAPI</Text>
          </View>
        </View>

        <Text style={styles.title}>Connect Solarman</Text>
        <Text style={styles.subtitle}>
          Full onboarding for Solarman Smart and Solarman Business. Credentials are sent securely to
          your ESO backend — never stored on this device.
        </Text>

        <View style={styles.steps}>
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={item.text} style={styles.step}>
                <View style={styles.stepIcon}>
                  <Icon size={16} color={colors.textAccent} />
                </View>
                <Text style={styles.stepText}>{`${index + 1}. ${item.text}`}</Text>
              </View>
            );
          })}
        </View>

        {activeSite ? (
          <View style={styles.siteBanner}>
            <Text style={styles.siteLabel}>Active ESO site</Text>
            <Text style={styles.siteName}>{activeSite.name}</Text>
          </View>
        ) : (
          <View style={styles.warnBanner}>
            <Text style={styles.warnText}>Select a site on the dashboard before linking a plant.</Text>
          </View>
        )}

        {linkedCount > 0 ? (
          <View style={styles.linkedBanner}>
            <CheckCircle2 size={18} color={colors.solarDot} />
            <Text style={styles.linkedText}>
              {linkedCount} Solarman plant{linkedCount === 1 ? '' : 's'} already linked
            </Text>
          </View>
        ) : null}

        {step === 'credentials' ? (
          <View style={styles.form}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@company.com"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
            />
            <Text style={styles.fieldHint}>Or use username below instead of email</Text>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Solarman username"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
            />
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Solarman password"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
            />
            <Pressable style={[styles.cta, busy && styles.ctaDisabled]} onPress={onConnect} disabled={busy}>
              {busy ? <ActivityIndicator color={colors.bgBase} /> : <Text style={styles.ctaLabel}>Connect Solarman</Text>}
            </Pressable>
          </View>
        ) : null}

        {step === 'org' ? (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Select business org</Text>
            {orgs.map((org) => {
              const selected = selectedOrgId === org.companyId;
              return (
                <Pressable
                  key={org.companyId}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => setSelectedOrgId(org.companyId)}
                >
                  <Text style={styles.optionTitle}>{org.companyName}</Text>
                  <Text style={styles.optionMeta}>{org.roleName ?? 'Business account'}</Text>
                </Pressable>
              );
            })}
            <Pressable style={[styles.cta, busy && styles.ctaDisabled]} onPress={onSelectOrg} disabled={busy}>
              {busy ? <ActivityIndicator color={colors.bgBase} /> : <Text style={styles.ctaLabel}>Continue</Text>}
            </Pressable>
          </View>
        ) : null}

        {step === 'station' ? (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Select plant to link</Text>
            {stations.length === 0 ? (
              <Text style={styles.emptyMeta}>No plants found on this Solarman account.</Text>
            ) : null}
            {stations.map((station) => {
              const selected = selectedStationId === station.solarman_station_id;
              return (
                <Pressable
                  key={station.solarman_station_id}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => setSelectedStationId(station.solarman_station_id)}
                >
                  <Text style={styles.optionTitle}>{station.name}</Text>
                  <Text style={styles.optionMeta}>
                    {station.location_address ?? 'Plant'} ·{' '}
                    {station.installed_capacity ? `${station.installed_capacity} kWp` : 'Capacity n/a'}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable style={[styles.cta, busy && styles.ctaDisabled]} onPress={onLinkStation} disabled={busy}>
              {busy ? <ActivityIndicator color={colors.bgBase} /> : <Text style={styles.ctaLabel}>Link plant & sync</Text>}
            </Pressable>
          </View>
        ) : null}

        {step === 'done' ? (
          <View style={styles.donePanel}>
            <CheckCircle2 size={28} color={colors.solarDot} />
            <Text style={styles.doneTitle}>Solarman linked</Text>
            <Text style={styles.doneBody}>
              Synced {syncSummary?.devices ?? 0} device(s) across {syncSummary?.stations ?? 0} plant snapshot(s).
              Your dashboard will populate on the next refresh.
            </Text>
            <Pressable style={styles.cta} onPress={() => router.replace('/(tabs)/monitor' as Href)}>
              <Text style={styles.ctaLabel}>Open dashboard</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable style={styles.secondary} onPress={() => router.back()}>
          <Text style={styles.secondaryText}>Back</Text>
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
  brand: { fontFamily: fonts.bold, fontSize: fontSize.title, color: colors.textPrimary },
  partner: { fontFamily: fonts.regular, fontSize: fontSize.badge, color: colors.textTertiary, marginTop: 2 },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.textPrimary, letterSpacing: -0.5 },
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
  stepText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.body, color: colors.textPrimary },
  siteBanner: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
  },
  siteLabel: { fontFamily: fonts.medium, fontSize: fontSize.badge, color: colors.textTertiary, letterSpacing: 0.8 },
  siteName: { marginTop: 4, fontFamily: fonts.semibold, fontSize: fontSize.body, color: colors.textPrimary },
  warnBanner: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.warningBg,
  },
  warnText: { fontFamily: fonts.medium, fontSize: fontSize.body, color: colors.warningText },
  linkedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.solarBg,
    borderRadius: radius.card,
  },
  linkedText: { fontFamily: fonts.medium, fontSize: fontSize.body, color: colors.solarText },
  form: { marginTop: spacing.xl, gap: spacing.sm },
  fieldLabel: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: fontSize.badge,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  fieldHint: { fontFamily: fonts.regular, fontSize: fontSize.badge, color: colors.textTertiary },
  input: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    backgroundColor: colors.bgElevated,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  option: {
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
    marginBottom: spacing.sm,
  },
  optionSelected: { borderColor: colors.textAccent, backgroundColor: colors.gridBg },
  optionTitle: { fontFamily: fonts.semibold, fontSize: fontSize.body, color: colors.textPrimary },
  optionMeta: { marginTop: 4, fontFamily: fonts.regular, fontSize: fontSize.badge, color: colors.textSecondary },
  emptyMeta: { fontFamily: fonts.regular, fontSize: fontSize.body, color: colors.textSecondary, marginBottom: spacing.md },
  cta: {
    marginTop: spacing.lg,
    backgroundColor: colors.textAccent,
    borderRadius: radius.button,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.6 },
  ctaLabel: { fontFamily: fonts.semibold, fontSize: fontSize.body, color: colors.bgBase },
  donePanel: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
  },
  doneTitle: { fontFamily: fonts.bold, fontSize: fontSize.title, color: colors.textPrimary },
  doneBody: {
    fontFamily: fonts.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  secondary: { marginTop: spacing.lg, alignItems: 'center' },
  secondaryText: { fontFamily: fonts.medium, fontSize: fontSize.body, color: colors.textSecondary },
});
