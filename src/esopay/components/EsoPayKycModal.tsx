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
import { colors } from '@/esopay/theme/colors';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

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
            Nigerian regulations require BVN or NIN to open your Eso Pay virtual account and fund
            your wallet. Your identity is encrypted and used only for wallet provisioning under
            NDPR — we do not sell your data.
          </Text>

          <Text style={styles.label}>BVN (11 digits)</Text>
          <TextInput
            value={bvn}
            onChangeText={setBvn}
            keyboardType="number-pad"
            maxLength={11}
            secureTextEntry
            placeholder="•••••••••••"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          <Text style={styles.or}>or</Text>

          <Text style={styles.label}>NIN (11 digits)</Text>
          <TextInput
            value={nin}
            onChangeText={setNin}
            keyboardType="number-pad"
            maxLength={11}
            secureTextEntry
            placeholder="•••••••••••"
            placeholderTextColor={colors.muted}
            style={styles.input}
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
    padding: spacing.lg,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.white,
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.muted,
    marginTop: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.goldBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.ui,
    fontSize: 16,
    color: colors.white,
    backgroundColor: colors.surface2,
  },
  or: {
    textAlign: 'center',
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.muted,
    marginVertical: spacing.xs,
  },
  error: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: '#f87171',
    marginTop: spacing.xs,
  },
  btn: {
    marginTop: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.gold,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.black,
  },
  cancel: {
    marginTop: spacing.sm,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.muted,
  },
});
