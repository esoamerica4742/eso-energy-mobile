import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { luxury } from '@/esopay/theme/luxury';
import { fonts } from '@/esopay/theme/typography';

type Props = { children: ReactNode };
type State = { failed: boolean };

/** Prevents Quick Pay UI from taking down the whole Eso Pay home tab. */
export class QuickPayErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.warn('[QuickPay]', error.message, info.componentStack);
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.label}>Pay a Bill</Text>
          <Text style={styles.msg}>Shortcuts unavailable — open Bills & Utilities below.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    gap: 8,
    paddingVertical: 12,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: luxury.warmWhite,
  },
  msg: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: luxury.textMuted,
    lineHeight: 18,
  },
});
