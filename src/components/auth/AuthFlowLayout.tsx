import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HEADER_TOP_EXTRA } from '@/lib/layout/safeArea';

type Props = {
  children: ReactNode;
  footer: ReactNode;
  backgroundColor: string;
  footerStyle?: StyleProp<ViewStyle>;
};

/**
 * Monitoring auth shell — no scroll; content and CTA are siblings inside KeyboardAvoidingView.
 */
export function AuthFlowLayout({ children, footer, backgroundColor, footerStyle }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.keyboard, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: HEADER_TOP_EXTRA }]}>{children}</View>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(24, insets.bottom), marginBottom: 16 },
          footerStyle,
        ]}
      >
        {footer}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  footer: {
    paddingHorizontal: 24,
    width: '100%',
  },
});
