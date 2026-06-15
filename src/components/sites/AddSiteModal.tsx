import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useCreateSite } from '@/hooks/useCreateSite';
import { mapSiteCreateError } from '@/lib/monitoring/siteCreateErrors';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (siteId: string) => void;
};

export function AddSiteModal({ open, onOpenChange, onCreated }: Props) {
  const createSite = useCreateSite();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    onOpenChange(false);
    setName('');
    setLocation('');
    setError(null);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    setName('');
    setLocation('');
    setError(null);
  }, [open]);

  const submit = useCallback(async () => {
    setError(null);
    try {
      const row = await createSite.mutateAsync({
        name,
        location: location.trim() || null,
      });
      onCreated?.(row.id);
      close();
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Could not create site';
      setError(mapSiteCreateError(raw));
    }
  }, [close, createSite, location, name, onCreated]);

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Add site</Text>
            <Pressable onPress={close} hitSlop={12} accessibilityLabel="Close">
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.label}>Site name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Lagos HQ"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Location (optional)</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="City or address"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            autoCapitalize="words"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.btn, (!name.trim() || createSite.isPending) && styles.btnDisabled]}
            disabled={!name.trim() || createSite.isPending}
            onPress={() => void submit()}
          >
            {createSite.isPending ? (
              <ActivityIndicator color={Colors.bg} />
            ) : (
              <Text style={styles.btnText}>Create site</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  sheet: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
  },
  label: {
    marginTop: Spacing.sm,
    marginBottom: 6,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.bg,
  },
  error: {
    marginTop: Spacing.sm,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.alert,
  },
  btn: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: Colors.gold,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.bg,
  },
});
