import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { PinEntry } from '@/esopay/components/PinEntry';
import { TRANSACTION_PIN_LENGTH } from '@/esopay/storage/transactionPin';
import { spacing } from '@/esopay/theme/spacing';
import { inter } from '@/theme/fonts';

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
          <View style={styles.dragHandle} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Transaction PIN</Text>
          </View>
          <Pressable
            onPress={close}
            hitSlop={12}
            accessibilityLabel="Close"
            style={styles.closeButton}
          >
            <X size={20} color="rgba(245, 240, 232, 0.5)" />
          </Pressable>

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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#0F1520',
    borderTopWidth: 1,
    borderTopColor: 'rgba(232, 160, 32, 0.2)',
    paddingBottom: spacing.xxl,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(245, 240, 232, 0.2)',
    marginTop: 12,
    marginBottom: 8,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: inter.semibold,
    fontSize: 17,
    fontWeight: '600',
    color: '#F5F0E8',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
  },
});
