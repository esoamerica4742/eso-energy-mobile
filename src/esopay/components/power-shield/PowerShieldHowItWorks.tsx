import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bell, Lightning, TrendUp } from 'phosphor-react-native';
import { GOLD } from '@/theme/colors';
import Animated, { Easing, FadeInUp } from 'react-native-reanimated';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import { PS, psFont } from '@/esopay/components/power-shield/powerShieldTheme';
import { ds } from '@/esopay/theme/designSystem';

const ROWS = [
  {
    Icon: Lightning,
    iconColor: GOLD,
    step: '1',
    title: 'Pay electricity through Eso Pay',
    detail: 'We detect your meter and last token purchase automatically.',
  },
  {
    Icon: TrendUp,
    iconColor: PS.gold,
    step: '2',
    title: 'We learn your daily burn rate',
    detail: 'Spend is estimated from your top-up history — refine it anytime.',
  },
  {
    Icon: Bell,
    iconColor: GOLD,
    step: '3',
    title: 'Intelligent Threshold Safeguard',
    detail:
      'At 10% capacity, Auto-Top Up can reload within 5 minutes. At 5% critical, push + SMS alert you to transfer immediately.',
  },
] as const;

export const PowerShieldHowItWorksSection = memo(function PowerShieldHowItWorksSection() {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).easing(Easing.out(Easing.cubic))}
      style={styles.section}
    >
      <EsoPaySectionLabel>How it works</EsoPaySectionLabel>
      <View style={styles.list}>
        {ROWS.map(({ Icon, iconColor, step, title, detail }, index) => (
          <Animated.View
            key={title}
            entering={FadeInUp.delay(80 + index * 60)
              .duration(400)
              .easing(Easing.out(Easing.cubic))}
            style={styles.stepCard}
          >
            <View style={styles.stepBadge}>
              <Text style={styles.stepNum}>{step}</Text>
            </View>
            <View style={styles.copy}>
              <View style={styles.titleRow}>
                <Icon
                  size={20}
                  color={iconColor}
                  weight="duotone"
                  duotoneColor={iconColor}
                />
                <Text style={styles.title}>{title}</Text>
              </View>
              <Text style={styles.detail}>{detail}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  section: {
    gap: ds.space.component,
    paddingTop: ds.space.inline,
  },
  list: {
    gap: ds.space.component,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ds.space.component,
    backgroundColor: PS.surface,
    borderWidth: 1,
    borderColor: PS.border,
    borderRadius: ds.radius.otp,
    padding: 14,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PS.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontFamily: psFont.bold,
    fontSize: 12,
    color: PS.gold,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: psFont.bodyMedium,
    fontSize: ds.type.label.fontSize,
    color: PS.text,
    flex: 1,
  },
  detail: {
    fontFamily: psFont.body,
    fontSize: ds.type.label.fontSize,
    lineHeight: ds.type.label.lineHeight,
    color: PS.textSecondary,
  },
});
