import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, CheckCircle, ChevronDown, Info } from 'lucide-react-native';
import { CardShell } from '@/components/cards/CardShell';
import { useAcknowledgeAlert } from '@/hooks/useAcknowledgeAlert';
import {
  formatAlertAge,
  severityBorderVariant,
  severityGlowColor,
} from '@/lib/alertsData';
import type { Alert, AlertSeverity } from '@/stores/alertStore';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  alert: Alert;
  siteName?: string;
};

const SEV_CONFIG: Record<
  AlertSeverity,
  {
    Icon: typeof AlertTriangle;
    iconColor: string;
    iconBg: string;
    badgeColor: string;
    badgeBg: string;
  }
> = {
  critical: {
    Icon: AlertTriangle,
    iconColor: Colors.alert,
    iconBg: Colors.alertMuted,
    badgeColor: Colors.alert,
    badgeBg: Colors.alertMuted,
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: Colors.gold,
    iconBg: Colors.goldWhisper,
    badgeColor: Colors.gold,
    badgeBg: Colors.goldWhisper,
  },
  info: {
    Icon: Info,
    iconColor: Colors.mint,
    iconBg: Colors.mintGlow,
    badgeColor: Colors.mint,
    badgeBg: Colors.mintGlow,
  },
};

export const PremiumAlertCard = memo(function PremiumAlertCard({ alert, siteName }: Props) {
  const [expanded, setExpanded] = useState(false);
  const dismissAlert = useAcknowledgeAlert();
  const expandAnim = useSharedValue(0);
  const scale = useSharedValue(1);

  const cfg = SEV_CONFIG[alert.severity];
  const IconComp = cfg.Icon;

  const toggle = () => {
    void Haptics.selectionAsync();
    const next = !expanded;
    setExpanded(next);
    expandAnim.value = withSpring(next ? 1 : 0, { damping: 18 });
  };

  const onAck = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await dismissAlert(alert.id);
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(expandAnim.value, [0, 1], [0, 180])}deg` }],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.985, { damping: 20 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 20 });
      }}
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={`${alert.severity} alert, ${alert.message}`}
    >
      <Animated.View style={scaleStyle}>
        <CardShell
          glowColor={severityGlowColor(alert.severity)}
          borderVariant={severityBorderVariant(alert.severity)}
          style={styles.shell}
        >
          <View style={styles.topRow}>
            <View style={[styles.iconBox, { backgroundColor: cfg.iconBg, borderColor: cfg.badgeColor }]}>
              <IconComp size={18} color={cfg.iconColor} strokeWidth={1.8} />
            </View>
            <View style={styles.badges}>
              <View style={[styles.severityBadge, { backgroundColor: cfg.badgeBg, borderColor: cfg.badgeColor }]}>
                <Text style={[styles.severityText, { color: cfg.badgeColor }]}>
                  {alert.severity.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {siteName ? <Text style={styles.siteLabel}>{siteName.toUpperCase()}</Text> : null}

          <Text style={styles.message}>{alert.message}</Text>
          <Text style={styles.meta}>{formatAlertAge(alert.timestamp)}</Text>

          {expanded ? (
            <Animated.View style={styles.detail}>
              {alert.detail ? <Text style={styles.detailText}>{alert.detail}</Text> : null}
              {!alert.acknowledged ? (
                <Pressable style={styles.ackBtn} onPress={() => void onAck()}>
                  <CheckCircle size={14} color={Colors.mint} strokeWidth={2} />
                  <Text style={styles.ackText}>Acknowledge</Text>
                </Pressable>
              ) : (
                <View style={styles.ackRow}>
                  <CheckCircle size={13} color={Colors.textMuted} strokeWidth={2} />
                  <Text style={styles.acknowledgedText}>Acknowledged</Text>
                </View>
              )}
            </Animated.View>
          ) : null}

          <View style={styles.footer}>
            <Animated.View style={chevronStyle}>
              <ChevronDown size={16} color={Colors.textMuted} strokeWidth={2} />
            </Animated.View>
            <Text style={styles.footerText}>{expanded ? 'Collapse' : 'View details'}</Text>
          </View>
        </CardShell>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  severityText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    letterSpacing: 1,
  },
  siteLabel: {
    marginBottom: Spacing.xs,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  message: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  meta: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  detail: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  detailText: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  ackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.mintBorder,
    backgroundColor: Colors.mintGlow,
  },
  ackText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.caption,
    color: Colors.mint,
    letterSpacing: 0.4,
  },
  ackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acknowledgedText: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
