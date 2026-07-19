import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  InteractionManager,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { OtpBox } from '@/components/OtpBox';
import { sendEmailOtp, verifyEmailOtp } from '@/lib/authOtp';
import { establishUnifiedSession } from '@/master/unifiedSession';
import { inter } from '@/theme/fonts';

const TEXT = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.55)';
const ERROR = '#FF6B6B';

type Props = {
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerified: () => void;
};

const RESEND_SECONDS = 60;
const KEYBOARD_LIFT_EXTRA = 32;

export function MasterOtpOverlay({ visible, email, onClose, onVerified }: Props) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wantsKeyboardRef = useRef(true);

  const canResend = resendSeconds <= 0;
  const resendLabel = `Resend code in 0:${String(resendSeconds).padStart(2, '0')}`;

  const scheduleFocus = useCallback(
    (delay = 120) => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      focusTimerRef.current = setTimeout(() => {
        if (!wantsKeyboardRef.current || verifying) return;
        const input = inputRef.current;
        if (!input) return;
        input.blur();
        requestAnimationFrame(() => {
          input.focus();
        });
      }, delay);
    },
    [verifying],
  );

  const focusInput = useCallback(() => {
    wantsKeyboardRef.current = true;
    scheduleFocus(Platform.OS === 'android' ? 80 : 40);
  }, [scheduleFocus]);

  const dismissKeyboard = useCallback(() => {
    wantsKeyboardRef.current = false;
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    inputRef.current?.blur();
    Keyboard.dismiss();
    setKeyboardHeight(0);
  }, []);

  useEffect(() => {
    if (!visible) {
      wantsKeyboardRef.current = false;
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      setCode('');
      setError(null);
      setVerifying(false);
      setResending(false);
      setKeyboardHeight(0);
      setResendSeconds(RESEND_SECONDS);
      return;
    }

    wantsKeyboardRef.current = true;
    setResendSeconds(RESEND_SECONDS);
    let cancelled = false;

    const task = InteractionManager.runAfterInteractions(() => {
      if (!cancelled) scheduleFocus(160);
    });

    return () => {
      cancelled = true;
      task.cancel();
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, [visible, scheduleFocus]);

  useEffect(() => {
    if (!visible) return;

    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background' || next === 'inactive') {
        dismissKeyboard();
        return;
      }

      if (next === 'active') {
        wantsKeyboardRef.current = true;
        scheduleFocus(Platform.OS === 'android' ? 320 : 220);
      }
    });

    return () => sub.remove();
  }, [visible, dismissKeyboard, scheduleFocus]);

  useEffect(() => {
    if (!visible || resendSeconds <= 0) return;
    const id = setInterval(() => setResendSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [visible, resendSeconds]);

  useEffect(() => {
    if (!visible) return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [visible]);

  const verify = useCallback(
    async (token: string) => {
      setVerifying(true);
      setError(null);
      const result = await verifyEmailOtp(email, token);
      if (!result.ok) {
        setError(result.error);
        setVerifying(false);
        setCode('');
        focusInput();
        return;
      }
      await establishUnifiedSession(result.session);
      setVerifying(false);
      onVerified();
    },
    [email, focusInput, onVerified],
  );

  useEffect(() => {
    if (code.length === 6) void verify(code);
  }, [code, verify]);

  const resend = useCallback(async () => {
    if (!canResend || resending || verifying) return;

    setError(null);
    setResending(true);
    const result = await sendEmailOtp(email);
    setResending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setCode('');
    setResendSeconds(RESEND_SECONDS);
    focusInput();
  }, [canResend, email, focusInput, resending, verifying]);

  const digits = Array.from({ length: 6 }, (_, i) => code[i] ?? '');
  const sheetLift =
    keyboardHeight > 0 ? Math.max(0, keyboardHeight - insets.bottom + KEYBOARD_LIFT_EXTRA) : 0;
  const sheetPaddingBottom = keyboardHeight > 0 ? 16 : insets.bottom + 24;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onShow={() => {
        wantsKeyboardRef.current = true;
        scheduleFocus(180);
      }}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close verification"
        />

        <Animated.View
          entering={FadeInDown.duration(320).springify()}
          style={[
            styles.sheet,
            {
              paddingBottom: sheetPaddingBottom,
              marginBottom: sheetLift,
            },
          ]}
        >
          <View style={[StyleSheet.absoluteFill, styles.sheetFill]} />
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Enter code</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={20} color={MUTED} strokeWidth={2.2} />
            </Pressable>
          </View>

          <Text style={styles.sheetCopy}>
            Enter the 6-digit code we sent to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.otpSection}>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={6}
              textContentType="oneTimeCode"
              autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
              importantForAutofill="yes"
              autoFocus
              showSoftInputOnFocus
              caretHidden
              autoCorrect={false}
              autoCapitalize="none"
              editable={!verifying}
              pointerEvents="none"
              style={styles.hiddenInput}
            />

            <Pressable
              onPress={focusInput}
              style={styles.otpPressArea}
              accessibilityRole="button"
              accessibilityLabel="Enter code"
            >
              <View style={styles.otpRow} pointerEvents="none">
                {digits.map((char, index) => (
                  <OtpBox
                    key={index}
                    char={char}
                    focused={code.length === index}
                    filled={Boolean(char)}
                    error={Boolean(error)}
                    variant="master"
                  />
                ))}
              </View>
            </Pressable>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {verifying ? <ActivityIndicator color="#FFFFFF" style={styles.loader} /> : null}

          {canResend ? (
            <Pressable
              onPress={() => void resend()}
              disabled={resending || verifying}
              style={({ pressed }) => [
                styles.resendBtn,
                (resending || verifying) && styles.resendBtnDisabled,
                pressed && !resending && !verifying && styles.resendBtnPressed,
              ]}
            >
              <Text style={styles.resendText}>{resending ? 'Sending…' : 'Resend code'}</Text>
            </Pressable>
          ) : (
            <View style={styles.resendTimerWrap}>
              <Text style={styles.resendTimerText}>{resendLabel}</Text>
            </View>
          )}

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: '#0A0A0A',
  },
  sheetFill: {
    backgroundColor: '#0A0A0A',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 22,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontFamily: inter.bold,
    fontSize: 28,
    letterSpacing: -0.6,
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  closeBtnPressed: {
    opacity: 0.75,
  },
  sheetCopy: {
    fontFamily: inter.regular,
    fontSize: 14,
    lineHeight: 21,
    color: MUTED,
    marginBottom: 20,
  },
  emailHighlight: {
    fontFamily: inter.semibold,
    color: TEXT,
  },
  otpSection: {
    position: 'relative',
    marginBottom: 20,
    minHeight: 56,
  },
  otpPressArea: {
    width: '100%',
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 4,
    fontFamily: inter.medium,
    fontSize: 14,
    color: ERROR,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 14,
  },
  resendBtn: {
    marginTop: 4,
    paddingVertical: 15,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: '#2C2C2E',
  },
  resendBtnPressed: {
    opacity: 0.82,
  },
  resendBtnDisabled: {
    opacity: 0.55,
  },
  resendText: {
    fontFamily: inter.semibold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  resendTimerWrap: {
    marginTop: 4,
    paddingVertical: 15,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendTimerText: {
    fontFamily: inter.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.2,
  },
});
