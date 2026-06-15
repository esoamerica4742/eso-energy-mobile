import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getCurrentUser, isMonitoringProfileComplete } from '@/lib/authProfile';
import { hasOperatorPin, OPERATOR_PIN_LENGTH, setOperatorPin } from '@/lib/monitoring/operatorPin';
import { MONITORING_HOME_ROUTE } from '@/lib/navigation/productRoutes';
import { supabase } from '@/lib/supabase';
import { inter } from '@/theme/fonts';
import { AuthPressable } from '@/monitoring/auth/inverter/AuthPressable';
import { monitoringProfileHref } from '@/monitoring/auth/inverter/monitoringAuthRoute';
import { MonitoringTealButton } from '@/monitoring/auth/inverter/MonitoringAuthChrome';
import { PinBoxes } from '@/monitoring/auth/inverter/PinBoxes';
import { setMonitoringPinUnlocked } from '@/monitoring/auth/monitoringPinSession';
import { INVERTER_AUTH } from '@/monitoring/auth/inverter/tokens';
import { useAuthStore } from '@/stores/authStore';

export default function InverterCreatePinScreen() {
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const confirmLockOpacity = useSharedValue(0.4);
  const shake = useSharedValue(0);

  const chooseComplete = pin.length === OPERATOR_PIN_LENGTH;
  const confirmComplete = confirmPin.length === OPERATOR_PIN_LENGTH;
  const pinsMatch = chooseComplete && confirmComplete && pin === confirmPin;
  const showMismatch = chooseComplete && confirmComplete && pin !== confirmPin;

  useEffect(() => {
    if (!user?.id) return;
    void (async () => {
      const localPin = await hasOperatorPin(user.id);
      if (localPin || isReturningMonitoringUser(user)) {
        router.replace('/inverter/unlock');
        return;
      }
      // Profile saved but first PIN not set yet — stay on create-pin.
      if (!isMonitoringProfileComplete(user)) {
        router.replace(monitoringProfileHref(user));
      }
    })();
  }, [user]);

  useEffect(() => {
    confirmLockOpacity.value = withTiming(chooseComplete ? 1 : 0.4, { duration: 200 });
    if (!chooseComplete) {
      setConfirmPin('');
      setMismatch(false);
      if (error === "PINs don't match") setError('');
    }
  }, [chooseComplete, confirmLockOpacity, error]);

  const confirmSectionStyle = useAnimatedStyle(() => ({
    opacity: confirmLockOpacity.value,
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const triggerShake = useCallback(() => {
    shake.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [shake]);

  useEffect(() => {
    if (showMismatch) {
      setMismatch(true);
      setError("PINs don't match");
    } else if (error === "PINs don't match") {
      setMismatch(false);
      setError('');
    }
  }, [showMismatch, error]);

  const handleSetPin = useCallback(async () => {
    if (!pinsMatch || saving) return;
    setSaving(true);
    setError('');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const activeUser = user ?? (await getCurrentUser());
      const userId = activeUser?.id;
      if (!userId) {
        throw new Error('Sign in to configure your operator PIN');
      }

      await setOperatorPin(userId, pin);

      const { data: updated, error: updateError } = await supabase.auth.updateUser({
        data: { hasPin: true },
      });
      if (updateError) {
        console.error('Failed to save PIN flag:', updateError);
        throw new Error(updateError.message);
      }

      if (updated.user) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setSession({
            ...sessionData.session,
            user: updated.user,
          });
        }
      }

      setMonitoringPinUnlocked(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(MONITORING_HOME_ROUTE);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your PIN.');
      setConfirmPin('');
      setMismatch(true);
      triggerShake();
    } finally {
      setSaving(false);
    }
  }, [pin, pinsMatch, saving, setSession, triggerShake, user]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.kav} behavior="padding" keyboardVerticalOffset={0}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <AuthPressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
              <Ionicons name="arrow-back" size={24} color={INVERTER_AUTH.TEAL} />
            </AuthPressable>
            <Text style={styles.stepCounter}>4 of 4</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={[styles.progressSegment, styles.progressActive]} />
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.top}>
            <View style={styles.iconWrapper}>
              <Ionicons name="shield-checkmark" size={32} color={INVERTER_AUTH.TEAL} />
            </View>
            <Text style={styles.h1}>Create your PIN.</Text>
            <Text style={styles.subtext}>
              You&apos;ll enter this every time you open Inverter Monitoring.
            </Text>

            <Text style={styles.label}>CHOOSE A 4-DIGIT PIN</Text>
            <PinBoxes
              value={pin}
              length={OPERATOR_PIN_LENGTH}
              variant="create"
              onChange={setPin}
            />

            <Animated.View style={[styles.confirmSection, confirmSectionStyle]}>
              <Text style={styles.label}>CONFIRM YOUR PIN</Text>
              <PinBoxes
                value={confirmPin}
                length={OPERATOR_PIN_LENGTH}
                variant="create"
                disabled={!chooseComplete}
                onChange={(v) => {
                  setConfirmPin(v);
                  if (mismatch) setMismatch(false);
                }}
                shakeStyle={shakeStyle}
                error={mismatch}
              />
              {showMismatch ? (
                <Text style={styles.mismatchError}>PINs don&apos;t match</Text>
              ) : null}
            </Animated.View>

            {error && error !== "PINs don't match" ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}
          </View>

          <View style={styles.bottom}>
            <MonitoringTealButton
              label="Set PIN →"
              onPress={() => void handleSetPin()}
              active={pinsMatch}
              disabled={!pinsMatch}
              loading={saving}
            />
            <View style={styles.securityNote}>
              <Ionicons name="lock-closed" size={13} color={INVERTER_AUTH.TEAL} />
              <Text style={styles.securityNoteText}>Your PIN never leaves this device.</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: INVERTER_AUTH.BG_PRIMARY,
  },
  kav: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: INVERTER_AUTH.BG_PRIMARY,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepCounter: {
    color: INVERTER_AUTH.TEAL,
    fontFamily: inter.semibold,
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: INVERTER_AUTH.BORDER_DEFAULT,
  },
  progressActive: {
    backgroundColor: INVERTER_AUTH.TEAL,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
    minHeight: 0,
  },
  top: {
    gap: 10,
    paddingTop: 16,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: INVERTER_AUTH.TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  confirmSection: {
    marginTop: 24,
    gap: 0,
  },
  bottom: {
    gap: 12,
    marginTop: 24,
  },
  h1: {
    color: INVERTER_AUTH.TEXT_PRIMARY,
    fontFamily: inter.bold,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  subtext: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.semibold,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  mismatchError: {
    color: INVERTER_AUTH.ERROR_MISMATCH,
    fontFamily: inter.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  error: {
    color: INVERTER_AUTH.ERROR,
    fontFamily: inter.regular,
    fontSize: 13,
    textAlign: 'center',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  securityNoteText: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontFamily: inter.regular,
    fontSize: 12,
  },
});
