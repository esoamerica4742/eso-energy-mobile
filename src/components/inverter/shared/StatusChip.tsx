import { View, Text, StyleSheet } from 'react-native';
import { FaultPulseShell } from '@/components/monitoring/WaitingStateMotion';
import { Colors, FontSize, Radius } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { MetricStatus } from '@/types/inverter';

type Props = {
  status: MetricStatus;
  label: string;
  muted?: boolean;
};

const statusConfig = {
  normal: {
    bg: Colors.mintGlow,
    border: Colors.mintBorder,
    textColor: Colors.mint,
  },
  low: {
    bg: Colors.alertMuted,
    border: Colors.alertBorder,
    textColor: Colors.alert,
  },
  critical: {
    bg: Colors.alertMuted,
    border: Colors.alertBorder,
    textColor: Colors.alert,
  },
  high: {
    bg: Colors.warningWhisper,
    border: Colors.warningBorder,
    textColor: Colors.warning,
  },
  warning: {
    bg: Colors.warningWhisper,
    border: Colors.warningBorder,
    textColor: Colors.warning,
  },
  live: {
    bg: Colors.mintGlow,
    border: Colors.mintBorder,
    textColor: Colors.mint,
  },
} as const;

export function StatusChip({ status, label, muted = false }: Props) {
  const config = statusConfig[status] ?? statusConfig.normal;
  const textColor = muted ? Colors.textMuted : config.textColor;
  const bg = muted ? Colors.surfaceRaised : config.bg;
  const border = muted ? Colors.borderSubtle : config.border;

  const chip = (
    <View style={[styles.chip, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.label, { color: textColor }]}>{label.toUpperCase()}</Text>
    </View>
  );

  if (!muted && status === 'critical') {
    return <FaultPulseShell active style={styles.pulseWrap}>{chip}</FaultPulseShell>;
  }

  return chip;
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: FontSize.micro,
    letterSpacing: 0.8,
  },
  pulseWrap: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 0,
  },
});
