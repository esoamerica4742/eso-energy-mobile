import { useCallback, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PinDots } from '@/esopay/components/pin/PinDots';
import { PinKeypad } from '@/esopay/components/pin/PinKeypad';
import { TRANSACTION_PIN_LENGTH } from '@/esopay/storage/transactionPin';
import { inter } from '@/theme/fonts';
import { ds } from '@/esopay/theme/designSystem';
import { GOLD } from '@/theme/colors';
const WARM_WHITE = '#F5F0E8';

type Props = {
  onComplete: (pin: string) => void;
  error?: string | null;
};

export function EsoPayConfirmPin({ onComplete, error }: Props) {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState('');

  const appendDigit = useCallback(
    (digit: string) => {
      if (pin.length >= TRANSACTION_PIN_LENGTH) return;
      const next = `${pin}${digit}`;
      setPin(next);
      if (next.length === TRANSACTION_PIN_LENGTH) {
        onComplete(next);
      }
    },
    [onComplete, pin],
  );

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={ds.color.bg} />

      <View style={styles.upperSection}>
        <View>
          <View style={styles.brandRow}>
            <View style={styles.brandCircle}>
              <Wallet color={GOLD} size={20} />
            </View>
            <Text style={styles.brandLabel}>ESO PAY</Text>
          </View>

          <Text style={styles.headline}>Confirm transaction PIN</Text>
          <Text style={styles.subtext}>Enter the same PIN again to confirm.</Text>
        </View>

        <View style={styles.dotsWrap}>
          <PinDots filledCount={pin.length} animateFill />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </View>

      <View style={styles.lowerSection}>
        <Text style={styles.securityReassurance}>
          Your PIN is encrypted and never stored in plain text.
        </Text>
        <PinKeypad
          onDigit={appendDigit}
          onBackspace={handleBackspace}
          backspaceDisabled={pin.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ds.color.bg,
    paddingHorizontal: 24,
  },
  upperSection: {
    flex: 0.45,
    justifyContent: 'space-between',
  },
  lowerSection: {
    flex: 0.55,
    justifyContent: 'flex-end',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  brandCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: GOLD,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLabel: {
    fontFamily: inter.semibold,
    color: GOLD,
    fontSize: 12,
    letterSpacing: 2,
  },
  headline: {
    fontFamily: inter.bold,
    color: WARM_WHITE,
    fontSize: 28,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 8,
  },
  subtext: {
    fontFamily: inter.regular,
    color: 'rgba(245,240,232,0.55)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  dotsWrap: {
    alignItems: 'center',
    gap: 12,
  },
  securityReassurance: {
    fontFamily: inter.regular,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 32,
  },
  errorText: {
    fontFamily: inter.regular,
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
  },
});
