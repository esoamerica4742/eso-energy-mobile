import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { inter } from '@/theme/fonts';

type Props = {
  message?: string;
  error?: string | null;
  onRetry?: () => void;
};

/** Quiet boot shell while routing and fonts hydrate. */
export function MobileBootScreen({
  message = '',
  error,
  onRetry,
}: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.brand}>ESO ENERGY</Text>
      {error ? (
        <>
          <Text style={styles.errorTitle}>Could not load the app</Text>
          <Text style={styles.errorBody}>{error}</Text>
          {onRetry ? (
            <Pressable style={styles.button} onPress={onRetry}>
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <>
          <ActivityIndicator color="#FFFFFF" size="small" />
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 13,
    letterSpacing: 3.4,
    fontFamily: inter.bold,
    fontWeight: '700',
    marginBottom: 28,
  },
  message: {
    color: 'rgba(255,255,255,0.45)',
    fontFamily: inter.regular,
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: inter.semibold,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorBody: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: inter.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 20,
    height: 48,
    paddingHorizontal: 28,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: inter.bold,
    fontWeight: '700',
  },
});
