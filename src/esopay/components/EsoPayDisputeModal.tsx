import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEsoPayApiClient } from '@/esopay/api/useEsoPayApiClient';
import { useEsoPayEnabled } from '@/esopay/api/hooks/useEsoPayApiEnabled';
import { toEsoPayApiError } from '@/esopay/api/client';
import type { EsoPayDisputeTicket, EsoPayDisputeType } from '@/esopay/api/types';
import { ESO_ENERGY_SUPPORT_EMAIL } from '@/esopay/lib/esoEnergyLinks';
import { colors } from '@/esopay/theme/colors';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string | null;
};

const TYPES: { id: EsoPayDisputeType; label: string }[] = [
  { id: 'payment', label: 'Bill / utility payment' },
  { id: 'wallet', label: 'Wallet top-up' },
  { id: 'other', label: 'Other' },
];

export function EsoPayDisputeModal({ open, onOpenChange, userEmail }: Props) {
  const api = useEsoPayApiClient();
  const apiEnabled = useEsoPayEnabled();
  const [type, setType] = useState<EsoPayDisputeType>('payment');
  const [reference, setReference] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState<EsoPayDisputeTicket | null>(null);

  const resetForm = useCallback(() => {
    setType('payment');
    setReference('');
    setDetails('');
    setError(null);
    setBusy(false);
    setSubmitted(null);
  }, []);

  const close = useCallback(() => {
    onOpenChange(false);
    resetForm();
  }, [onOpenChange, resetForm]);

  const submitEmailFallback = useCallback(async () => {
    const subject = encodeURIComponent(`Eso Pay dispute — ${type}`);
    const body = encodeURIComponent(
      [
        `Issue type: ${type}`,
        reference.trim() ? `Reference: ${reference.trim()}` : null,
        `Account email: ${userEmail ?? 'unknown'}`,
        '',
        details.trim(),
      ]
        .filter(Boolean)
        .join('\n'),
    );
    const url = `mailto:${ESO_ENERGY_SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      setError(`Could not open your email app. Email ${ESO_ENERGY_SUPPORT_EMAIL} directly.`);
      return;
    }
    await Linking.openURL(url);
    close();
  }, [close, details, reference, type, userEmail]);

  const submit = useCallback(async () => {
    if (details.trim().length < 12) {
      setError('Describe the issue in at least a few words so we can help.');
      return;
    }

    if (!apiEnabled) {
      await submitEmailFallback();
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await api.disputes.create({
        dispute_type: type,
        payment_reference: reference.trim() || null,
        details: details.trim(),
      });
      setSubmitted(result.ticket);
    } catch (err) {
      const apiError = toEsoPayApiError(err);
      setError(apiError.message);
    } finally {
      setBusy(false);
    }
  }, [api, apiEnabled, details, reference, submitEmailFallback, type]);

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {submitted ? (
            <>
              <Text style={styles.title}>Dispute submitted</Text>
              <Text style={styles.body}>
                Your ticket has been logged. Our team will review it and follow up by email.
              </Text>
              <View style={styles.ticketBox}>
                <Text style={styles.ticketLabel}>Ticket reference</Text>
                <Text style={styles.ticketRef}>{submitted.ticket_ref}</Text>
                <Text style={styles.ticketStatus}>Status: {submitted.status}</Text>
              </View>
              <Pressable style={styles.btn} onPress={close}>
                <Text style={styles.btnText}>Done</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.title}>Report a transaction issue</Text>
              <Text style={styles.body}>
                Submit a dispute ticket with your payment reference. We typically respond within 1–2
                business days.
              </Text>

              <View style={styles.typeRow}>
                {TYPES.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setType(item.id)}
                    style={[styles.typeChip, type === item.id && styles.typeChipActive]}
                  >
                    <Text style={[styles.typeText, type === item.id && styles.typeTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Reference (optional)</Text>
              <TextInput
                value={reference}
                onChangeText={setReference}
                placeholder="Payment or wallet reference"
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoCapitalize="none"
              />

              <Text style={styles.label}>What happened?</Text>
              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="Describe the issue and amount involved"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.btn, busy && styles.btnDisabled]}
                onPress={() => void submit()}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color={colors.black} />
                ) : (
                  <Text style={styles.btnText}>Submit dispute</Text>
                )}
              </Pressable>
              <Pressable onPress={close} style={styles.cancel} disabled={busy}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </>
          )}
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
    fontSize: 20,
    color: colors.white,
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  ticketBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.surface2,
    gap: 4,
  },
  ticketLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  ticketRef: {
    fontFamily: fonts.uiMedium,
    fontSize: 18,
    color: colors.gold,
  },
  ticketStatus: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'capitalize',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  typeChipActive: {
    backgroundColor: colors.goldGlow,
    borderColor: colors.gold,
  },
  typeText: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: colors.muted,
  },
  typeTextActive: {
    color: colors.gold,
    fontFamily: fonts.uiMedium,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.surface2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.white,
  },
  textArea: {
    minHeight: 96,
  },
  error: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: '#E85D5D',
  },
  btn: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: colors.gold,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.black,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.muted,
  },
});
