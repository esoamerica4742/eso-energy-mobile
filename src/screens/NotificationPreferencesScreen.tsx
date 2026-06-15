import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { PremiumSwitch } from '@/components/primitives/Switch';
import { useMonitoringNotificationPrefs } from '@/hooks/useMonitoringNotificationPrefs';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

export function NotificationPreferencesScreen() {
  const router = useRouter();
  const { prefs, loading, updatePrefs } = useMonitoringNotificationPrefs();
  const push = usePushNotifications();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Fleet notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Push registration</Text>
          <Text style={styles.cardCopy}>
            {push.pushSupported
              ? push.enabled
                ? 'Device registered for fleet alert pushes.'
                : push.permissionStatus === 'denied'
                  ? 'Notifications are denied in system settings.'
                  : 'Tap refresh in Settings if pushes stop arriving.'
              : 'Use a production EAS build for reliable push on this device.'}
          </Text>
          {push.registrationError ? (
            <Text style={styles.error}>{push.registrationError}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Row
            title="Critical alerts"
            subtitle="Device faults and offline inverters"
            value={prefs.criticalEnabled}
            disabled={loading}
            onChange={(v) => void updatePrefs({ criticalEnabled: v })}
          />
          <Row
            title="Warning alerts"
            subtitle="Stale telemetry and performance drift"
            value={prefs.warningEnabled}
            disabled={loading}
            onChange={(v) => void updatePrefs({ warningEnabled: v })}
          />
          <Row
            title="Info alerts"
            subtitle="Low-priority operational notices"
            value={prefs.infoEnabled}
            disabled={loading}
            onChange={(v) => void updatePrefs({ infoEnabled: v })}
          />
          <Row
            title="Quiet hours"
            subtitle="22:00–07:00 — critical only"
            value={prefs.quietHoursEnabled}
            disabled={loading}
            onChange={(v) => void updatePrefs({ quietHoursEnabled: v })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  title,
  subtitle,
  value,
  disabled,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <PremiumSwitch checked={value} disabled={disabled} onCheckedChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: FontSize.title,
    color: Colors.textPrimary,
  },
  content: { padding: Spacing.md, gap: Spacing.md },
  card: {
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    gap: Spacing.md,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  cardCopy: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.alert,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  rowCopy: { flex: 1 },
  rowTitle: {
    fontFamily: fonts.medium,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  rowSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
});
