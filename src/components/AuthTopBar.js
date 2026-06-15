import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AUTH_HORIZONTAL_PAD } from '@/components/auth/authLayout';
import { NAV_ICON_COLUMN_WIDTH } from '@/lib/layout/safeArea';
import { ESOPAY_SIGN_IN } from '@/esopay/auth/esoPaySignInTheme';
import { inter } from '@/theme/fonts';
import { C, F } from '../theme/authTheme';

const TRACK_WIDTH = Dimensions.get('window').width - AUTH_HORIZONTAL_PAD * 2;

export function AuthTopBar({ step, total = 3, progressPercent, variant = 'default' }) {
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
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
            color={isEsoPay ? ESOPAY_SIGN_IN.gold : C.GOLD_MID}
          />
        </Pressable>
        <Text style={[styles.step, isEsoPay && styles.stepEsoPay]}>
          {step} of {total}
        </Text>
      </View>
      <View style={[styles.track, isEsoPay && styles.trackEsoPay]}>
        <Animated.View style={[styles.fillWrap, fillStyle]}>
          {isEsoPay ? (
            <View style={styles.fillEsoPay} />
          ) : (
            <LinearGradient
              colors={[C.GOLD_DARK, C.GOLD_MID]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fill}
            />
          )}
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
    color: C.OFF_WHITE,
    opacity: 0.25,
  },
  stepEsoPay: {
    fontFamily: inter.medium,
    color: ESOPAY_SIGN_IN.muted,
    opacity: 1,
  },
  track: {
    marginTop: 12,
    height: 2,
    backgroundColor: C.DARK_3,
    borderRadius: 1,
    overflow: 'hidden',
  },
  trackEsoPay: {
    height: 3,
    borderRadius: 2,
    backgroundColor: ESOPAY_SIGN_IN.border,
  },
  fillWrap: { height: '100%' },
  fill: { flex: 1, height: '100%' },
  fillEsoPay: {
    flex: 1,
    height: '100%',
    backgroundColor: ESOPAY_SIGN_IN.gold,
  },
});
