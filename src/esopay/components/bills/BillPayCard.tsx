import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BILL_CARD_BORDER,
  ESO_PAY_SURFACE_ELEVATED,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
} from '@/esopay/theme/brandColors';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import {
  BILL_CATEGORY_CARD_HEIGHT,
  BILL_CATEGORY_CARD_WIDTH,
  BILL_PAY_GRID_INNER_PADDING,
  HOME_BILL_CATEGORY_CARD_HEIGHT,
  HOME_BILL_GRID_INNER_PADDING,
} from '@/esopay/components/bills/billPayCardTheme';
import type { HubHighlightKind } from '@/esopay/lib/billHubHighlights';
import { hubHighlightLabel } from '@/esopay/lib/billHubHighlights';
import { fonts } from '@/esopay/theme/typography';
import { useCardPressAnimation } from '@/lib/motion/springMotion';

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
  const isProviderHub = hubCards && !isHomeDenseHub;
  const showProviderBadge = Boolean(badgeText);

  const { style: cardAnim, onPressIn, onPressOut } = useCardPressAnimation();

  const borderColor = BILL_CARD_BORDER;

  const inner = (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.pressable,
        isGrid && styles.pressableGrid,
        isHomeDenseHub && styles.pressableHomeHub,
        isProviderHub && styles.pressableProviderHub,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${title}, ${subtitle}`}
      accessibilityHint="Opens biller selection"
    >
      {highlightBadge === 'recent' ? (
        <View style={styles.mostUsedBadge}>
          <Text style={styles.mostUsedText}>{hubHighlightLabel(highlightBadge)}</Text>
        </View>
      ) : null}

      <View style={[styles.iconRow, highlightBadge === 'recent' && isGrid && styles.iconRowBelowBadge]}>
        {icon}
        {showProviderBadge ? (
          <View style={styles.providerBadge}>
            <Text style={styles.providerBadgeText} numberOfLines={1}>
              {badgeText}
            </Text>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.copyBlock,
          hubCards && styles.copyBlockHub,
          isHomeDenseHub && styles.copyBlockHomeHub,
          isProviderHub && styles.copyBlockProviderHub,
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            isGrid && styles.cardTitleGrid,
            isHomeDenseHub && styles.cardTitleHomeHub,
            isProviderHub && styles.cardTitleProviderHub,
          ]}
          numberOfLines={isProviderHub ? 2 : isHomeDenseHub ? 2 : 3}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <Text
          style={[
            styles.cardHint,
            isGrid && styles.cardHintGrid,
            isHomeDenseHub && styles.cardHintHomeHub,
            isProviderHub && styles.cardHintProviderHub,
          ]}
          numberOfLines={isProviderHub ? 3 : isHomeDenseHub ? 1 : 2}
          ellipsizeMode="tail"
        >
          {subtitle}
        </Text>
      </View>

    </Pressable>
  );

  const cardBody = (
    <View style={[hubCards ? styles.hubFill : styles.glass, isGrid && styles.glassGrid]}>
      {hubCards ? null : (
        <View
          style={[styles.tintOverlay, { backgroundColor: visual.tint }]}
          pointerEvents="none"
        />
      )}
      {inner}
    </View>
  );

  const entering = animateEntry
    ? isGrid
      ? FadeIn.delay(index * 35).duration(220)
      : FadeInRight.delay(index * 40).duration(280)
    : undefined;

  const sizeStyle = isGrid
    ? { height: cardHeight }
    : { width, height: cardHeight };

  return (
    <Animated.View
      entering={entering}
      style={[
        hubCards ? styles.hubAmbient : styles.cardAmbient,
        isGrid ? styles.cardOuterGrid : styles.cardOuterCarousel,
        sizeStyle,
        cardAnim,
      ]}
    >
      <View style={[hubCards ? styles.hubLift : styles.cardLift, { borderColor }]}>
        {hubCards ? cardBody : cardBody}
      </View>
    </Animated.View>
  );
});

/** Alias — canonical bill category card (Home, Bills hub, See all). */
export { BillPayCard as BillCategoryCard };

const styles = StyleSheet.create({
  /** Far ambient float — outer wrapper only. */
  cardAmbient: {
    borderRadius: 24,
  },
  hubAmbient: {
    borderRadius: 18,
  },
  /** Near crisp contact shadow + border. */
  cardLift: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: ESO_PAY_SURFACE_ELEVATED,
  },
  hubLift: {
    flex: 1,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  hubFill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  cardOuterGrid: {
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 100,
  },
  cardOuterCarousel: {},
  glass: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: ESO_PAY_SURFACE_ELEVATED,
  },
  glassGrid: {
    height: '100%',
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  pressable: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    zIndex: 3,
  },
  pressableGrid: {
    flexDirection: 'column',
    padding: BILL_PAY_GRID_INNER_PADDING,
  },
  pressableHomeHub: {
    padding: HOME_BILL_GRID_INNER_PADDING,
  },
  pressableProviderHub: {
    padding: 14,
    justifyContent: 'flex-start',
    gap: 8,
  },
  mostUsedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mostUsedText: {
    fontFamily: fonts.uiMedium,
    fontSize: 8,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
    includeFontPadding: false,
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerBadgeText: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: 'rgba(255,255,255,0.7)',
    includeFontPadding: false,
  },
  copyBlock: {
    gap: 4,
    flexShrink: 1,
    minHeight: 0,
  },
  copyBlockHub: {
    flexShrink: 0,
    width: '100%',
  },
  copyBlockHomeHub: {
    gap: 3,
  },
  copyBlockProviderHub: {
    flex: 1,
    flexShrink: 1,
    minHeight: 0,
    width: '100%',
    gap: 4,
  },
  cardTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    fontWeight: '600',
    color: ESO_PAY_TEXT_PRIMARY,
    includeFontPadding: false,
  },
  cardTitleGrid: {
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0.14,
  },
  cardTitleHomeHub: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    letterSpacing: 0.18,
  },
  cardTitleProviderHub: {
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0.1,
    width: '100%',
  },
  cardHint: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
    includeFontPadding: false,
  },
  cardHintGrid: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.08,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  cardHintHomeHub: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.06,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  cardHintProviderHub: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.06,
    color: 'rgba(255, 255, 255, 0.55)',
    width: '100%',
  },
});
