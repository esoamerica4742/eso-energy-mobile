import { View, Text, StyleSheet } from 'react-native';
import { inter } from '@/theme/fonts';

type Props = {
  reducedMotion?: boolean;
};

export function SovereignTopNav({ reducedMotion = false }: Props) {
  void reducedMotion;

  return (
    <View style={styles.wrap}>
      <Text style={styles.brand}>ESO ENERGY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'flex-start',
  },
  brand: {
    fontFamily: inter.bold,
    fontSize: 12,
    letterSpacing: 3.2,
    color: 'rgba(255,255,255,0.55)',
  },
});
