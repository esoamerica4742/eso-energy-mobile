import { Pressable, StyleSheet, Text, View } from 'react-native';
import { footerBottomPadding, FOOTER_BOTTOM_EXTRA_LARGE } from '@/lib/layout/safeArea';
import type { AppProduct } from '@/lib/navigation/productRoutes';
import { AccessEntrance } from '@/screens/access/components/AccessEntrance';
import { ACCESS_FONTS, ACCESS_LAYOUT, ACCESS_THEME } from '@/screens/access/theme';

type Props = {
  bottomInset: number;
  lastProduct: AppProduct | null;
  onSignInEsoPay: () => void;
  onSignInMonitoring: () => void;
  onSignInLast: () => void;
};

export function AccessSignInFooter({
  bottomInset,
  lastProduct,
  onSignInEsoPay,
  onSignInMonitoring,
  onSignInLast,
}: Props) {
  const bottomPad = footerBottomPadding(
    { top: 0, right: 0, bottom: bottomInset, left: 0 },
    FOOTER_BOTTOM_EXTRA_LARGE,
  );

  const singleLabel =
    lastProduct === 'esopay'
      ? 'Sign in to Eso Pay'
      : lastProduct === 'monitoring'
        ? 'Sign in to Monitoring'
        : null;

  return (
    <View style={[styles.dock, { paddingBottom: bottomPad }]}>
      <AccessEntrance
        delay={700}
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.wrap}
      >
        {singleLabel ? (
          <Pressable
            onPress={onSignInLast}
            accessibilityRole="button"
            accessibilityLabel={singleLabel}
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          >
            <Text style={styles.btnText}>{singleLabel}</Text>
          </Pressable>
        ) : (
          <View style={styles.dualRow}>
            <Pressable
              onPress={onSignInEsoPay}
              accessibilityRole="button"
              accessibilityLabel="Sign in to Eso Pay"
              style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnText}>Sign in to Eso Pay</Text>
            </Pressable>
            <Pressable
              onPress={onSignInMonitoring}
              accessibilityRole="button"
              accessibilityLabel="Sign in to Monitoring"
              style={({ pressed }) => [styles.btnGhost, pressed && styles.btnGhostPressed]}
            >
              <Text style={styles.btnGhostText}>Monitoring sign-in</Text>
            </Pressable>
          </View>
        )}
        <Text style={styles.hint}>Email sign-in · 6-digit code · No password needed</Text>
      </AccessEntrance>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    marginTop: ACCESS_LAYOUT.signInDockTop,
    width: '100%',
    paddingTop: 8,
  },
  wrap: {
    alignItems: 'center',
    width: '100%',
  },
  dualRow: {
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ACCESS_THEME.border,
    backgroundColor: 'rgba(201,168,76,0.06)',
    minWidth: 240,
    alignItems: 'center',
  },
  btnPrimary: {
    width: '100%',
    maxWidth: 320,
  },
  btnPressed: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    opacity: 0.9,
  },
  btnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  btnGhostPressed: {
    opacity: 0.7,
  },
  btnText: {
    fontFamily: ACCESS_FONTS.uiBold,
    fontSize: 15,
    color: ACCESS_THEME.gold,
    letterSpacing: 0.3,
  },
  btnGhostText: {
    fontFamily: ACCESS_FONTS.ui,
    fontSize: 13,
    color: ACCESS_THEME.body,
    textDecorationLine: 'underline',
  },
  hint: {
    marginTop: 10,
    fontFamily: ACCESS_FONTS.ui,
    fontSize: 12,
    color: ACCESS_THEME.body,
    textAlign: 'center',
  },
});
