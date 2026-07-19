import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ESO_PAY_TEXT_PRIMARY } from '@/esopay/theme/brandColors';
import { grid } from '@/esopay/theme/homeGrid';
import { inter } from '@/theme/fonts';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  accessibilityLabel?: string;
};

/** Home section title + quiet action link. */
export const HomeSectionHeader = memo(function HomeSectionHeader({
  title,
  actionLabel,
  onAction,
  accessibilityLabel,
}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            onAction();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? actionLabel}
        >
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: grid.md,
  },
  title: {
    fontFamily: inter.bold,
    fontSize: 28,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: ESO_PAY_TEXT_PRIMARY,
    flexShrink: 1,
  },
  action: {
    fontFamily: inter.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
  },
});
