import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type ViewProps,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/tokens/design';

type Props = ViewProps & {
  children: React.ReactNode;
};

export function ScreenWrapper({ children, style, ...rest }: Props) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={['top', 'left', 'right']} {...rest}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  inner: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});
