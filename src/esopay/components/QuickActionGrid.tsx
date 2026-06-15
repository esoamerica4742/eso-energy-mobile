import React, { memo, useEffect } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { IconProps } from 'phosphor-react-native';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import { ESO_PAY_GOLD, ESO_PAY_GOLD_MUTED } from '@/esopay/theme/brandColors';
import { fonts } from '@/esopay/theme/typography';

const BRAND = '#00C48C';
const GRID_GAP = 8;
const ASPECT = 1.15;

export type PhosphorIcon = React.ComponentType<IconProps>;

export type QuickActionItem = {
  key: string;
  label: string;
  Icon: PhosphorIcon;
  color: string;
  hint: string;
  showDot?: boolean;
  onPress?: () => void;
};

type Props = {
  items: QuickActionItem[];
};

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function NotificationDot({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.notifyDot, { backgroundColor: color, shadowColor: color }, style]}
    />
  );
}

function IconGlowPulse({ children, glowColor }: { children: React.ReactNode; glowColor: string }) {
  const glow = useSharedValue(0.5);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [glow]);

  const haloStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value * 0.5,
  }));

  return (
    <Animated.View
      style={[
        styles.iconHalo,
        { shadowColor: glowColor },
        haloStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
}

function QuickActionCard({
  item,
  index,
  width,
  height,
}: {
  item: QuickActionItem;
  index: number;
  width: number;
  height: number;
}) {
  const { label, Icon, color, hint, showDot, onPress } = item;
  const scale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.94, { damping: 8, stiffness: 40 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 8, stiffness: 40 });
  };

  const inner = (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {showDot ? (
        <View style={styles.dotAnchor}>
          <NotificationDot color={color} />
        </View>
      ) : null}

      <IconGlowPulse glowColor={color}>
        <View style={[styles.iconCircle, { backgroundColor: hexToRgba(color, 0.15) }]}>
          <Icon size={26} color="#FFFFFF" duotoneColor={color} weight="duotone" />
        </View>
      </IconGlowPulse>

      <Text style={styles.cardLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.hintText}>{hint}</Text>

      <View style={styles.noiseOverlay} pointerEvents="none" />
    </Pressable>
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70)
        .duration(420)
        .springify()
        .damping(14)}
      style={[{ width, height }, cardStyle]}
    >
      {Platform.OS === 'web' ? (
        <View style={styles.glassFallback}>{inner}</View>
      ) : (
        <BlurView intensity={20} tint="dark" style={styles.blurCard}>
          {inner}
        </BlurView>
      )}
    </Animated.View>
  );
}

export const QuickActionGrid = memo(function QuickActionGrid({ items }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const innerWidth = screenWidth - 32;
  const cardWidth = (innerWidth - GRID_GAP * 3) / 4;
  const cardHeight = cardWidth * ASPECT;

  return (
    <View style={styles.section}>
      <EsoPaySectionLabel style={styles.sectionLabelTracking}>Pay a Bill</EsoPaySectionLabel>
      <View style={styles.grid}>
        {items.map((item, index) => (
          <QuickActionCard
            key={item.key}
            item={item}
            index={index}
            width={cardWidth}
            height={cardHeight}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: BRAND,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: GRID_GAP,
    rowGap: GRID_GAP,
  },
  blurCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  glassFallback: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
  },
  dotAnchor: {
    position: 'absolute',
    top: -3,
    right: -3,
    zIndex: 3,
  },
  notifyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.85,
    elevation: 4,
  },
  iconHalo: {
    marginBottom: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: '100%',
  },
  hintText: {
    marginTop: 4,
    fontFamily: fonts.ui,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    textAlign: 'center',
    maxWidth: '100%',
    paddingHorizontal: 2,
  },
});
