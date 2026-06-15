import { memo, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ESO_PAY_BORDER,
  ESO_PAY_GOLD,
  ESO_PAY_GOLD_MUTED,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_SURFACE,
  PREMIUM_CARD_SHADOW,
} from '@/esopay/theme/brandColors';
import Animated, {
  Easing,
  FadeIn,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  BILL_CATEGORY_CARD_HEIGHT,
  BILL_CATEGORY_CARD_WIDTH,
  BILL_PAY_GRID_INNER_PADDING,
  HOME_BILL_CATEGORY_CARD_HEIGHT,
  HOME_BILL_GRID_INNER_PADDING,
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
  badgeText?: string;
  badgeBg?: string;
  badgeFg?: string;
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
  /** Home / billing hub cards — subtle container border. */
  hubCards?: boolean;
};

const HUB_CARD_STYLE = {
  borderWidth: 0,
  borderRadius: 24,
  ...PREMIUM_CARD_SHADOW,
} as const;

const PRESS_MS = 200;

export type BillPayCardItem = BillPayCardProps & { id: string };

export const BillPayCard = memo(function BillPayCard({
  title,
  subtitle,
  badgeText,
  icon,
  visual,
  width = BILL_CATEGORY_CARD_WIDTH,
  height = BILL_CATEGORY_CARD_HEIGHT,
  layout = 'grid',
  highlightBadge,
  index = 0,
  animateEntry = true,
  onPress,
  accessibilityLabel,
  hubCards = false,
}: BillPayCardProps) {
  const isGrid = layout === 'grid';
  const cardHeight = height ?? BILL_CATEGORY_CARD_HEIGHT;
  const isHomeDenseHub = hubCards && cardHeight <= HOME_BILL_CATEGORY_CARD_HEIGHT;

  const scale = useSharedValue(1);
  const cardAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const inner = (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: PRESS_MS, easing: Easing.out(Easing.ease) });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: PRESS_MS, easing: Easing.out(Easing.ease) });
      }}
      style={[
        styles.pressable,
        isGrid && styles.pressableGrid,
        isHomeDenseHub && styles.pressableHomeHub,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${title}, ${subtitle}`}
      accessibilityHint="Opens biller selection"
    >
      {highlightBadge ? (
        <View
          style={[
            styles.mostUsedBadge,
            highlightBadge === 'popular' && styles.popularBadge,
          ]}
        >
          <Text
            style={[
              styles.mostUsedText,
              highlightBadge === 'popular' && styles.popularBadgeText,
            ]}
          >
            {hubHighlightLabel(highlightBadge)}
          </Text>
        </View>
      ) : null}

      <View style={[styles.iconRow, highlightBadge && isGrid && styles.iconRowBelowBadge]}>
        {icon}
        {badgeText ? (
          <View style={styles.providerBadge}>
            <Text style={styles.providerBadgeText} numberOfLines={1}>
              {badgeText}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.copyBlock, isHomeDenseHub && styles.copyBlockHomeHub]}>
        <Text
          style={[
            styles.cardTitle,
            isGrid && styles.cardTitleGrid,
            isHomeDenseHub && styles.cardTitleHomeHub,
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <Text
          style={[
            styles.cardHint,
            isGrid && styles.cardHintGrid,
            isHomeDenseHub && styles.cardHintHomeHub,
          ]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>

      {hubCards ? null : <View style={styles.noise} pointerEvents="none" />}
    </Pressable>
  );

  const cardBody = (
    <View style={[styles.glass, isGrid && styles.glassGrid, { backgroundColor: HOME_CARD_SURFACE }]}>
      <View
        style={[styles.tintOverlay, { backgroundColor: visual.tint }]}
        pointerEvents="none"
      />
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
        isGrid ? styles.cardOuterGrid : styles.cardOuterCarousel,
        isGrid
          ? {
              height: cardHeight,
              ...(hubCards ? HUB_CARD_STYLE : { borderColor: visual.borderGlow }),
            }
          : {
              width,
              height: cardHeight,
              ...(hubCards ? HUB_CARD_STYLE : { borderColor: visual.borderGlow }),
            },
        cardAnim,
      ]}
    >
      {cardBody}
    </Animated.View>
  );
});

/** Alias — canonical bill category card (Home, Bills hub, See all). */
export { BillPayCard as BillCategoryCard };

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.32,
        shadowRadius: 14,
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  cardOuterGrid: {
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 100,
  },
  cardOuterCarousel: {},
  glass: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  glassGrid: {
    height: '100%',
  },
  tintOverlay: {
    ...StyleSheet.absoluteFill,
  },
  pressable: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  pressableGrid: {
    flexDirection: 'column',
    padding: BILL_PAY_GRID_INNER_PADDING,
    overflow: 'hidden',
  },
  pressableHomeHub: {
    padding: HOME_BILL_GRID_INNER_PADDING,
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
    color: luxury.warmWhite,
  },
  popularBadge: {
    backgroundColor: ESO_PAY_GOLD_MUTED,
    borderColor: 'rgba(232, 160, 32, 0.20)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: ESO_PAY_GOLD,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  iconRowBelowBadge: {
    marginTop: 22,
  },
  providerBadge: {
    backgroundColor: ESO_PAY_BORDER,
    borderColor: 'transparent',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: ESO_PAY_TEXT_PRIMARY,
  },
  copyBlock: {
    gap: 4,
    flexShrink: 1,
    minHeight: 0,
  },
  copyBlockHomeHub: {
    gap: 2,
  },
  cardTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    fontWeight: '600',
    color: ESO_PAY_TEXT_PRIMARY,
  },
  cardTitleGrid: {
    fontSize: 14,
    lineHeight: 18,
    maxHeight: 36,
    letterSpacing: 0.1,
  },
  cardTitleHomeHub: {
    fontFamily: fonts.display,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  cardHint: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  cardHintGrid: {
    fontSize: 12,
    lineHeight: 16,
    maxHeight: 16,
    color: 'rgba(245, 240, 232, 0.55)',
  },
  cardHintHomeHub: {
    fontSize: 11,
    lineHeight: 14,
    maxHeight: 14,
    color: 'rgba(245, 240, 232, 0.48)',
  },
  noise: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
