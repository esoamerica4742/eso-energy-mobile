import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { OtpBox } from '@/components/OtpBox';
import { sendEmailOtp, verifyEmailOtp } from '@/lib/authOtp';
import { establishUnifiedSession } from '@/master/unifiedSession';

type Props = {
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerified: () => void;
};

export function MasterOtpOverlay({ visible, email, onClose, onVerified }: Props) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) {
      setCode('');
      setError(null);
      setBusy(false);
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, [visible]);

  const verify = useCallback(
    async (token: string) => {
      setBusy(true);
      setError(null);
      const result = await verifyEmailOtp(email, token);
      if (!result.ok) {
        setError(result.error);
        setBusy(false);
        return;
      }
      await establishUnifiedSession(result.session);
      setBusy(false);
      onVerified();
    },
    [email, onVerified],
  );

  useEffect(() => {
    if (code.length === 6) void verify(code);
  }, [code, verify]);

  const resend = useCallback(async () => {
    setError(null);
    setBusy(true);
    const result = await sendEmailOtp(email);
    setBusy(false);
    if (!result.ok) setError(result.error);
  }, [email]);

  const digits = Array.from({ length: 6 }, (_, i) => code[i] ?? '');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/70">
        <View
          className="rounded-t-3xl bg-[#0D1018] px-6 pt-5"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-white">Verify your email</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <X size={22} color="#8A94A6" />
            </Pressable>
          </View>

          <Text className="mb-6 text-sm leading-5 text-[#8A94A6]">
            Enter the 6-digit code we sent to{'\n'}
            <Text className="font-semibold text-white">{email}</Text>
          </Text>

          <Pressable onPress={() => inputRef.current?.focus()}>
            <View className="mb-4 flex-row justify-between gap-2">
              {digits.map((char, index) => (
                <OtpBox
                  key={index}
                  char={char}
                  focused={code.length === index}
                  filled={Boolean(char)}
                  error={Boolean(error)}
                  variant="esopay"
                />
              ))}
            </View>
          </Pressable>

          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            className="absolute h-px w-px opacity-0"
          />

          {error ? <Text className="mb-3 text-sm text-red-400">{error}</Text> : null}

          {busy ? (
            <ActivityIndicator color="#C9A84C" className="my-3" />
          ) : (
            <Pressable onPress={() => void resend()} className="py-3">
              <Text className="text-center text-sm font-semibold text-[#C9A84C]">
                Resend code
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}
