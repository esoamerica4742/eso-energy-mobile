import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';
import { ACCESS_FONTS, ACCESS_THEME } from '@/screens/access/theme';
import { AccessEntrance } from '@/screens/access/components/AccessEntrance';

type Props = {
  topInset: number;
};

export function AccessBrandHeader({ topInset }: Props) {
  const reduced = useReducedMotion();

  return (
    <AccessEntrance
      delay={0}
      from={{ opacity: 0, translateY: -14 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={[styles.brandRow, { paddingTop: topInset }]}
    >
      <View style={styles.avatarShell}>
        {!reduced ? (
          <MotiView
            from={{ scale: 1, opacity: 0.2 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{
              type: 'timing',
              duration: 2000,
              loop: true,
              easing: Easing.out(Easing.ease),
            }}
            style={styles.avatarPulse}
          />
        ) : null}
        <LinearGradient
          colors={[ACCESS_THEME.gold, ACCESS_THEME.goldDim]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarLetter}>E</Text>
        </LinearGradient>
      </View>
      <Text style={styles.wordmark}>ESO ENERGY</Text>
    </AccessEntrance>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarShell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ACCESS_THEME.gold,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCESS_THEME.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarLetter: {
    fontFamily: ACCESS_FONTS.display,
    fontSize: 18,
    color: ACCESS_THEME.bg,
    marginTop: -1,
  },
  wordmark: {
    marginLeft: 12,
    fontFamily: ACCESS_FONTS.uiBold,
    fontSize: 13,
    color: ACCESS_THEME.gold,
    letterSpacing: 2.6,
  },
});
