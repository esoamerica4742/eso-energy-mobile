import { StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { MotionPressable } from '@/lib/motion';
import { footerBottomPadding, FOOTER_BOTTOM_EXTRA_LARGE } from '@/lib/layout/safeArea';
import { ESOPAY_SIGN_IN } from '@/esopay/auth/esoPaySignInTheme';
import { inter } from '@/theme/fonts';
import { MONITORING_AUTH } from '@/theme/monitoringAuthTheme';
import { C, F } from '@/theme/authTheme';

type Props = {
  bottomInset: number;
  variant?: 'default' | 'esopay' | 'monitoring';
  /** Eso Pay CTA verb for legal line (default: Send Code). */
  esopayActionLabel?: string;
  /** When true, parent scroll shell already applies bottom safe padding. */
  embedded?: boolean;
};

export function AuthLegalFooter({
  bottomInset,
  variant = 'default',
  esopayActionLabel = 'Send Code',
  embedded = false,
}: Props) {
  const paddingBottom = embedded
    ? 0
    : footerBottomPadding(
        { top: 0, right: 0, bottom: bottomInset, left: 0 },
        FOOTER_BOTTOM_EXTRA_LARGE,
      );
  const isEsoPay = variant === 'esopay';
  const isMonitoring = variant === 'monitoring';

  if (isEsoPay) {
    return (
      <View style={[styles.legal, styles.legalEsoPay, !embedded && { paddingBottom }]}>
        <Text style={styles.esopayLegalLine}>
          <Text style={styles.esopayLegalMuted}>By tapping {esopayActionLabel}, you agree to our </Text>
          <Text
            style={styles.esopayLegalLink}
            onPress={() => void WebBrowser.openBrowserAsync('https://esoenergy.com/terms')}
          >
            Terms of Service
          </Text>
          <Text style={styles.esopayLegalMuted}> · </Text>
          <Text
            style={styles.esopayLegalLink}
            onPress={() => void WebBrowser.openBrowserAsync('https://esoenergy.com/privacy')}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.legal, { paddingBottom }]}>
      <Text style={styles.legalMuted}>By continuing, you agree to our</Text>
      <MotionPressable
        haptic="light"
        onPress={() => WebBrowser.openBrowserAsync('https://esoenergy.com/terms')}
        style={styles.legalLinks}
      >
        <Text style={[styles.legalLink, isMonitoring && styles.legalLinkMonitoring]}>
          Terms of Service
        </Text>
        <Text style={styles.legalMuted}> · </Text>
        <Text style={[styles.legalLink, isMonitoring && styles.legalLinkMonitoring]}>
          Privacy Policy
        </Text>
      </MotionPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  legal: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  legalEsoPay: {
    alignItems: 'flex-start',
  },
  legalMuted: {
    fontFamily: F.sansLight,
    fontSize: 11,
    lineHeight: 16,
    color: C.OFF_WHITE,
    opacity: 0.25,
    textAlign: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  legalLink: {
    fontFamily: F.sansLight,
    fontSize: 11,
    lineHeight: 16,
    color: C.GOLD_MID,
  },
  legalLinkMonitoring: {
    color: MONITORING_AUTH.teal,
  },
  esopayLegalLine: {
    fontFamily: inter.regular,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'left',
  },
  esopayLegalMuted: {
    color: ESOPAY_SIGN_IN.legal,
  },
  esopayLegalLink: {
    fontFamily: inter.medium,
    fontSize: 11,
    lineHeight: 17,
    color: ESOPAY_SIGN_IN.teal,
  },
});
