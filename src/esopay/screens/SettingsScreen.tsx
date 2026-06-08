import { useCallback, useEffect, useState } from 'react';

import {

  Modal,

  Pressable,

  ScrollView,

  StyleSheet,

  Switch,

  Text,

  View,

} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import Constants from 'expo-constants';

import {

  Bell,

  ChevronRight,

  Fingerprint,

  HelpCircle,

  KeyRound,

  MessageCircle,

  Receipt,

  Shield,

  Trash2,

  User,

  X,

} from 'lucide-react-native';

import { useRouter } from 'expo-router';

import { useEsoPayAuthStore } from '@/esopay/auth/store';

import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';

import { EsoPayTransactionPinModal } from '@/esopay/components/EsoPayTransactionPinModal';
import { EsoPayLoginPinModal } from '@/esopay/components/EsoPayLoginPinModal';

import { useBiometricPin } from '@/esopay/hooks/useBiometricPin';

import { useEsoPayScrollPadding } from '@/esopay/hooks/useEsoPayScrollPadding';

import { useEsoPayUserId } from '@/esopay/hooks/useEsoPayUserId';

import { useBeneficiaries } from '@/esopay/hooks/useBeneficiaries';

import { useTransactionPin } from '@/esopay/hooks/useTransactionPin';
import { useLoginPin } from '@/esopay/hooks/useLoginPin';

import { ESOPAY_HISTORY_HREF } from '@/esopay/navigation/routes';

import {

  getNotificationPreferences,

  setNotificationPreferences,

  type NotificationPreferences,

} from '@/esopay/storage/notificationPreferences';

import { colors } from '@/esopay/theme/colors';

import { luxury } from '@/esopay/theme/luxury';

import { spacing } from '@/esopay/theme/spacing';

import { fonts } from '@/esopay/theme/typography';

import { Colors, FontSize } from '@/tokens/design';

import { fonts as appFonts } from '@/theme/tokens';

import { useEnodeToast } from '@/providers/EnodeToastProvider';



type ActiveSheet = 'none' | 'beneficiaries';



const APP_VERSION =

  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';



function SettingsToggleRow({

  icon: Icon,

  label,

  description,

  value,

  onValueChange,

  disabled,

}: {

  icon: typeof Bell;

  label: string;

  description?: string;

  value: boolean;

  onValueChange: (next: boolean) => void;

  disabled?: boolean;

}) {

  return (

    <View style={styles.toggleRow}>

      <View style={styles.rowIconWrap}>

        <Icon size={18} color={colors.gold} strokeWidth={2} />

      </View>

      <View style={styles.rowCopy}>

        <Text style={styles.rowLabel}>{label}</Text>

        {description ? <Text style={styles.rowMeta}>{description}</Text> : null}

      </View>

      <Switch

        value={value}

        onValueChange={onValueChange}

        disabled={disabled}

        trackColor={{ false: colors.surface2, true: colors.goldGlow }}

        thumbColor={value ? colors.gold : colors.muted}

      />

    </View>

  );

}



function SettingsLinkRow({

  icon: Icon,

  label,

  meta,

  onPress,

  disabled,

}: {

  icon: typeof Bell;

  label: string;

  meta?: string;

  onPress?: () => void;

  disabled?: boolean;

}) {

  return (

    <Pressable

      onPress={onPress}

      disabled={disabled || !onPress}

      style={({ pressed }) => [styles.linkRow, pressed && onPress && styles.rowPressed]}

    >

      <View style={styles.rowIconWrap}>

        <Icon size={18} color={colors.gold} strokeWidth={2} />

      </View>

      <View style={styles.rowCopy}>

        <Text style={styles.rowLabel}>{label}</Text>

        {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}

      </View>

      {onPress ? <ChevronRight size={16} color={colors.muted} /> : null}

    </Pressable>

  );

}



