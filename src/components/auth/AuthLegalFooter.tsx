import { StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { MotionPressable } from '@/lib/motion';
import { footerBottomPadding, FOOTER_BOTTOM_EXTRA_LARGE } from '@/lib/layout/safeArea';
import { C, F } from '@/theme/authTheme';

type Props = {
  bottomInset: number;
};

export function AuthLegalFooter({ bottomInset }: Props) {
  const paddingBottom = footerBottomPadding(
    { top: 0, right: 0, bottom: bottomInset, left: 0 },
    FOOTER_BOTTOM_EXTRA_LARGE,
  );

  return (
    <View style={[styles.legal, { paddingBottom }]}>
      <Text style={styles.legalMuted}>By continuing, you agree to our</Text>
      <MotionPressable
        haptic="light"
        onPress={() => WebBrowser.openBrowserAsync('https://esoenergy.com/terms')}
        style={styles.legalLinks}
      >
        <Text style={styles.legalLink}>Terms of Service</Text>
        <Text style={styles.legalMuted}> · </Text>
        <Text style={styles.legalLink}>Privacy Policy</Text>
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
});
