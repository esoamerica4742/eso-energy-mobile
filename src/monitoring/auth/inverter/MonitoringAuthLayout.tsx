import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { INVERTER_AUTH } from '@/monitoring/auth/inverter/tokens';

type Props = {
  top: ReactNode;
  middle: ReactNode;
  bottom: ReactNode;
};

/** Fixed viewport auth shell — no ScrollView. */
export function MonitoringAuthLayout({ top, middle, bottom }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={INVERTER_AUTH.BG_PRIMARY} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.body}>
          <View style={styles.top}>{top}</View>
          <View style={styles.middle}>{middle}</View>
          <View style={styles.bottom}>{bottom}</View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: INVERTER_AUTH.BG_PRIMARY,
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  top: {
    paddingTop: 8,
    flexShrink: 0,
    gap: 12,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    flexShrink: 1,
  },
  bottom: {
    paddingBottom: 16,
    flexShrink: 0,
    gap: 12,
  },
});