export function SettingsScreen() {

  const router = useRouter();

  const scrollPad = useEsoPayScrollPadding({ topExtra: spacing.md });

  const user = useEsoPayAuthStore((s) => s.user);

  const toast = useEnodeToast();

  const { userId } = useEsoPayUserId();



  const meta = user?.user_metadata as { full_name?: string } | undefined;

  const name = meta?.full_name ?? user?.email ?? 'ESO User';

  const initials = name

    .split(/\s+/)

    .slice(0, 2)

    .map((part) => part[0]?.toUpperCase() ?? '')

    .join('');



  const { allBeneficiaries, remove } = useBeneficiaries();

  const { pinConfigured, isChecking: pinChecking, configurePin, userIdReady } = useTransactionPin();
  const {
    pinConfigured: loginPinConfigured,
    isChecking: loginPinChecking,
    configurePin: configureLoginPin,
    clearPin: clearLoginPin,
    userIdReady: loginPinReady,
  } = useLoginPin();

  const {

    available: biometricAvailable,

    enabled: biometricEnabled,

    label: biometricLabel,

    loading: biometricLoading,

    setPreference: setBiometricPreference,

  } = useBiometricPin();



  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');

  const [pinOpen, setPinOpen] = useState(false);
  const [loginPinOpen, setLoginPinOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationPreferences>({

    billReminders: true,

    paymentAlerts: true,

    promotionalOffers: false,

  });



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



  const openPinSheet = useCallback(() => {

    if (!userIdReady) {

      toast.show('Still loading your account — try again in a moment', 'info');

      return;

    }

    setPinOpen(true);

  }, [toast, userIdReady]);

  const openLoginPinSheet = useCallback(() => {
    if (!loginPinReady) {
      toast.show('Still loading your account — try again in a moment', 'info');
      return;
    }
    setLoginPinOpen(true);
  }, [loginPinReady, toast]);



  const handleRemoveBeneficiary = useCallback(

    async (beneficiaryId: string) => {

      await remove(beneficiaryId);

      toast.show('Beneficiary removed', 'info');

    },

    [remove, toast],

  );



  const handleBiometricToggle = useCallback(

    async (next: boolean) => {

      if (!pinConfigured) {

        toast.show('Set up your transaction PIN first', 'info');

        return;

      }

      const ok = await setBiometricPreference(next);

      if (ok) {

        toast.show(next ? `${biometricLabel} enabled for payments` : `${biometricLabel} disabled`, 'success');

      }

    },

    [biometricLabel, pinConfigured, setBiometricPreference, toast],

  );



  return (

    <EsoPayScreenShell>

      <ScrollView

        contentContainerStyle={[styles.scroll, scrollPad]}

        showsVerticalScrollIndicator={false}

      >

        <Text style={styles.title}>Settings</Text>



        <LinearGradient

          colors={['rgba(201,168,76,0.22)', 'rgba(13,15,23,0.98)']}

          start={{ x: 0, y: 0 }}

          end={{ x: 1, y: 1 }}

          style={styles.profileHero}

        >

          <View style={styles.avatar}>

            <Text style={styles.avatarText}>{initials || 'E'}</Text>

          </View>

          <View style={styles.profileCopy}>

            <Text style={styles.name}>{name}</Text>

            <Text style={styles.email}>{user?.email ?? '—'}</Text>

            <View style={styles.profileBadge}>

              <Shield size={12} color={luxury.gold} strokeWidth={2.2} />

              <Text style={styles.profileBadgeText}>Verified Eso Pay account</Text>

            </View>

          </View>

        </LinearGradient>



        <View style={styles.section}>

          <Text style={styles.sectionTitle}>Security</Text>

          <SettingsLinkRow

            icon={KeyRound}

            label={pinConfigured ? 'Transaction PIN' : 'Set up transaction PIN'}

            meta={pinChecking ? 'Checking…' : pinConfigured ? 'Configured' : 'Required for payments'}

            onPress={openPinSheet}

          />

          <SettingsLinkRow
            icon={KeyRound}
            label={loginPinConfigured ? 'Login PIN' : 'Set up login PIN'}
            meta={
              loginPinChecking ? 'Checking…' : loginPinConfigured ? 'Enabled (device lock)' : 'Optional'
            }
            onPress={openLoginPinSheet}
          />

          <SettingsToggleRow

            icon={Fingerprint}

            label={`${biometricLabel} for payments`}

            description={

              biometricAvailable

                ? 'Authorize bill payments without typing your PIN'

                : 'Not available on this device'

            }

            value={biometricEnabled}

            onValueChange={(next) => void handleBiometricToggle(next)}

            disabled={!biometricAvailable || biometricLoading || !pinConfigured}

          />

          <SettingsLinkRow

            icon={Shield}

            label="Two-factor authentication"

            meta="Coming soon"

            disabled

          />

        </View>



        <View style={styles.section}>

          <Text style={styles.sectionTitle}>Notifications</Text>

          <SettingsToggleRow

            icon={Bell}

            label="Bill reminders"

            description="Due dates and overdue alerts"

            value={notifications.billReminders}

            onValueChange={(billReminders) =>

              void persistNotifications({ ...notifications, billReminders })

            }

          />

          <SettingsToggleRow

            icon={Receipt}

            label="Payment alerts"

            description="Successful debits and wallet credits"

            value={notifications.paymentAlerts}

            onValueChange={(paymentAlerts) =>

              void persistNotifications({ ...notifications, paymentAlerts })

            }

          />

          <SettingsToggleRow

            icon={MessageCircle}

            label="Offers & tips"

            description="Product updates and savings tips"

            value={notifications.promotionalOffers}

            onValueChange={(promotionalOffers) =>

              void persistNotifications({ ...notifications, promotionalOffers })

            }

          />

        </View>



        <View style={styles.section}>

          <Text style={styles.sectionTitle}>Payments</Text>

          <SettingsLinkRow

            icon={Receipt}

            label="Payment history"

            onPress={() => router.push(ESOPAY_HISTORY_HREF)}

          />

          <SettingsLinkRow

            icon={User}

            label="Saved beneficiaries"

            meta={`${allBeneficiaries.length} saved`}

            onPress={() => setActiveSheet('beneficiaries')}

          />

        </View>



        <View style={styles.section}>

          <Text style={styles.sectionTitle}>Support</Text>

          <SettingsLinkRow icon={HelpCircle} label="Help center" meta="FAQ & guides" disabled />

          <SettingsLinkRow icon={MessageCircle} label="Live chat" meta="24/7 support" disabled />

          <SettingsLinkRow icon={Bell} label="Report an issue" disabled />

        </View>



        <View style={styles.section}>

          <Text style={styles.sectionTitle}>About</Text>

          <SettingsLinkRow icon={Shield} label={`Eso Pay v${APP_VERSION}`} />

          <SettingsLinkRow icon={HelpCircle} label="Terms of Service" disabled />

          <SettingsLinkRow icon={Shield} label="Privacy Policy" disabled />

        </View>

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

              <Text style={styles.modalTitle}>Saved beneficiaries</Text>

              <Pressable onPress={() => setActiveSheet('none')} hitSlop={12}>

                <X size={22} color={colors.muted} />

              </Pressable>

            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>

              {allBeneficiaries.length === 0 ? (

                <Text style={styles.emptyCopy}>

                  Saved beneficiaries appear here after you pay with “Save beneficiary” enabled.

                </Text>

              ) : (

                allBeneficiaries.map((item) => (

                  <View key={item.id} style={styles.beneficiaryRow}>

                    <View style={styles.beneficiaryCopy}>

                      <Text style={styles.beneficiaryName}>

                        {item.customerName ?? item.providerName}

                      </Text>

                      <Text style={styles.beneficiaryMeta}>

                        {item.providerName} · {item.accountNumber}

                      </Text>

                    </View>

                    <Pressable onPress={() => void handleRemoveBeneficiary(item.id)} hitSlop={8}>

                      <Trash2 size={18} color={colors.danger} />

                    </Pressable>

                  </View>

                ))

              )}

            </ScrollView>

          </View>

        </View>

      </Modal>



      <EsoPayTransactionPinModal

        open={pinOpen}

        onOpenChange={setPinOpen}

        pinConfigured={pinConfigured}

        onSave={async (pin) => {

          await configurePin(pin);

          toast.show(pinConfigured ? 'Transaction PIN updated' : 'Transaction PIN created', 'success');

        }}

      />

      <EsoPayLoginPinModal
        open={loginPinOpen}
        onOpenChange={setLoginPinOpen}
        pinConfigured={loginPinConfigured}
        onSave={async (pin) => {
          await configureLoginPin(pin);
          toast.show(loginPinConfigured ? 'Login PIN updated' : 'Login PIN enabled', 'success');
        }}
        onClear={async () => {
          await clearLoginPin();
          toast.show('Login PIN removed', 'info');
        }}
      />

    </EsoPayScreenShell>

  );

}



const styles = StyleSheet.create({

  scroll: {

    paddingHorizontal: spacing.lg,

    gap: spacing.lg,

  },

  title: {

    fontFamily: appFonts.bold,

    fontSize: FontSize.title,

    color: Colors.textPrimary,

  },

  profileHero: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.lg,

    borderRadius: 20,

    borderWidth: 1,

    borderColor: colors.goldBorder,

    padding: spacing.lg,

    overflow: 'hidden',

  },

  avatar: {

    width: 64,

    height: 64,

    borderRadius: 32,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: colors.goldDim,

    borderWidth: 2,

    borderColor: 'rgba(255,255,255,0.08)',

  },

  avatarText: {

    fontFamily: fonts.display,

    fontSize: 24,

    color: colors.black,

  },

  profileCopy: {

    flex: 1,

    gap: 4,

  },

  name: {

    fontFamily: fonts.uiMedium,

    fontSize: 18,

    color: colors.white,

  },

  email: {

    fontFamily: fonts.ui,

    fontSize: 13,

    color: colors.muted,

  },

  profileBadge: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,

    marginTop: spacing.sm,

    alignSelf: 'flex-start',

    paddingHorizontal: 10,

    paddingVertical: 4,

    borderRadius: 999,

    backgroundColor: 'rgba(212,175,55,0.12)',

  },

  profileBadgeText: {

    fontFamily: fonts.uiMedium,

    fontSize: 11,

    color: luxury.gold,

    letterSpacing: 0.2,

  },

  section: {

    backgroundColor: colors.surface,

    borderRadius: 16,

    borderWidth: 1,

    borderColor: colors.goldBorder,

    overflow: 'hidden',

  },

  sectionTitle: {

    fontFamily: fonts.uiMedium,

    fontSize: 11,

    letterSpacing: 1.2,

    color: colors.gold,

    textTransform: 'uppercase',

    paddingHorizontal: spacing.lg,

    paddingTop: spacing.lg,

    paddingBottom: spacing.sm,

  },

  linkRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.md,

    paddingHorizontal: spacing.lg,

    paddingVertical: 14,

    borderTopWidth: StyleSheet.hairlineWidth,

    borderTopColor: colors.goldBorder,

  },

  toggleRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.md,

    paddingHorizontal: spacing.lg,

    paddingVertical: 14,

    borderTopWidth: StyleSheet.hairlineWidth,

    borderTopColor: colors.goldBorder,

  },

  rowPressed: {

    backgroundColor: 'rgba(255,255,255,0.03)',

  },

  rowIconWrap: {

    width: 36,

    height: 36,

    borderRadius: 10,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: 'rgba(212,175,55,0.1)',

  },

  rowCopy: {

    flex: 1,

    gap: 2,

  },

  rowLabel: {

    fontFamily: fonts.ui,

    fontSize: 14,

    color: colors.white,

  },

  rowMeta: {

    fontFamily: fonts.ui,

    fontSize: 12,

    color: colors.muted,

  },

  modalBackdrop: {

    flex: 1,

    backgroundColor: 'rgba(0,0,0,0.72)',

    justifyContent: 'flex-end',

  },

  modalCard: {

    backgroundColor: colors.surface,

    borderTopLeftRadius: 24,

    borderTopRightRadius: 24,

    borderWidth: 1,

    borderColor: colors.goldBorder,

    maxHeight: '82%',

    paddingBottom: spacing.xxxl,

  },

  modalHeader: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingHorizontal: spacing.screen,

    paddingTop: spacing.lg,

    paddingBottom: spacing.md,

  },

  modalTitle: {

    fontFamily: fonts.display,

    fontSize: 24,

    color: colors.white,

  },

  modalScroll: {

    paddingHorizontal: spacing.screen,

    paddingBottom: spacing.xl,

    gap: spacing.sm,

  },

  emptyCopy: {

    fontFamily: fonts.ui,

    fontSize: 14,

    lineHeight: 20,

    color: colors.muted,

    paddingVertical: spacing.lg,

  },

  beneficiaryRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.md,

    backgroundColor: colors.surface2,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: colors.goldBorder,

    padding: spacing.lg,

  },

  beneficiaryCopy: {

    flex: 1,

    gap: 4,

  },

  beneficiaryName: {

    fontFamily: fonts.uiMedium,

    fontSize: 15,

    color: colors.white,

  },

  beneficiaryMeta: {

    fontFamily: fonts.ui,

    fontSize: 12,

    color: colors.muted,

  },

});


