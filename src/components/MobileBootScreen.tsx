import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GOLD } from '@/theme/colors';

type Props = {
  message?: string;
  error?: string | null;
  onRetry?: () => void;
};

/** Premium boot shell while routing and fonts hydrate. */
export function MobileBootScreen({
  message = 'Preparing your command centers…',
  error,
  onRetry,
}: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(201,168,76,0.08)', 'transparent']}
        style={styles.glow}
        pointerEvents="none"
      />
      <View style={styles.avatar}>
        <Text style={styles.avatarLetter}>E</Text>
      </View>
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
          <ActivityIndicator color={GOLD} size="large" />
          <Text style={styles.message}>{message}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#08080D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLetter: {
    color: '#08080D',
    fontSize: 24,
    fontWeight: '700',
  },
  brand: {
    color: GOLD,
    fontSize: 12,
    letterSpacing: 2.8,
    fontWeight: '700',
    marginBottom: 28,
  },
  message: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#F7F4EE',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorBody: {
    color: '#A0A0A0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
    backgroundColor: 'rgba(201,168,76,0.1)',
  },
  buttonText: {
    color: GOLD,
    fontSize: 15,
    fontWeight: '600',
  },
});
