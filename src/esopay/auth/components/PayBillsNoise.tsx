import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, FeTurbulence, Filter, Rect } from 'react-native-svg';
import { PayBills } from '@/esopay/auth/payBillsTheme';

/** Subtle grain overlay — feTurbulence at ~2.5% opacity */
export function PayBillsNoise() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Filter id="grain">
            <FeTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
          </Filter>
        </Defs>
        <Rect width="100%" height="100%" filter="url(#grain)" opacity={0.025} />
      </Svg>
    </View>
  );
}

export function PayBillsScreenRoot({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <PayBillsNoise />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PayBills.bgPrimary,
    maxWidth: PayBills.maxWidth,
    width: '100%',
    alignSelf: 'center',
  },
});
