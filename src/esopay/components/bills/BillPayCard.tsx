import { memo, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  BILL_PAY_CARD_HEIGHT,
  BILL_PAY_CARD_WIDTH,
  BILL_PAY_GRID_INNER_PADDING,
  BILL_PAY_GRID_MIN_HEIGHT,
} from '@/esopay/components/bills/billPayCardTheme';
import type { HubHighlightKind } from '@/esopay/lib/billHubHighlights';
import { hubHighlightLabel } from '@/esopay/lib/billHubHighlights';
import { luxury } from '@/esopay/theme/luxury';
import { fonts } from '@/esopay/theme/typography';

export type BillPayCardVisual = {
  tint: string;
  borderGlow: string;
  iconColor: string;
};

export type BillPayCardLayout = 'carousel' | 'grid';

export type BillPayCardProps = {
  title: string;
  subtitle: string;
  badgeText: string;
  badgeBg: string;
  badgeFg: string;
  icon: ReactNode;
  visual: BillPayCardVisual;
  width?: number;
  height?: number;
  layout?: BillPayCardLayout;
  /** Corner badge when this category is popular or recently paid. */
  highlightBadge?: HubHighlightKind | null;
  index?: number;
  animateEntry?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

export type BillPayCardItem = BillPayCardProps & { id: string };

export const BillPayCard = memo(function BillPayCard({
  title,
  subtitle,
  badgeText,
  badgeBg,
  badgeFg,
  icon,
  visual,
  width = BILL_PAY_CARD_WIDTH,
  height,
  layout = 'carousel',
  highlightBadge,
  index = 0,
  animateEntry = true,
  onPress,
  accessibilityLabel,
}: BillPayCardProps) {
  const isGrid = layout === 'grid';
  const cardHeight = height ?? (isGrid ? undefined : BILL_PAY_CARD_HEIGHT);
  const scale = useSharedValue(1);
  const cardAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const inner = (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 14, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 280 });
      }}
      style={[styles.pressable, isGrid && styles.pressableGrid]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${title}, ${subtitle}`}
      accessibilityHint="Opens biller selection"
    >
      {highlightBadge ? (
        <View style={styles.mostUsedBadge}>
          <Text style={styles.mostUsedText}>{hubHighlightLabel(highlightBadge)}</Text>
        </View>
      ) : null}

      <View style={styles.iconRow}>
        {icon}
        <View style={[styles.providerBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.providerBadgeText, { color: badgeFg }]} numberOfLines={1}>
            {badgeText}
          </Text>
        </View>
      </View>

      <View style={styles.copyBlock}>
        <Text style={[styles.cardTitle, isGrid && styles.cardTitleGrid]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.cardHint, isGrid && styles.cardHintGrid]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.noise} pointerEvents="none" />
    </Pressable>
  );

  const glass =
    Platform.OS === 'ios' ? (
      <BlurView
        intensity={28}
        tint="dark"
        style={[styles.glass, isGrid && styles.glassGrid, { backgroundColor: visual.tint }]}
      >
        {inner}
      </BlurView>
    ) : (
      <View
        style={[
          styles.glass,
          styles.glassAndroid,
          isGrid && styles.glassGrid,
          { backgroundColor: visual.tint },
        ]}
      >
        {inner}
      </View>
    );

  const entering = animateEntry
    ? isGrid
      ? FadeIn.delay(index * 35).duration(320)
      : FadeInRight.delay(index * 70).duration(480).springify().damping(16)
    : undefined;

  return (
    <Animated.View
      entering={entering}
      style={[
        styles.cardOuter,
        isGrid && styles.cardOuterGrid,
        !isGrid && { width, height: cardHeight },
        { borderColor: visual.borderGlow },
        cardAnim,
      ]}
    >
      {glass}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  cardOuterGrid: {
    flex: 1,
    alignSelf: 'stretch',
    minHeight: BILL_PAY_GRID_MIN_HEIGHT,
  },
  glass: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  glassGrid: {
    minHeight: BILL_PAY_GRID_MIN_HEIGHT,
  },
  glassAndroid: {
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
  },
  pressable: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  pressableGrid: {
    flexDirection: 'column',
    minHeight: BILL_PAY_GRID_MIN_HEIGHT,
    padding: BILL_PAY_GRID_INNER_PADDING,
  },
  mostUsedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(212, 160, 23, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  mostUsedText: {
    fontFamily: fonts.uiMedium,
    fontSize: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: luxury.gold,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerBadge: {
    minWidth: 40,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerBadgeText: {
    fontFamily: fonts.uiBold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  copyBlock: {
    gap: 4,
  },
  cardTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: luxury.textPrimary,
  },
  cardTitleGrid: {
    fontSize: 13,
    lineHeight: 17,
  },
  cardHint: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: '#E2E8F0',
  },
  cardHintGrid: {
    fontSize: 11,
    lineHeight: 15,
    color: luxury.textMuted,
  },
  noise: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
