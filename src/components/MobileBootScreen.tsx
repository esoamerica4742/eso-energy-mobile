import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/tokens/design';

type Props = {
  message?: string;
  error?: string | null;
  onRetry?: () => void;
};

/** Shown while the heavy landing bundle loads — avoids a blank white Expo Go screen. */
export function MobileBootScreen({ message = 'Loading ESO Energy…', error, onRetry }: Props) {
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
          <ActivityIndicator color={Colors.gold} size="large" />
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.hint}>First load can take up to a minute on Expo Go.</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brand: {
    color: Colors.gold,
    fontSize: 12,
    letterSpacing: 2.4,
    fontWeight: '700',
    marginBottom: 28,
  },
  message: {
    marginTop: 18,
    color: '#E4E4E7',
    fontSize: 15,
    textAlign: 'center',
  },
  hint: {
    marginTop: 10,
    color: '#71717A',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorBody: {
    marginTop: 10,
    color: '#FCA5A5',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#060809',
    fontWeight: '700',
    fontSize: 14,
  },
});
