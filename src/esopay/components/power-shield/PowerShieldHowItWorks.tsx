import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bell, LineChart, Zap } from 'lucide-react-native';
import Animated, { Easing, FadeInUp } from 'react-native-reanimated';
import { PS, psFont } from '@/esopay/components/power-shield/powerShieldTheme';

const ROWS = [
  {
    Icon: Zap,
    title: 'Pay electricity through Eso Pay',
    detail: 'We detect your meter and last token purchase automatically.',
  },
  {
    Icon: LineChart,
    title: 'We learn your daily burn rate',
    detail: 'Spend is estimated from your top-up history — refine it anytime.',
  },
  {
    Icon: Bell,
    title: 'Intelligent Threshold Safeguard',
    detail:
      'At 10% prepaid capacity, Auto-Top Up can reload within 5 minutes (Monnify wallet). At 5% critical panic, push + SMS demand immediate manual bank transfer if auto top-up is off or fails.',
  },
] as const;

export const PowerShieldHowItWorksSection = memo(function PowerShieldHowItWorksSection() {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).easing(Easing.out(Easing.cubic))}
      style={styles.section}
    >
      <Text style={styles.eyebrow}>How it works</Text>
      <View style={styles.list}>
        {ROWS.map(({ Icon, title, detail }, index) => (
          <Animated.View
            key={title}
            entering={FadeInUp.delay(80 + index * 60)
              .duration(400)
              .easing(Easing.out(Easing.cubic))}
            style={styles.row}
          >
            <View style={styles.iconWrap}>
              <Icon size={20} color={PS.amber} strokeWidth={2.2} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{title}</Text>
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
    gap: 16,
    paddingTop: 8,
  },
  eyebrow: {
    fontFamily: psFont.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: PS.amber,
  },
  list: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.15)',
  },
  copy: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  title: {
    fontFamily: psFont.bodyMedium,
    fontSize: 15,
    color: PS.text,
    lineHeight: 20,
  },
  detail: {
    fontFamily: psFont.body,
    fontSize: 13,
    lineHeight: 19,
    color: PS.textMuted,
  },
});
