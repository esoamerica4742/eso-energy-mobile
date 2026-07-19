import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { PinEntry } from '@/esopay/components/PinEntry';
import { OPERATOR_PIN_LENGTH } from '@/lib/monitoring/operatorPin';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinConfigured: boolean;
  onSave: (pin: string) => Promise<void>;
};

export function OperatorPinModal({ open, onOpenChange, pinConfigured, onSave }: Props) {
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
        ? 'Enter new operator PIN'
        : 'Create operator PIN'
      : 'Confirm operator PIN';

  const subtitle =
    mode === 'create'
      ? '6-digit PIN for sensitive actions in monitoring.'
      : 'Enter the same PIN again to confirm.';

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Operator PIN</Text>
            <Pressable onPress={close} hitSlop={12} accessibilityLabel="Close">
              <X size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <PinEntry
            title={title}
            subtitle={subtitle}
            value={mode === 'create' ? pinInput : confirmInput}
            onChange={mode === 'create' ? setPinInput : setConfirmInput}
            onComplete={(pin) => void handleComplete(pin)}
            error={error}
            maxLength={OPERATOR_PIN_LENGTH}
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
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
});
