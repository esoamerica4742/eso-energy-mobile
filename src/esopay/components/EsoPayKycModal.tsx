import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { toEsoPayApiError } from '@/esopay/api/client';
import { inter } from '@/theme/fonts';

function getKycSaveErrorMessage(err: unknown): string {
  const apiError = toEsoPayApiError(err);
  if (
    apiError.code === 'KYC_ENCRYPTION_MISCONFIGURED' ||
    /invalid key length/i.test(apiError.message)
  ) {
    return 'Identity verification is temporarily unavailable. Please try again later or contact support.';
  }
  return apiError.message || 'Could not save identity details';
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  onSubmit: (input: { bvn?: string; nin?: string }) => Promise<void>;
  loading?: boolean;
};

export function EsoPayKycModal({ open, onOpenChange, onSaved, onSubmit, loading }: Props) {
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [bvnFocused, setBvnFocused] = useState(false);
  const [ninFocused, setNinFocused] = useState(false);

  const close = useCallback(() => {
    onOpenChange(false);
    setError(null);
  }, [onOpenChange]);

  const submit = useCallback(async () => {
    setError(null);
    const bvnDigits = bvn.replace(/\D/g, '');
    const ninDigits = nin.replace(/\D/g, '');
    if (bvnDigits.length !== 11 && ninDigits.length !== 11) {
      setError('Enter your 11-digit BVN or NIN to create a funding account.');
      return;
    }
    try {
      await onSubmit({
        bvn: bvnDigits.length === 11 ? bvnDigits : undefined,
        nin: ninDigits.length === 11 ? ninDigits : undefined,
      });
      onSaved();
      close();
    } catch (err) {
      setError(getKycSaveErrorMessage(err));
    }
  }, [bvn, close, nin, onSaved, onSubmit]);

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify your identity</Text>
          <Text style={styles.body}>
            Nigerian regulations require BVN or NIN to open your Eso Pay virtual account. Your
            details are encrypted and used only for wallet provisioning.
          </Text>

          <Text style={styles.label}>BVN</Text>
          <TextInput
            value={bvn}
            onChangeText={setBvn}
            keyboardType="number-pad"
            maxLength={11}
            secureTextEntry
            placeholder="11-digit BVN"
            placeholderTextColor="rgba(255,255,255,0.34)"
            style={[styles.input, bvnFocused && styles.inputFocused]}
            onFocus={() => setBvnFocused(true)}
            onBlur={() => setBvnFocused(false)}
          />

          <Text style={styles.or}>or</Text>

          <Text style={styles.label}>NIN</Text>
          <TextInput
            value={nin}
            onChangeText={setNin}
            keyboardType="number-pad"
            maxLength={11}
            secureTextEntry
            placeholder="11-digit NIN"
            placeholderTextColor="rgba(255,255,255,0.34)"
            style={[styles.input, ninFocused && styles.inputFocused]}
            onFocus={() => setNinFocused(true)}
            onBlur={() => setNinFocused(false)}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.btn, loading && styles.btnDisabled]}
            disabled={loading}
            onPress={() => void submit()}
          >
            <Text style={styles.btnText}>{loading ? 'Saving…' : 'Save & continue'}</Text>
          </Pressable>

          <Pressable onPress={close} style={styles.cancel}>
            <Text style={styles.cancelText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
    padding: 24,
    gap: 8,
  },
  title: {
    fontFamily: inter.bold,
    fontSize: 24,
    letterSpacing: -0.4,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  body: {
    fontFamily: inter.regular,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 12,
  },
  label: {
    fontFamily: inter.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: inter.regular,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#2C2C2E',
  },
  inputFocused: {
    borderColor: 'rgba(255,255,255,0.28)',
  },
  or: {
    textAlign: 'center',
    fontFamily: inter.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginVertical: 4,
  },
  error: {
    fontFamily: inter.regular,
    fontSize: 13,
    color: '#FF6B6B',
    marginTop: 4,
  },
  btn: {
    marginTop: 16,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.55 },
  btnText: {
    fontFamily: inter.bold,
    fontSize: 16,
    color: '#000000',
  },
  cancel: {
    marginTop: 4,
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: inter.medium,
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
  },
});
