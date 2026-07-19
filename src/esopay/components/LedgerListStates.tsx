import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Receipt } from 'phosphor-react-native';
import { Skeleton } from '@/esopay/components/Skeleton';
import {
  ESO_PAY_CARD_HINT,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
} from '@/esopay/theme/brandColors';
import { grid } from '@/esopay/theme/homeGrid';
import { inter } from '@/theme/fonts';

export function LedgerSkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={styles.skeletonRow}>
          <Skeleton height={40} width={40} borderRadius={20} />
          <View style={styles.skeletonCopy}>
            <Skeleton height={14} width="68%" borderRadius={6} />
            <Skeleton height={11} width="42%" borderRadius={6} style={{ marginTop: 8 }} />
          </View>
          <Skeleton height={16} width={72} borderRadius={6} />
        </View>
      ))}
    </View>
  );
}

export function LedgerEmptyState({
  title = 'No transactions yet',
  body = 'Your activity will show up here.',
  actionLabel,
  onAction,
}: {
  title?: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.iconWell}>
        <Receipt size={28} color={ESO_PAY_TEXT_SECONDARY} weight="regular" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.ctaText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: grid.sm,
    paddingVertical: 14,
  },
  skeletonCopy: {
    flex: 1,
    minWidth: 0,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: grid.xl + 8,
    paddingHorizontal: grid.md,
    gap: 8,
  },
  iconWell: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: inter.semibold,
    fontSize: 16,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  emptyBody: {
    fontFamily: inter.regular,
    fontSize: 14,
    lineHeight: 20,
    color: ESO_PAY_CARD_HINT,
    textAlign: 'center',
    maxWidth: 280,
  },
  cta: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  ctaPressed: {
    opacity: 0.88,
  },
  ctaText: {
    fontFamily: inter.semibold,
    fontSize: 14,
    color: '#000000',
  },
});
