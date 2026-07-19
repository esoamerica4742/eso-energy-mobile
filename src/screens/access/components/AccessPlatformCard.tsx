import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import type { CommandCenterModule } from '@/screens/access/types';
import { CARD_VARIANT_THEME, ACCESS_FONTS, ACCESS_THEME } from '@/screens/access/theme';
import { AccessEntrance } from '@/screens/access/components/AccessEntrance';

type Props = {
  module: CommandCenterModule;
  onPress: () => void;
  delay: number;
};

export function AccessPlatformCard({ module, onPress, delay }: Props) {
  const [pressed, setPressed] = useState(false);
  const cardTheme = CARD_VARIANT_THEME[module.variant];
  const Icon = module.icon;

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  return (
    <AccessEntrance
      delay={delay}
      from={{ opacity: 0, translateY: 22 }}
      animate={{ opacity: 1, translateY: 0 }}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        accessibilityRole="button"
        accessibilityLabel={module.title}
        style={({ pressed: nativePressed }) => [
          styles.cardOuter,
          (pressed || nativePressed) && styles.cardOuterPressed,
        ]}
      >
        <View style={styles.cardSurface}>
          <LinearGradient
            colors={[ACCESS_THEME.accentBar, ACCESS_THEME.accentBarFade, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.cardAccentBar}
          />

          <LinearGradient
            colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.cardInnerGlow}
            pointerEvents="none"
          />

          {pressed ? <View style={styles.cardPressBloom} pointerEvents="none" /> : null}

          <View style={styles.cardBody}>
            <View style={[styles.cardIcon, { backgroundColor: cardTheme.iconContainerBg }]}>
              <Icon size={24} color={cardTheme.iconColor} strokeWidth={2} />
            </View>

            <Text style={styles.cardTitle}>{module.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {module.description}
            </Text>
            {module.metadata ? (
              <Text
                style={[
                  styles.cardMetadata,
                  { color: cardTheme.metadataColor },
                ]}
              >
                {module.metadata}
              </Text>
            ) : null}

            <View style={styles.cardDivider} />

            <View style={[styles.ctaRow, pressed && styles.ctaRowPressed]}>
              <View style={pressed ? styles.chevronPressed : undefined}>
                <CaretRight size={18} color={cardTheme.chevronColor} weight="bold" />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </AccessEntrance>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 18,
    transform: [{ scale: 1 }],
    opacity: 1,
  },
  cardOuterPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  cardSurface: {
    backgroundColor: ACCESS_THEME.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.42,
    shadowRadius: 18,
    elevation: 10,
  },
  cardAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  cardInnerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  cardPressBloom: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(247,244,238,0.035)',
  },
  cardBody: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cardIcon: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: ACCESS_FONTS.display,
    fontSize: 18,
    lineHeight: 23,
    color: ACCESS_THEME.white,
    marginBottom: 6,
  },
  cardDescription: {
    fontFamily: ACCESS_FONTS.ui,
    fontSize: 13,
    lineHeight: 18.2,
    color: ACCESS_THEME.muted,
  },
  cardMetadata: {
    fontFamily: ACCESS_FONTS.body,
    fontWeight: '400',
    fontSize: 11,
    marginTop: 6,
    opacity: 0.7,
  },
  cardDivider: {
    marginTop: 12,
    height: StyleSheet.hairlineWidth,
    backgroundColor: ACCESS_THEME.divider,
  },
  ctaRow: {
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 10,
  },
  ctaRowPressed: {
    backgroundColor: ACCESS_THEME.ctaPress,
  },
  chevronPressed: {
    transform: [{ translateX: 3 }],
  },
});
