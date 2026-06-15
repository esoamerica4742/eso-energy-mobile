import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { ArrowLeft, Copy, KeyRound, Plus, Trash2 } from 'lucide-react-native';
import { OperatorPinModal } from '@/components/settings/OperatorPinModal';
import { useOperatorPin } from '@/hooks/useOperatorPin';
import { useEnodeToast } from '@/providers/EnodeToastProvider';
import { monitoringApi, type MonitoringApiKey } from '@/services/monitoringApi';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

export function ApiKeysScreen() {
  const router = useRouter();
  const toast = useEnodeToast();
  const { pinConfigured, configurePin, verifyPin } = useOperatorPin();
  const [unlocked, setUnlocked] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [keys, setKeys] = useState<MonitoringApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await monitoringApi.listApiKeys();
      setKeys(res.keys);
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Could not load API keys', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (unlocked) void loadKeys();
  }, [loadKeys, unlocked]);

  const handlePinSave = useCallback(
    async (pin: string) => {
      if (!pinConfigured) {
        await configurePin(pin);
        setUnlocked(true);
        setPinOpen(false);
        return;
      }
      const ok = (await verifyPin(pin)).ok;
      if (!ok) throw new Error('Incorrect PIN');
      setUnlocked(true);
      setPinOpen(false);
    },
    [configurePin, pinConfigured, verifyPin],
  );

  const createKey = useCallback(async () => {
    const name = newKeyName.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const res = await monitoringApi.createApiKey(name);
      setRevealedSecret(res.secret);
      setNewKeyName('');
      await loadKeys();
      toast.show('API key created — copy it now', 'success');
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Could not create key', 'error');
    } finally {
      setCreating(false);
    }
  }, [creating, loadKeys, newKeyName, toast]);

  const revokeKey = useCallback(
    async (keyId: string) => {
      try {
        await monitoringApi.revokeApiKey(keyId);
        await loadKeys();
        toast.show('API key revoked', 'success');
      } catch (err) {
        toast.show(err instanceof Error ? err.message : 'Could not revoke key', 'error');
      }
    },
    [loadKeys, toast],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>API keys</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!unlocked ? (
          <Pressable style={styles.unlockBtn} onPress={() => setPinOpen(true)}>
            <KeyRound size={18} color={Colors.gold} />
            <Text style={styles.unlockText}>
              {pinConfigured ? 'Enter operator PIN' : 'Set operator PIN to continue'}
            </Text>
          </Pressable>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create integration key</Text>
              <TextInput
                value={newKeyName}
                onChangeText={setNewKeyName}
                placeholder="BI dashboard"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
              />
              <Pressable
                style={[styles.createBtn, (!newKeyName.trim() || creating) && styles.btnDisabled]}
                disabled={!newKeyName.trim() || creating}
                onPress={() => void createKey()}
              >
                {creating ? (
                  <ActivityIndicator color={Colors.bg} />
                ) : (
                  <>
                    <Plus size={16} color={Colors.bg} />
                    <Text style={styles.createBtnText}>Create key</Text>
                  </>
                )}
              </Pressable>
            </View>

            {revealedSecret ? (
              <View style={styles.secretCard}>
                <Text style={styles.secretTitle}>Copy your new key</Text>
                <Text style={styles.secretCopy}>This secret is shown once. Store it securely.</Text>
                <Text style={styles.secretValue}>{revealedSecret}</Text>
                <Pressable
                  style={styles.copyBtn}
                  onPress={() => void Clipboard.setStringAsync(revealedSecret)}
                >
                  <Copy size={14} color={Colors.gold} />
                  <Text style={styles.copyText}>Copy to clipboard</Text>
                </Pressable>
              </View>
            ) : null}

            <Text style={styles.section}>Active keys</Text>
            {loading ? (
              <ActivityIndicator color={Colors.gold} />
            ) : keys.length === 0 ? (
              <Text style={styles.empty}>No active API keys for this workspace.</Text>
            ) : (
              keys.map((key) => (
                <View key={key.id} style={styles.keyRow}>
                  <View style={styles.keyCopy}>
                    <Text style={styles.keyName}>{key.name}</Text>
                    <Text style={styles.keyMeta}>
                      {key.key_prefix}•••• · {key.scope} · expires{' '}
                      {new Date(key.expires_at).toLocaleDateString('en-NG')}
                    </Text>
                  </View>
                  <Pressable onPress={() => void revokeKey(key.id)} hitSlop={8}>
                    <Trash2 size={18} color={Colors.alert} />
                  </Pressable>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <OperatorPinModal
        open={pinOpen}
        onOpenChange={setPinOpen}
        pinConfigured={pinConfigured}
        onSave={handlePinSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: FontSize.title,
    color: Colors.textPrimary,
  },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
  },
  unlockText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.body,
    color: Colors.gold,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
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
  createBtn: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: Colors.gold,
  },
  btnDisabled: { opacity: 0.5 },
  createBtnText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.bg,
  },
  secretCard: {
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldWhisper,
    gap: Spacing.sm,
  },
  secretTitle: {
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  secretCopy: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  secretValue: {
    fontFamily: fonts.medium,
    fontSize: FontSize.caption,
    color: Colors.textPrimary,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  copyText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.caption,
    color: Colors.gold,
  },
  section: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    fontFamily: fonts.semibold,
    fontSize: FontSize.label,
    letterSpacing: 1,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  keyCopy: { flex: 1 },
  keyName: {
    fontFamily: fonts.medium,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  keyMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
});
