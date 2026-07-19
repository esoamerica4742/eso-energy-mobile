import { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { AUTH_HORIZONTAL_PAD } from '@/components/auth/authLayout';
import type { AuthVariant } from '@/components/auth/authTypes';
import { NAV_ICON_COLUMN_WIDTH } from '@/lib/layout/safeArea';
import { ESOPAY_SIGN_IN } from '@/esopay/auth/esoPaySignInTheme';
import { inter } from '@/theme/fonts';
import { C, F } from '@/theme/authTheme';

const TRACK_WIDTH = Dimensions.get('window').width - AUTH_HORIZONTAL_PAD * 2;

type Props = {
  step: number;
  total?: number;
  progressPercent: number;
  variant?: AuthVariant;
};

export function AuthTopBar({ step, total = 3, progressPercent, variant = 'default' }: Props) {
  const router = useRouter();
  const progress = useSharedValue(progressPercent);
  const isEsoPay = variant === 'esopay';

  useEffect(() => {
    progress.value = withSpring(progressPercent, { damping: 18, stiffness: 120 });
  }, [progressPercent, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: (TRACK_WIDTH * progress.value) / 100,
  }));

  return (
    <View>
      <View style={styles.row}>
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          hitSlop={{ top: 8, bottom: 8, right: 8, left: 0 }}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather
            name="arrow-left"
            size={20}
            color="#FFFFFF"
          />
        </Pressable>
        <Text style={[styles.step, isEsoPay && styles.stepEsoPay]}>
          {step} of {total}
        </Text>
      </View>
      <View style={[styles.track, isEsoPay && styles.trackEsoPay]}>
        <Animated.View style={[styles.fillWrap, fillStyle]}>
          <View style={isEsoPay ? styles.fillEsoPay : styles.fillQuiet} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: NAV_ICON_COLUMN_WIDTH,
    height: NAV_ICON_COLUMN_WIDTH,
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
  },
  step: {
    fontFamily: F.mono,
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
  },
  stepEsoPay: {
    fontFamily: inter.medium,
    color: ESOPAY_SIGN_IN.muted,
    opacity: 1,
  },
  track: {
    marginTop: 12,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  trackEsoPay: {
    height: 3,
    borderRadius: 2,
    backgroundColor: ESOPAY_SIGN_IN.border,
  },
  fillWrap: { height: '100%' },
  fillQuiet: {
    flex: 1,
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  fillEsoPay: {
    flex: 1,
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});
