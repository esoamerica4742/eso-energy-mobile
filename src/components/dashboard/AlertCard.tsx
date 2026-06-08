/**
 * Expandable alert card with severity colours and acknowledge action.
 */
import { memo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, Info, CheckCircle, ChevronDown, type LucideIcon } from 'lucide-react-native';
import type { Alert, AlertSeverity } from '@/stores/alertStore';
import { useAcknowledgeAlert } from '@/hooks/useAcknowledgeAlert';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

const SEV: Record<AlertSeverity, { border: string; iconBg: string; icon: string; Icon: LucideIcon }> = {
  critical: { border: colors.offlineDot, iconBg: colors.offlineBg,  icon: colors.offlineText,  Icon: AlertTriangle },
  warning:  { border: colors.warningDot, iconBg: colors.warningBg,  icon: colors.warningText,  Icon: AlertTriangle },
  info:     { border: colors.gridDot,    iconBg: colors.gridBg,     icon: colors.gridText,     Icon: Info          },
};

type Props = { alert: Alert };

export const AlertCard = memo(function AlertCard({ alert }: Props) {
  const [expanded, setExpanded] = useState(false);
  const dismissAlert = useAcknowledgeAlert();
  const expandAnim = useSharedValue(0);
  const scale = useSharedValue(1);

  const cfg = SEV[alert.severity];
  const IconComp = cfg.Icon;

  const toggle = () => {
    void Haptics.selectionAsync();
    setExpanded((v) => !v);
    expandAnim.value = withSpring(expanded ? 0 : 1, { damping: 18 });
  };

  const onAck = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await dismissAlert(alert.id);
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(expandAnim.value, [0, 1], [0, 180])}deg` }],
  }));

  const detailStyle = useAnimatedStyle(() => ({
    opacity: withTiming(expanded ? 1 : 0, { duration: 220 }),
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.975, { damping: 20 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
      onPress={toggle}
    >
      <Animated.View
        style={[
          styles.card,
          scaleStyle,
          { borderLeftColor: cfg.border },
          alert.acknowledged && styles.dimmed,
        ]}
      >
        {/* Row */}
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: cfg.iconBg }]}>
            <IconComp size={16} color={cfg.icon} strokeWidth={2} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.message}>{alert.message}</Text>
            <Text style={styles.meta}>{formatAgo(alert.timestamp)}</Text>
          </View>
          <Animated.View style={chevronStyle}>
            <ChevronDown size={16} color={colors.textTertiary} strokeWidth={2} />
          </Animated.View>
        </View>

        {/* Expandable detail */}
        {expanded ? (
          <Animated.View style={[styles.detail as object, detailStyle]}>
            {alert.detail ? (
              <Text style={styles.detailText}>{alert.detail}</Text>
            ) : null}
            {!alert.acknowledged ? (
              <Pressable style={styles.ackBtn} onPress={onAck}>
                <CheckCircle size={14} color={colors.solarDot} strokeWidth={2} />
                <Text style={styles.ackText}>Acknowledge</Text>
              </Pressable>
            ) : (
              <View style={styles.ackRow}>
                <CheckCircle size={13} color={colors.textTertiary} strokeWidth={2} />
                <Text style={styles.acknowledgedText}>Acknowledged</Text>
              </View>
            )}
          </Animated.View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
});

function formatAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderLeftWidth: 3,
    overflow: 'hidden',
  },
  dimmed: { opacity: 0.55 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  iconWrap: {
    width: 36, height: 36,
    borderRadius: radius.button,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: { flex: 1 },
  message: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: fontSize.micro,
    color: colors.textTertiary,
    marginTop: 3,
  },
  detail: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.md,
  },
  detailText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  ackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.solarBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 100,
  },
  ackText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.badge,
    color: colors.solarText,
  },
  ackRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  acknowledgedText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textTertiary,
  },
});
