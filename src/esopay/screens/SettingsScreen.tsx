import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { ChevronRight, Trash2, X } from 'lucide-react-native';
import { useRouter, type Href } from 'expo-router';
import { signOutUnified } from '@/master/signOutUnified';
import { navigateToProductHome } from '@/lib/navigation/productNavigation';
import { ONBOARDING_ROUTE } from '@/lib/navigation/productRoutes';
import { getDefaultLaunchPreference, setDefaultLaunchPreference } from '@/master/launchPreference';
import { openEsoEnergySupportEmail } from '@/esopay/lib/esoEnergyLinks';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';
import { deleteEsoPayAccount } from '@/esopay/lib/deleteEsoPayAccount';
import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';
import { useEsoPayUserId } from '@/esopay/hooks/useEsoPayUserId';
import { useBeneficiaries } from '@/esopay/hooks/useBeneficiaries';
import { useEsoPayKyc } from '@/esopay/hooks/useEsoPayKyc';
import { EsoPayKycModal } from '@/esopay/components/EsoPayKycModal';
import { ESOPAY_HISTORY_HREF } from '@/esopay/navigation/routes';
import {
  getNotificationPreferences,
  setNotificationPreferences,
  type NotificationPreferences,
} from '@/esopay/storage/notificationPreferences';
import { ConfirmDialog } from '@/components/primitives/AlertDialog';
import {
  ESO_PAY_BG,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { inter } from '@/theme/fonts';
import { useEnodeToast } from '@/providers/EnodeToastProvider';

type ActiveSheet = 'none' | 'beneficiaries';

const APP_VERSION = Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';

function SettingsToggleRow({
  label,
  value,
  onValueChange,
  disabled,
  isLast,
}: {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: 'rgba(255,255,255,0.12)', true: 'rgba(255,255,255,0.28)' }}
        thumbColor={value ? ESO_PAY_TEXT_PRIMARY : 'rgba(245,240,232,0.55)'}
      />
    </View>
  );
}

function SettingsLinkRow({
  label,
  value,
  onPress,
  destructive,
  isLast,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowDivider,
        pressed && onPress && styles.rowPressed,
      ]}
    >
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
      <View style={styles.rowTrailing}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress && !destructive ? (
          <ChevronRight size={16} color={ESO_PAY_TEXT_SECONDARY} strokeWidth={2} />
        ) : null}
      </View>
    </Pressable>
  );
}

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

