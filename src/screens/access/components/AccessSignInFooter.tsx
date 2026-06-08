import { Pressable, StyleSheet, Text, View } from 'react-native';
import { footerBottomPadding, FOOTER_BOTTOM_EXTRA_LARGE } from '@/lib/layout/safeArea';
import { AccessEntrance } from '@/screens/access/components/AccessEntrance';
import { ACCESS_FONTS, ACCESS_LAYOUT, ACCESS_THEME } from '@/screens/access/theme';

type Props = {
  bottomInset: number;
  onSignIn: () => void;
};

export function AccessSignInFooter({ bottomInset, onSignIn }: Props) {
  const bottomPad = footerBottomPadding(
    { top: 0, right: 0, bottom: bottomInset, left: 0 },
    FOOTER_BOTTOM_EXTRA_LARGE,
  );
  return (
    <View style={[styles.dock, { paddingBottom: bottomPad }]}>
      <AccessEntrance
        delay={700}
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.wrap}
      >
        <Pressable
          onPress={onSignIn}
          accessibilityRole="button"
          accessibilityLabel="Sign in with email"
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnText}>Sign in with email</Text>
        </Pressable>
        <Text style={styles.hint}>Use your organization email · 6-digit code</Text>
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
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ACCESS_THEME.border,
    backgroundColor: 'rgba(201,168,76,0.06)',
  },
  btnPressed: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    opacity: 0.9,
  },
  btnText: {
    fontFamily: ACCESS_FONTS.uiBold,
    fontSize: 15,
    color: ACCESS_THEME.gold,
    letterSpacing: 0.3,
  },
  hint: {
    marginTop: 10,
    fontFamily: ACCESS_FONTS.ui,
    fontSize: 12,
    color: ACCESS_THEME.body,
    textAlign: 'center',
  },
});
