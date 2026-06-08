import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type Props = {
  reducedMotion?: boolean;
};

export function SovereignTopNav({ reducedMotion = false }: Props) {
  void reducedMotion;

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <View style={styles.logo}>
          <LinearGradient
            colors={['#1A1F2E', '#0D1017']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          />
          <View style={styles.logoInnerRing} />
          <View style={styles.logoInsetGlow} />
          <ShieldCheck size={14} color={colors.gold} strokeWidth={2.1} />
        </View>
        <Text style={styles.brand}>ESO Energy</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(201,155,58,1)',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    overflow: 'hidden',
  },
  logoGradient: {
    ...StyleSheet.absoluteFill,
  },
  logoInnerRing: {
    position: 'absolute',
    top: 0.8,
    right: 0.8,
    bottom: 0.8,
    left: 0.8,
    borderRadius: 7.2,
    borderWidth: 1,
    borderColor: 'rgba(201,155,58,0.22)',
  },
  logoInsetGlow: {
    position: 'absolute',
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(201,155,58,0.12)',
    shadowColor: 'rgba(201,155,58,1)',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  brand: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: fontSize.body,
    letterSpacing: -0.12,
    fontWeight: '800',
  },
});
