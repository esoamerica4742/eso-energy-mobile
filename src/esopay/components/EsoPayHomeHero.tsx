import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { luxury } from '@/esopay/theme/luxury';
import { spacing } from '@/esopay/theme/spacing';
import { typography } from '@/esopay/theme/typography';

type Props = {
  greeting: string;
  dateLabel: string;
};

/** Compact home header — greeting + date only. */
export const EsoPayHomeHero = memo(function EsoPayHomeHero({ greeting, dateLabel }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.greeting} accessibilityRole="header">
        {greeting}
      </Text>
      <Text style={styles.date}>{dateLabel}</Text>
      <View style={styles.divider} accessibilityElementsHidden />
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    gap: 2,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    zIndex: 2,
  },
  greeting: {
    ...typography.greetingHome,
    fontSize: 28,
    lineHeight: 32,
    color: luxury.textPrimary,
  },
  date: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'capitalize',
    color: luxury.warmWhite,
    opacity: 0.88,
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(212, 160, 23, 0.22)',
    marginTop: spacing.sm,
  },
});
