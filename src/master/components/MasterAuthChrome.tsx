import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { inter } from '@/theme/fonts';

export const AUTH = {
  bg: '#000000',
  /** Revolut top wash — deep navy into black. */
  topNavy: '#0C1730',
  topMid: '#081222',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.62)',
  placeholder: 'rgba(255,255,255,0.32)',
  link: '#4DA3FF',
  error: '#FF6B6B',
  disabledBtn: '#2C2C2E',
  disabledText: 'rgba(255,255,255,0.28)',
} as const;

const PRESS_SPRING = { stiffness: 340, damping: 24 };
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ShellProps = {
  children: ReactNode;
  onBack?: () => void;
};

export function MasterAuthShell({ children, onBack }: ShellProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={AUTH.topNavy} />
      {/* Revolut create-account wash: deep navy holds longer, then fades to black. */}
      <LinearGradient
        pointerEvents="none"
        colors={[AUTH.topNavy, AUTH.topMid, '#02040A', AUTH.bg]}
        locations={[0, 0.38, 0.72, 1]}
        style={styles.glow}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
          <Pressable
            onPress={onBack ?? (() => router.back())}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ChevronLeft size={22} color={AUTH.text} strokeWidth={2.4} />
          </Pressable>
        </View>

        <Animated.View entering={FadeIn.duration(220)} style={styles.body}>
          {children}
        </Animated.View>

        <View style={{ height: Math.max(insets.bottom, 12) }} />
      </KeyboardAvoidingView>
    </View>
  );
}

type ContinueProps = {
  disabled: boolean;
  busy?: boolean;
  onPress: () => void;
  label?: string;
};

export function MasterAuthContinue({
  disabled,
  busy,
  onPress,
  label = 'Continue',
}: ContinueProps) {
  const scale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const canPress = !disabled && !busy;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={!canPress}
      onPressIn={() => {
        if (canPress) scale.value = withSpring(0.97, PRESS_SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, PRESS_SPRING);
      }}
      style={[styles.continueBtn, !canPress && styles.continueBtnDisabled, btnStyle]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.continueText, !canPress && styles.continueTextDisabled]}>
        {busy ? 'Please wait…' : label}
      </Text>
    </AnimatedPressable>
  );
}

type LinkProps = {
  label: string;
  onPress: () => void;
};

export function MasterAuthLink({ label, onPress }: LinkProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.linkHit, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

type ActionsProps = {
  linkLabel: string;
  onLinkPress: () => void;
  continueDisabled: boolean;
  continueBusy?: boolean;
  onContinue: () => void;
  continueLabel?: string;
};

/**
 * Revolut-style block: [fields] → breathing room → account link → Continue.
 * Keeps the blue link clearly between the form and the CTA.
 */
export function MasterAuthActions({
  linkLabel,
  onLinkPress,
  continueDisabled,
  continueBusy,
  onContinue,
  continueLabel,
}: ActionsProps) {
  return (
    <View style={styles.actionsBlock}>
      <MasterAuthLink label={linkLabel} onPress={onLinkPress} />
      <MasterAuthContinue
        disabled={continueDisabled}
        busy={continueBusy}
        onPress={onContinue}
        label={continueLabel}
      />
    </View>
  );
}

export const authType = StyleSheet.create({
  title: {
    fontFamily: inter.bold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.7,
    color: AUTH.text,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: inter.regular,
    fontSize: 15,
    lineHeight: 22,
    color: AUTH.muted,
    marginBottom: 32,
    maxWidth: 340,
  },
  error: {
    marginTop: 12,
    fontFamily: inter.regular,
    fontSize: 14,
    lineHeight: 20,
    color: AUTH.error,
  },
  fieldStack: {
    gap: 14,
  },
  pill: {
    backgroundColor: AUTH.surface,
    borderRadius: 22,
    height: 56,
    paddingHorizontal: 18,
    justifyContent: 'center' as const,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  pillFocused: {
    borderColor: 'rgba(255,255,255,0.22)',
  },
  input: {
    fontFamily: inter.regular,
    fontSize: 16,
    color: AUTH.text,
    padding: 0,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AUTH.bg,
  },
  flex: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '72%',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  /** Gap from last field → link sits mid-band before Continue. */
  actionsBlock: {
    marginTop: 56,
  },
  continueBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: AUTH.text,
    alignItems: 'center',
    justifyContent: 'center',
    /** Space below account link — Revolut mid-band. */
    marginTop: 28,
  },
  continueBtnDisabled: {
    backgroundColor: AUTH.disabledBtn,
  },
  continueText: {
    fontFamily: inter.semibold,
    fontSize: 16,
    color: '#000000',
  },
  continueTextDisabled: {
    color: AUTH.disabledText,
  },
  linkHit: {
    alignSelf: 'flex-start',
    marginTop: 0,
    paddingVertical: 6,
    minHeight: 36,
    justifyContent: 'center',
  },
  link: {
    fontFamily: inter.regular,
    fontSize: 15,
    lineHeight: 20,
    color: AUTH.link,
  },
  pressed: {
    opacity: 0.72,
  },
});
