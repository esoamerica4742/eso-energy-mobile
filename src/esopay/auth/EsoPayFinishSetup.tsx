import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle, Circle, ShieldCheck, Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { inter } from '@/theme/fonts';
import { GOLD } from '@/theme/colors';

const BG = '#080A0F';
const TEAL = '#00C48C';
const WARM_WHITE = '#F5F0E8';

const SETUP_CHECKLIST = [
  { label: 'Email verified', complete: true },
  { label: 'Transaction PIN set', complete: true },
  { label: 'Wallet ready to fund', complete: false },
] as const;

type Props = {
  onFundWallet: () => void;
  onSkip: () => void;
};

export function EsoPayFinishSetup({ onFundWallet, onSkip }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View style={styles.topContent}>
        <View style={styles.brandRow}>
          <View style={styles.brandCircle}>
            <Wallet color={GOLD} size={20} />
          </View>
          <Text style={styles.brandLabel}>ESO PAY</Text>
        </View>

        <Text style={styles.activateLabel}>ACTIVATE ESO PAY · 2 OF 2</Text>

        <View style={styles.walletCircle}>
          <Wallet color={GOLD} size={32} />
        </View>

        <Text style={styles.headline}>Finish setting up</Text>

        <Text style={styles.bodyText}>
          Fund your NGN wallet once to pay{'\n'}
          electricity, airtime, and utility bills.{'\n'}
          Identity verification (BVN/NIN) is{'\n'}
          only required when you add funds.
        </Text>

        <View style={styles.pinBadge}>
          <ShieldCheck color={GOLD} size={16} />
          <Text style={styles.pinBadgeText}>Transaction PIN configured</Text>
        </View>

        <View style={styles.checklistCard}>
          {SETUP_CHECKLIST.map((item) => (
            <View key={item.label} style={styles.checklistRow}>
              {item.complete ? (
                <CheckCircle color={TEAL} size={18} strokeWidth={2} />
              ) : (
                <Circle color="rgba(245, 240, 232, 0.3)" size={18} strokeWidth={2} />
              )}
              <Text
                style={[
                  styles.checklistText,
                  item.complete ? styles.checklistTextComplete : styles.checklistTextPending,
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.fundButton}
          onPress={onFundWallet}
          accessibilityRole="button"
          accessibilityLabel="Fund wallet"
        >
          <Text style={styles.fundButtonText}>Fund wallet →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip for now"
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
  },
  topContent: {
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
    alignSelf: 'flex-start',
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
  activateLabel: {
    fontFamily: inter.semibold,
    color: GOLD,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 48,
    alignSelf: 'flex-start',
  },
  walletCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: GOLD,
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  headline: {
    fontFamily: inter.bold,
    color: WARM_WHITE,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 12,
  },
  bodyText: {
    fontFamily: inter.regular,
    color: 'rgba(245, 240, 232, 0.5)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pinBadgeText: {
    fontFamily: inter.semibold,
    color: GOLD,
    fontSize: 14,
  },
  checklistCard: {
    alignSelf: 'stretch',
    backgroundColor: '#0F1520',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  checklistText: {
    fontFamily: inter.regular,
    fontSize: 14,
  },
  checklistTextComplete: {
    color: 'rgba(245, 240, 232, 0.7)',
  },
  checklistTextPending: {
    color: 'rgba(245, 240, 232, 0.35)',
  },
  actions: {
    width: '100%',
    marginTop: 24,
  },
  fundButton: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  fundButtonText: {
    fontFamily: inter.bold,
    color: '#000000',
    fontSize: 16,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: inter.medium,
    color: 'rgba(245, 240, 232, 0.5)',
    fontSize: 16,
  },
});
