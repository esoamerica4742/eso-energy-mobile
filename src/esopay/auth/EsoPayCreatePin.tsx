import { useCallback, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PinDots } from '@/esopay/components/pin/PinDots';
import { PinKeypad } from '@/esopay/components/pin/PinKeypad';
import { TRANSACTION_PIN_LENGTH } from '@/esopay/storage/transactionPin';
import { inter } from '@/theme/fonts';
import { ds } from '@/esopay/theme/designSystem';
import { ESO_PAY_GOLD, ESO_PAY_TEXT_PRIMARY, ESO_PAY_TEXT_SECONDARY } from '@/esopay/theme/brandColors';
const CHROME = ESO_PAY_GOLD;
const WARM_WHITE = ESO_PAY_TEXT_PRIMARY;

type Props = {
  onComplete: (pin: string) => void;
  isRecovery?: boolean;
};

export function EsoPayCreatePin({ onComplete, isRecovery }: Props) {
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
              <Wallet color={CHROME} size={20} />
            </View>
            <Text style={styles.brandLabel}>ESO PAY</Text>
          </View>

          <Text style={styles.headline}>
            {isRecovery ? 'New transaction PIN' : 'Create transaction PIN'}
          </Text>

          <Text style={styles.subtext}>
            Your 6-digit PIN unlocks the app{'\n'}and secures every payment.
          </Text>

          <View style={styles.pinEntryGroup}>
            <PinDots filledCount={pin.length} animateFill />
            <Text style={styles.securityReassurance}>
              Your PIN is encrypted and never stored in plain text.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.lowerSection}>
        <PinKeypad
          variant="quiet"
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
    justifyContent: 'flex-start',
  },
  pinEntryGroup: {
    alignItems: 'center',
    marginTop: 32,
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLabel: {
    fontFamily: inter.semibold,
    color: 'rgba(255,255,255,0.55)',
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
    color: ESO_PAY_TEXT_SECONDARY,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  securityReassurance: {
    fontFamily: inter.regular,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
});
