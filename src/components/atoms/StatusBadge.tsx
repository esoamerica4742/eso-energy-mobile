import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

export type StatusType = 'solar' | 'grid' | 'diesel' | 'offline' | 'warning';

const statusConfig = {
  solar:   { label: 'Solar',   bg: colors.solarBg,   text: colors.solarText,   dot: colors.solarDot   },
  grid:    { label: 'Grid',    bg: colors.gridBg,    text: colors.gridText,    dot: colors.gridDot    },
  diesel:  { label: 'Diesel',  bg: colors.dieselBg,  text: colors.dieselText,  dot: colors.dieselDot  },
  offline: { label: 'Offline', bg: colors.offlineBg, text: colors.offlineText, dot: colors.offlineDot },
  warning: { label: 'Warning', bg: colors.warningBg, text: colors.warningText, dot: colors.warningDot },
} as const;

export function StatusBadge({ status }: { status: StatusType }) {
  const cfg = statusConfig[status] ?? statusConfig.offline;
  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg, borderColor: cfg.dot }]}>
      <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: fontSize.micro,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
