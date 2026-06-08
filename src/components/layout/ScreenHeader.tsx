import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Bell } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Swipeable } from 'react-native-gesture-handler';
import { useAlertStore, sortAlerts } from '@/stores/alertStore';
import { useAcknowledgeAlert } from '@/hooks/useAcknowledgeAlert';
import { BottomSheetDialog } from '@/components/primitives/Sheet';
import { MotionPressable } from '@/lib/motion';
import { useSiteStore } from '@/stores/siteStore';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type Props = {
  greeting?: string;
  badgeCount?: number;
};

export function ScreenHeader({ greeting = 'Good morning, Operator', badgeCount = 0 }: Props) {
  const status = useConnectionStatus();
  const rawAlerts = useAlertStore((s) => s.alerts);
  const dismissAlert = useAcknowledgeAlert();
  const sites = useSiteStore((s) => s.sites);
  const alerts = useMemo(() => sortAlerts(rawAlerts), [rawAlerts]);
  const [secondsSinceSync, setSecondsSinceSync] = useState(12);
  const [sheetOpen, setSheetOpen] = useState(false);
  const livePulse = useSharedValue(1);
  const badgePulse = useSharedValue(1);

  useEffect(() => {
    if (status === 'live') {
      livePulse.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1200 }),
          withTiming(1, { duration: 1200 }),
        ),
        -1,
        true,
      );
    } else {
      livePulse.value = 1;
    }
  }, [status, livePulse]);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsSinceSync((s) => (s >= 59 ? 0 : s + 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (badgeCount <= 0) return;
    badgePulse.value = withSequence(
      withSpring(1.15, { damping: 10, stiffness: 240 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
  }, [badgeCount, badgePulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: livePulse.value }));
  const badgeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgePulse.value }],
  }));

  const statusColor =
    status === 'live'
      ? colors.solarDot
      : status === 'reconnecting'
        ? colors.warningDot
        : colors.offlineDot;

  const visibleAlerts = alerts.filter((alert) => !alert.acknowledged);

  return (
    <BlurView intensity={24} tint="dark" style={styles.wrap}>
      {/* Left — wordmark + context */}
      <View style={styles.left}>
        <View style={styles.brand}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>E</Text>
          </View>
          <View>
            <Text style={styles.wordmark}>ESO ENERGY</Text>
            <Text style={styles.wordmarkSub}>Grid Intelligence</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.livePill}>
            <Animated.View style={[styles.liveDot, { backgroundColor: statusColor }, dotStyle]} />
            <Text style={styles.statusLabel}>
            {status === 'live' ? 'Live · West Africa' : status === 'reconnecting' ? 'Reconnecting…' : 'Offline'}
            </Text>
          </View>
        </View>

        {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
        <Text style={styles.synced}>{`Last synced ${secondsSinceSync}s ago`}</Text>
      </View>

      {/* Right — actions */}
      <View style={styles.actions}>
        <MotionPressable
          style={styles.iconBtn}
          hitSlop={12}
          haptic="light"
          onPress={() => setSheetOpen(true)}
        >
          <Bell size={20} color={badgeCount > 0 ? colors.gold : colors.textSecondary} strokeWidth={1.8} />
          {badgeCount > 0 ? (
            <Animated.View style={[styles.badge, badgeAnimStyle]}>
              <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
            </Animated.View>
          ) : null}
        </MotionPressable>
      </View>
      <BottomSheetDialog open={sheetOpen} onOpenChange={setSheetOpen} title="Alerts">
        {visibleAlerts.length === 0 ? (
          <Text style={styles.drawerEmpty}>No active alerts</Text>
        ) : (
          visibleAlerts.slice(0, 8).map((alert) => (
            <Swipeable
              key={alert.id}
              renderRightActions={() => (
                <Pressable
                  style={styles.dismissAction}
                  onPress={() => {
                    void dismissAlert(alert.id);
                  }}
                >
                  <Text style={styles.dismissText}>Dismiss</Text>
                </Pressable>
              )}
            >
              <View style={[styles.alertRow, severityLeft(alert.severity)]}>
                <Text style={styles.alertSite}>
                  {sites.find((site) => site.id === alert.site_id)?.name ?? 'Fleet alert'}
                </Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertMeta}>{timeAgo(alert.timestamp)}</Text>
              </View>
            </Swipeable>
          ))
        )}
      </BottomSheetDialog>
    </BlurView>
  );
}

function severityLeft(severity: 'critical' | 'warning' | 'info') {
  if (severity === 'critical') return { borderLeftColor: colors.offlineDot };
  if (severity === 'warning') return { borderLeftColor: colors.warningDot };
  return { borderLeftColor: colors.gridDot };
}

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(15,17,23,0.82)',
    zIndex: 20,
  },
  left: { flex: 1 },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.goldBg,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.gold,
    letterSpacing: -0.5,
  },
  wordmark: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: 1.2,
  },
  wordmarkSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    letterSpacing: 0.4,
    marginTop: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.solarBorder,
    backgroundColor: 'rgba(0,229,160,0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.badge,
    color: colors.solarText,
    letterSpacing: 0.3,
  },
  greeting: {
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textSecondary,
    marginTop: 1,
  },
  synced: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
  },
  iconBtnPressed: {
    backgroundColor: colors.bgElevated,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.offlineDot,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.bgBase,
    shadowColor: colors.offlineDot,
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    color: '#FFFFFF',
    letterSpacing: 0,
  },
  drawer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  drawerTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  drawerEmpty: {
    fontFamily: fonts.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  alertRow: {
    borderLeftWidth: 3,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  alertSite: {
    fontFamily: fonts.medium,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  alertMessage: {
    marginTop: 4,
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  alertMeta: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textSecondary,
  },
  dismissAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    marginBottom: spacing.sm,
    borderRadius: radius.card,
    backgroundColor: colors.offlineBg,
    borderWidth: 1,
    borderColor: colors.offlineBorder,
  },
  dismissText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.badge,
    color: colors.offlineText,
  },
});