export function SettingsScreen() {
  const router = useRouter();
  const scrollPad = useEsoPayScrollPadding({ topExtra: 16 });
  const user = useEsoPayAuthStore((s) => s.user);
  const toast = useEnodeToast();
  const { userId } = useEsoPayUserId();
  const host = useEsoPayHost();

  const meta = user?.user_metadata as { full_name?: string } | undefined;
  const name = meta?.full_name ?? user?.email ?? 'ESO User';
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const { allBeneficiaries, remove } = useBeneficiaries();
  const { status: kycStatus, saveKyc, saving: kycSaving } = useEsoPayKyc();
  const identityVerified = Boolean(kycStatus?.bvn_configured || kycStatus?.nin_configured);

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');
  const [kycOpen, setKycOpen] = useState(false);
  const [defaultLaunch, setDefaultLaunch] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    billReminders: true,
    paymentAlerts: true,
    promotionalOffers: false,
  });

  useEffect(() => {
    void getDefaultLaunchPreference().then((pref) => setDefaultLaunch(pref === 'eso_pay'));
  }, []);

  useEffect(() => {
    if (!userId) return;
    void getNotificationPreferences(userId).then(setNotifications);
  }, [userId]);

  const persistNotifications = useCallback(
    async (next: NotificationPreferences) => {
      setNotifications(next);
      if (userId) await setNotificationPreferences(userId, next);
    },
    [userId],
  );

  const handleRemoveBeneficiary = useCallback(
    async (beneficiaryId: string) => {
      await remove(beneficiaryId);
      toast.show('Beneficiary removed', 'info');
    },
    [remove, toast],
  );

  const signOut = useCallback(async () => {
    await signOutUnified();
    router.replace(ONBOARDING_ROUTE as Href);
  }, [router]);

  const handleDeleteAccount = useCallback(async () => {
    if (!userId) return;
    setDeleting(true);
    try {
      const result = await deleteEsoPayAccount(userId, host.companyId || userId);
      if (!result.ok) {
        toast.show(result.error, 'error');
        return;
      }
      toast.show('Account closed on this device', 'success');
      router.replace(ONBOARDING_ROUTE as Href);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }, [host.companyId, router, toast, userId]);

  return (
    <EsoPayScreenShell>
      <ScrollView
        contentContainerStyle={[styles.scroll, scrollPad]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'E'}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {user?.email ?? '—'}
          </Text>
          {identityVerified ? (
            <Text style={styles.verified}>Identity verified</Text>
          ) : null}
        </View>

        <SettingsGroup title="App">
          <SettingsLinkRow
            label="Inverter Monitoring"
            onPress={() => navigateToProductHome(router, 'monitoring')}
          />
          <SettingsToggleRow
            label="Open Eso Pay by default"
            value={defaultLaunch}
            onValueChange={(enabled) => {
              setDefaultLaunch(enabled);
              void setDefaultLaunchPreference(enabled ? 'eso_pay' : null);
            }}
            isLast
          />
        </SettingsGroup>

        <SettingsGroup title="Notifications">
          <SettingsToggleRow
            label="Bill reminders"
            value={notifications.billReminders}
            onValueChange={(billReminders) =>
              void persistNotifications({ ...notifications, billReminders })
            }
          />
          <SettingsToggleRow
            label="Payment alerts"
            value={notifications.paymentAlerts}
            onValueChange={(paymentAlerts) =>
              void persistNotifications({ ...notifications, paymentAlerts })
            }
            isLast
          />
        </SettingsGroup>

        <SettingsGroup title="Payments">
          <SettingsLinkRow
            label="Payment history"
            onPress={() => router.push(ESOPAY_HISTORY_HREF)}
          />
          <SettingsLinkRow
            label="Beneficiaries"
            value={String(allBeneficiaries.length)}
            onPress={() => setActiveSheet('beneficiaries')}
            isLast
          />
        </SettingsGroup>

        <SettingsGroup title="Help">
          <SettingsLinkRow
            label="Report an issue"
            onPress={() => {
              void openEsoEnergySupportEmail().catch(() => {
                toast.show('Could not open email. Contact support@eso-energy.com', 'error');
              });
            }}
            isLast
          />
        </SettingsGroup>

        <SettingsGroup title="Account">
          <SettingsLinkRow
            label={identityVerified ? 'Identity verified' : 'Verify identity'}
            value={identityVerified ? 'Done' : 'BVN / NIN'}
            onPress={() => {
              if (!identityVerified) setKycOpen(true);
            }}
          />
          <SettingsLinkRow label="Sign out" onPress={() => setSignOutOpen(true)} />
          <SettingsLinkRow
            label="Delete account"
            onPress={() => setDeleteOpen(true)}
            destructive
            isLast
          />
        </SettingsGroup>

        <Text style={styles.versionFooter}>Eso Pay · {APP_VERSION}</Text>
      </ScrollView>

      <Modal
        visible={activeSheet !== 'none'}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveSheet('none')}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Beneficiaries</Text>
              <Pressable onPress={() => setActiveSheet('none')} hitSlop={12}>
                <X size={22} color={ESO_PAY_TEXT_SECONDARY} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {allBeneficiaries.length === 0 ? (
                <Text style={styles.emptyCopy}>
                  Beneficiaries appear here after you save one during payment.
                </Text>
              ) : (
                allBeneficiaries.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.beneficiaryRow,
                      index < allBeneficiaries.length - 1 && styles.rowDivider,
                    ]}
                  >
                    <View style={styles.beneficiaryCopy}>
                      <Text style={styles.beneficiaryName}>
                        {item.customerName ?? item.providerName}
                      </Text>
                      <Text style={styles.beneficiaryMeta}>
                        {item.providerName} · {item.accountNumber}
                      </Text>
                    </View>
                    <Pressable onPress={() => void handleRemoveBeneficiary(item.id)} hitSlop={8}>
                      <Trash2 size={18} color={ds.color.error} />
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <EsoPayKycModal
        open={kycOpen}
        onOpenChange={setKycOpen}
        loading={kycSaving}
        onSubmit={saveKyc}
        onSaved={() => {
          toast.show('Identity saved', 'success');
        }}
      />

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out?"
        description="You'll need your email and PIN to sign back in on this device."
        actionLabel="Sign out"
        destructive
        onAction={() => {
          setSignOutOpen(false);
          void signOut();
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Eso Pay account?"
        description="This closes your wallet on this device and signs you out."
        actionLabel={deleting ? 'Deleting…' : 'Delete account'}
        destructive
        onAction={() => void handleDeleteAccount()}
      />
    </EsoPayScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    gap: 22,
    paddingBottom: 28,
  },
  profile: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  avatarText: {
    fontFamily: inter.bold,
    fontSize: 26,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  name: {
    fontFamily: inter.semibold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  email: {
    fontFamily: inter.regular,
    fontSize: 14,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  verified: {
    marginTop: 4,
    fontFamily: inter.medium,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    fontFamily: inter.medium,
    fontSize: 13,
    letterSpacing: -0.1,
    color: ESO_PAY_TEXT_SECONDARY,
    paddingHorizontal: 4,
  },
  groupCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowLabel: {
    flex: 1,
    fontFamily: inter.regular,
    fontSize: 16,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  rowLabelDestructive: {
    color: ds.color.error,
  },
  rowTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontFamily: inter.regular,
    fontSize: 15,
    color: ESO_PAY_TEXT_SECONDARY,
  },
  versionFooter: {
    fontFamily: inter.regular,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
    textAlign: 'center',
    paddingTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: ESO_PAY_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    maxHeight: '82%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  modalTitle: {
    fontFamily: inter.semibold,
    fontSize: 18,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  modalScroll: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  emptyCopy: {
    fontFamily: inter.regular,
    fontSize: 14,
    lineHeight: 20,
    color: ESO_PAY_TEXT_SECONDARY,
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  beneficiaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  beneficiaryCopy: {
    flex: 1,
    gap: 2,
  },
  beneficiaryName: {
    fontFamily: inter.medium,
    fontSize: 15,
    color: ESO_PAY_TEXT_PRIMARY,
  },
  beneficiaryMeta: {
    fontFamily: inter.regular,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
  },
});
