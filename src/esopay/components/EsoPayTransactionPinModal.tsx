import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { PinEntry } from '@/esopay/components/PinEntry';
import { TRANSACTION_PIN_LENGTH } from '@/esopay/storage/transactionPin';
import { colors } from '@/esopay/theme/colors';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinConfigured: boolean;
  onSave: (pin: string) => Promise<void>;
};

export function EsoPayTransactionPinModal({ open, onOpenChange, pinConfigured, onSave }: Props) {
  const [pinInput, setPinInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [mode, setMode] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = useCallback(() => {
    onOpenChange(false);
    setPinInput('');
    setConfirmInput('');
    setMode('create');
    setError(null);
    setBusy(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    setPinInput('');
    setConfirmInput('');
    setMode('create');
    setError(null);
    setBusy(false);
  }, [open]);

  const handleComplete = useCallback(
    async (pin: string) => {
      if (busy) return;
      setError(null);

      if (mode === 'create') {
        setPinInput(pin);
        setConfirmInput('');
        setMode('confirm');
        return;
      }

      if (pin !== pinInput) {
        setError('PINs do not match. Try again.');
        setConfirmInput('');
        return;
      }

      setBusy(true);
      try {
        await onSave(pin);
        close();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save PIN');
        setConfirmInput('');
      } finally {
        setBusy(false);
      }
    },
    [busy, close, mode, onSave, pinInput],
  );

  const title =
    mode === 'create'
      ? pinConfigured
        ? 'Enter new transaction PIN'
        : 'Set up transaction PIN'
      : 'Confirm transaction PIN';

  const subtitle =
    mode === 'create'
      ? '4-digit PIN required for wallet payments on this device.'
      : 'Enter the same PIN again to confirm.';

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Transaction PIN</Text>
            <Pressable onPress={close} hitSlop={12} accessibilityLabel="Close">
              <X size={22} color={colors.muted} />
            </Pressable>
          </View>

          <PinEntry
            title={title}
            subtitle={subtitle}
            value={mode === 'create' ? pinInput : confirmInput}
            onChange={mode === 'create' ? setPinInput : setConfirmInput}
            onComplete={(pin) => void handleComplete(pin)}
            error={error}
            maxLength={TRANSACTION_PIN_LENGTH}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.white,
  },
});
