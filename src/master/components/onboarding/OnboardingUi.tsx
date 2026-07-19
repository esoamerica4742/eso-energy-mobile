import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ShieldCheck, Zap, type LucideIcon } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { inter } from '@/theme/fonts';
import { OB, OB_LANDING, OB_RADIUS, OB_SPACE, OB_TYPE } from '@/master/components/onboarding/theme';
import { ECO_BUTTON, ECO_GLOW, ECO_MOTION } from '@/theme/ecosystem';

const ENTRANCE = (delay: number) =>
  FadeInDown.delay(delay).duration(ECO_MOTION.durationSlow).springify().damping(ECO_MOTION.spring.damping);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function OnboardingBackdrop() {
  return (
    <>
      <LinearGradient
        colors={[OB.bg, OB.bgMid, OB.bgDeep, '#080B12']}
        locations={[0, 0.32, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(12,23,48,0.55)', 'rgba(8,18,34,0.22)', 'transparent']}
        locations={[0, 0.45, 1]}
        style={styles.atmoGold}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(255,255,255,0.04)', 'transparent']}
        locations={[0, 0.5, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={styles.atmoMint}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.26)']}
        style={styles.atmoVignette}
      />
    </>
  );
}

export function BrandHeader({
  compact,
  welcome,
}: {
  compact?: boolean;
  welcome?: boolean;
}) {
  return (
    <Animated.View
      entering={ENTRANCE(0)}
      style={[
        styles.brandRow,
        welcome && styles.brandRowWelcome,
        compact && styles.brandRowCompact,
      ]}
    >
      <View style={styles.brandLine} />
      <Zap size={11} color={OB.mint} strokeWidth={2.5} />
      <Text style={styles.brandText}>ESO ENERGY</Text>
      <Zap size={11} color={OB.mint} strokeWidth={2.5} />
      <View style={styles.brandLine} />
    </Animated.View>
  );
}

export function BackButton({ onPress, label = 'Back' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
    >
      <ArrowLeft size={20} color={OB.textSecondary} strokeWidth={2.2} />
    </Pressable>
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loadingLabel?: string;
  variant?: 'default' | 'hero' | 'compact' | 'register';
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loadingLabel,
  variant = 'default',
}: PrimaryButtonProps) {
  const text = disabled && loadingLabel ? loadingLabel : label;
  const scale = useSharedValue(1);
  const isHero = variant === 'hero';
  const isCompact = variant === 'compact' || variant === 'register';
  const isRegister = variant === 'register';

  // Smooth opacity transition between active ↔ disabled states (non-hero only).
  const activeProgress = useSharedValue(disabled ? 0 : 1);
  useEffect(() => {
    activeProgress.value = withTiming(disabled ? 0 : 1, { duration: 240 });
  }, [disabled, activeProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isHero ? 1 : 0.48 + activeProgress.value * 0.52,
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(isHero ? 0.975 : 0.988, { damping: 17, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 360 });
  };

  if (isHero) {
    return (
      <View style={[styles.primaryBtnHeroWrap, disabled && styles.primaryBtnDisabled]}>
        <AnimatedPressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[styles.primaryBtnHero, animatedStyle]}
          accessibilityRole="button"
          accessibilityLabel={text}
        >
          <LinearGradient
            colors={
              disabled
                ? ['#2C2C2E', '#1C1C1E', '#141416']
                : ['#FFFFFF', '#F5F5F5', '#FFFFFF']
            }
            locations={disabled ? [0, 0.5, 1] : [0, 0.5, 1]}
            start={{ x: 0.08, y: 0 }}
            end={{ x: 0.92, y: 1 }}
            style={styles.primaryBtnGradientHero}
          >
            <View pointerEvents="none" style={styles.primaryBtnSheenHero} />
            <View pointerEvents="none" style={styles.primaryBtnHighlight} />
            <View pointerEvents="none" style={styles.primaryBtnBottomEdge} />
            <Text
              style={[styles.primaryBtnText, styles.primaryBtnTextHero]}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {text}
            </Text>
          </LinearGradient>
        </AnimatedPressable>
      </View>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.primaryBtn,
        isRegister && styles.primaryBtnNoTopMargin,
        disabled && styles.primaryBtnDisabled,
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={text}
    >
      <LinearGradient
        colors={
          disabled
            ? ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.08)']
            : ['#FFFFFF', '#F5F5F5', '#FFFFFF']
        }
        locations={disabled ? [0, 0.4, 1] : [0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.primaryBtnGradient,
          isCompact && styles.primaryBtnGradientCompact,
          variant === 'register' && styles.primaryBtnGradientRegister,
        ]}
      >
        <View pointerEvents="none" style={styles.primaryBtnSheen} />
        <View pointerEvents="none" style={styles.primaryBtnHighlight} />
        <View pointerEvents="none" style={styles.primaryBtnBottomEdge} />
        <Text
          style={[
            styles.primaryBtnText,
            { color: disabled ? 'rgba(245, 240, 232, 0.45)' : OB.ink },
          ]}
        >
          {text}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoComplete?: TextInput['props']['autoComplete'];
};

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  autoComplete,
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        placeholder={placeholder}
        placeholderTextColor={OB.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.fieldInput, focused && styles.fieldInputFocused]}
      />
    </View>
  );
}

type PhoneFieldProps = {
  label: string;
  dialCode: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
};

export function PhoneField({
  label,
  dialCode,
  value,
  onChangeText,
  placeholder = '8012345678',
}: PhoneFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.phoneRow, focused && styles.phoneRowFocused]}>
        <Text style={styles.phonePrefix}>{dialCode}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          placeholder={placeholder}
          placeholderTextColor={OB.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.phoneInput}
        />
      </View>
    </View>
  );
}

type AuthScreenShellProps = {
  children: ReactNode;
  footer?: ReactNode;
  keyboardHeight?: number;
  contentStyle?: StyleProp<ViewStyle>;
  showBrandHeader?: boolean;
};

export function AuthScreenShell({
  children,
  footer,
  keyboardHeight = 0,
  contentStyle,
  showBrandHeader = true,
}: AuthScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <OnboardingBackdrop />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.authScroll,
            {
              paddingTop: insets.top + OB_SPACE.xs,
              paddingBottom: insets.bottom + 28 + keyboardHeight,
            },
            contentStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showBrandHeader ? <BrandHeader compact /> : null}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
      {footer ? (
        <View style={[styles.authFooter, { paddingBottom: Math.max(insets.bottom, OB_SPACE.sm) }]}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Animated.View entering={ENTRANCE(60)} style={styles.titleBlock}>
      <Text style={styles.screenTitle}>{title}</Text>
      <Text style={styles.screenSubtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <Animated.View entering={FadeInDown.duration(220)} style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
    </Animated.View>
  );
}

export function TrustFootnote({ children }: { children: string }) {
  return <Text style={styles.trustFootnote}>{children}</Text>;
}

export function SecurityTrustRow({ children }: { children: string }) {
  return (
    <View style={styles.trustPill}>
      <View style={styles.securityRow}>
        <View style={styles.securityIconWrap}>
          <ShieldCheck size={11} color={OB.gold} strokeWidth={2.4} />
        </View>
        <Text style={styles.securityText}>{children}</Text>
      </View>
    </View>
  );
}

export function AuthPromptZone({ children }: { children: ReactNode }) {
  return <View style={styles.authPromptZone}>{children}</View>;
}

export function SecondaryAuthLink({
  prompt,
  action,
  onPress,
  welcome,
  authForm,
  footer,
  centered,
  solo,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
  welcome?: boolean;
  authForm?: boolean;
  footer?: boolean;
  centered?: boolean;
  solo?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        solo
          ? styles.secondaryLinkSoloPressable
          : footer
            ? styles.secondaryLinkFooter
            : centered
              ? styles.secondaryLinkCentered
              : welcome
                ? styles.secondaryLinkWelcome
                : authForm
                  ? styles.secondaryLinkAuth
                  : styles.secondaryLink,
        pressed && styles.secondaryLinkPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={solo ? action : `${prompt} ${action}`}
    >
      {solo ? (
        <Text style={styles.secondaryLinkSolo}>{action}</Text>
      ) : (
        <Text style={styles.secondaryLinkText}>
          {prompt}{' '}
          <Text style={styles.secondaryLinkAction}>{action}</Text>
        </Text>
      )}
    </Pressable>
  );
}

type ModuleCardProps = {
  title: string;
  body: string;
  accent: string;
  iconBg: string;
  Icon: LucideIcon;
  delay?: number;
  onPress?: () => void;
  layout?: 'default' | 'hub' | 'command';
};

function resolveModuleCardHeight(layout: ModuleCardProps['layout']): number {
  if (layout === 'hub') return OB_LANDING.hubCardHeight;
  if (layout === 'command') return OB_LANDING.commandCardHeight;
  return OB_LANDING.cardHeight;
}

export function ModuleCard({
  title,
  body,
  accent,
  iconBg,
  Icon,
  delay = 0,
  onPress,
  layout = 'default',
}: ModuleCardProps) {
  const isHub = layout === 'hub';
  const isCommand = layout === 'command';
  const isLanding = layout === 'default';
  const isPremium = isHub || isCommand;
  const cardMinHeight = resolveModuleCardHeight(layout);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(isLanding ? 0.982 : 0.978, { damping: 18, stiffness: 420 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 360 });
  };

  const cardContent = (
    <View
      style={[
        styles.moduleCard,
        isLanding && styles.moduleCardLanding,
        isPremium && styles.moduleCardHub,
        isCommand && styles.moduleCardCommand,
        isPremium && { borderColor: `${accent}38` },
        isLanding && { borderColor: 'rgba(255, 255, 255, 0.25)' },
        { minHeight: cardMinHeight },
      ]}
    >
      <View
        style={[
          styles.moduleAccent,
          isPremium && styles.moduleAccentHub,
          isPremium && { shadowColor: accent },
          { backgroundColor: accent },
        ]}
      />
      <View pointerEvents="none" style={[styles.moduleTopInset, isLanding && styles.moduleTopInsetLanding]} />
      <View
        pointerEvents="none"
        style={[
          styles.moduleInnerGlow,
          isLanding && styles.moduleInnerGlowLanding,
          isPremium && styles.moduleInnerGlowHub,
          isCommand && styles.moduleInnerGlowCommand,
          isPremium && { backgroundColor: `${accent}14` },
        ]}
      />
      <LinearGradient
        colors={
          isLanding
            ? ['rgba(255,255,255,0.085)', 'rgba(255,255,255,0.034)', 'rgba(255,255,255,0.012)']
            : isPremium
              ? ['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.035)', 'rgba(255,255,255,0.012)']
              : ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.025)', 'rgba(255,255,255,0.01)']
        }
        locations={[0, 0.35, 1]}
        style={[
          styles.moduleCardInner,
          isLanding && styles.moduleCardInnerLanding,
          isPremium && styles.moduleCardInnerHub,
          isCommand && styles.moduleCardInnerCommand,
          { minHeight: cardMinHeight },
        ]}
      >
        <View
          style={[
            styles.moduleIconHalo,
            isLanding && styles.moduleIconHaloLanding,
            isPremium && styles.moduleIconHaloHub,
            {
              shadowColor: accent,
              backgroundColor: isPremium ? `${accent}22` : isLanding ? `${accent}26` : `${accent}12`,
            },
            isPremium && {
              shadowOpacity: 0.34,
              shadowRadius: 12,
            },
            isLanding && {
              shadowOpacity: 0.12,
              shadowRadius: 5,
            },
          ]}
        >
          <View
            style={[
              styles.moduleIcon,
              isLanding && styles.moduleIconLanding,
              isPremium && styles.moduleIconHub,
              { backgroundColor: iconBg, borderColor: `${accent}${isLanding ? '48' : '40'}` },
            ]}
          >
            <Icon size={isPremium ? 20 : 20} color={accent} strokeWidth={isLanding ? 2.35 : 2.2} />
          </View>
        </View>
        <View style={[isLanding && styles.moduleCopyLanding, isCommand && styles.moduleCopyCommand]}>
          <Text
            style={[
              styles.moduleTitle,
              isLanding && styles.moduleTitleLanding,
              isPremium && styles.moduleTitleHub,
              isCommand && styles.moduleTitleCommand,
            ]}
            numberOfLines={isLanding || isCommand ? undefined : 2}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.moduleBody,
              isLanding && styles.moduleBodyLanding,
              isPremium && styles.moduleBodyHub,
              isCommand && styles.moduleBodyCommand,
            ]}
          >
            {body}
          </Text>
        </View>
      </LinearGradient>
      {isLanding ? <View pointerEvents="none" style={styles.moduleBottomInset} /> : null}
    </View>
  );

  const outerStyle = [
    styles.moduleCardOuter,
    isLanding && styles.moduleCardOuterLanding,
    isPremium && styles.moduleCardOuterHub,
    isCommand && styles.moduleCardOuterCommand,
    isPremium && { shadowColor: accent },
    { minHeight: cardMinHeight },
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        entering={ENTRANCE(delay)}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.moduleCardPressable, { minHeight: cardMinHeight }, pressStyle]}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View style={[outerStyle, styles.moduleCardOuterFill]}>{cardContent}</View>
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View entering={ENTRANCE(delay)} style={outerStyle}>
      {cardContent}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: OB.bg,
  },
  flex: {
    flex: 1,
  },
  atmoGold: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
  },
  atmoMint: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '72%',
    height: '36%',
  },
  atmoVignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: OB_SPACE.md,
  },
  brandRowWelcome: {
    marginBottom: OB_SPACE.md,
  },
  brandRowCompact: {
    marginBottom: 16,
  },
  brandLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 196, 140, 0.28)',
  },
  brandText: {
    fontFamily: inter.bold,
    fontSize: OB_TYPE.micro.fontSize,
    letterSpacing: 3.4,
    color: OB.mint,
  },
  backBtn: {
    alignSelf: 'flex-start',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    paddingRight: 16,
    marginBottom: OB_SPACE.xs,
  },
  backBtnPressed: {
    opacity: 0.65,
  },
  authScroll: {
    paddingHorizontal: OB_SPACE.md,
    flexGrow: 1,
  },
  authFooter: {
    paddingHorizontal: OB_SPACE.md,
    paddingTop: OB_SPACE.sm,
  },
  authPromptZone: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 168,
    paddingTop: OB_SPACE.lg,
    paddingBottom: OB_SPACE.xl,
  },
  titleBlock: {
    marginBottom: OB_SPACE.md,
  },
  screenTitle: {
    fontFamily: inter.bold,
    fontSize: OB_TYPE.display.fontSize,
    lineHeight: OB_TYPE.display.lineHeight,
    letterSpacing: OB_TYPE.display.letterSpacing,
    color: OB.text,
    marginBottom: 10,
  },
  screenSubtitle: {
    fontFamily: inter.regular,
    fontSize: OB_TYPE.body.fontSize,
    lineHeight: OB_TYPE.body.lineHeight,
    color: OB.textSecondary,
    maxWidth: 320,
  },
  fieldWrap: {
    marginBottom: OB_SPACE.sm,
  },
  fieldLabel: {
    fontFamily: inter.semibold,
    fontSize: OB_TYPE.label.fontSize,
    letterSpacing: OB_TYPE.label.letterSpacing,
    textTransform: 'uppercase',
    color: OB.textSecondary,
    marginBottom: OB_SPACE.xs,
  },
  fieldInput: {
    fontFamily: inter.regular,
    fontSize: 16,
    color: OB.text,
    backgroundColor: OB.surface,
    borderWidth: 1,
    borderColor: OB.border,
    borderRadius: 14,
    paddingHorizontal: OB_SPACE.sm,
    paddingVertical: 15,
    minHeight: 52,
  },
  fieldInputFocused: {
    borderColor: OB.goldBorder,
    backgroundColor: OB.surfaceRaised,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OB.surface,
    borderWidth: 1,
    borderColor: OB.border,
    borderRadius: 14,
    overflow: 'hidden',
    minHeight: 52,
  },
  phoneRowFocused: {
    borderColor: OB.goldBorder,
    backgroundColor: OB.surfaceRaised,
  },
  phonePrefix: {
    fontFamily: inter.semibold,
    fontSize: 16,
    color: OB.gold,
    paddingHorizontal: OB_SPACE.sm,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.20)',
  },
  phoneInput: {
    flex: 1,
    fontFamily: inter.regular,
    fontSize: 16,
    color: OB.text,
    paddingHorizontal: OB_SPACE.sm,
    paddingVertical: 14,
  },
  primaryBtn: {
    borderRadius: OB_RADIUS.button,
    overflow: 'hidden',
    marginTop: OB_SPACE.xs,
    shadowColor: OB.gold,
    shadowOpacity: ECO_BUTTON.goldShadowOpacity,
    shadowRadius: ECO_BUTTON.goldShadowRadius,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnHeroWrap: {
    borderRadius: OB_RADIUS.button,
    shadowColor: OB.gold,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  primaryBtnHero: {
    borderRadius: OB_RADIUS.button,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  primaryBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnNoTopMargin: {
    marginTop: 0,
  },
  primaryBtnGradient: {
    paddingVertical: 17,
    alignItems: 'center',
  },
  primaryBtnGradientCompact: {
    paddingVertical: OB_LANDING.authButtonPaddingV,
  },
  primaryBtnGradientRegister: {
    paddingVertical: OB_LANDING.registerButtonPaddingV,
  },
  primaryBtnGradientHero: {
    paddingVertical: OB_LANDING.heroButtonPaddingV,
    paddingHorizontal: OB_SPACE.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: OB_LANDING.heroButtonMinHeight,
  },
  primaryBtnSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: ECO_BUTTON.sheen,
  },
  primaryBtnSheenHero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  primaryBtnHighlight: {
    position: 'absolute',
    top: 1,
    left: '8%',
    right: '8%',
    height: 1,
    backgroundColor: ECO_BUTTON.topHighlight,
  },
  primaryBtnBottomEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: ECO_BUTTON.bottomEdge,
  },
  primaryBtnText: {
    fontFamily: inter.bold,
    fontSize: 16,
    color: OB.ink,
  },
  primaryBtnTextHero: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.5,
    color: OB.ink,
    textAlign: 'center',
    zIndex: 2,
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' as const } : {}),
  },
  errorBanner: {
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.22)',
  },
  errorText: {
    fontFamily: inter.medium,
    fontSize: OB_TYPE.bodySm.fontSize,
    color: OB.error,
    lineHeight: OB_TYPE.bodySm.lineHeight,
  },
  trustFootnote: {
    marginTop: OB_SPACE.sm,
    marginBottom: OB_SPACE.sm,
    textAlign: 'center',
    fontFamily: inter.medium,
    fontSize: OB_TYPE.caption.fontSize,
    lineHeight: OB_TYPE.caption.lineHeight,
    color: OB.textMuted,
    letterSpacing: OB_TYPE.caption.letterSpacing,
  },
  trustPill: {
    paddingHorizontal: OB_SPACE.md,
    paddingVertical: 9,
    borderRadius: OB_RADIUS.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignSelf: 'center',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  securityIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OB.goldDim,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  securityText: {
    fontFamily: inter.semibold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.28,
    color: 'rgba(255, 255, 255, 0.85)',
    flexShrink: 1,
  },
  secondaryLink: {
    marginTop: OB_SPACE.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryLinkAuth: {
    marginTop: OB_SPACE.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryLinkCentered: {
    marginTop: 0,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryLinkFooter: {
    marginTop: 0,
    paddingVertical: OB_SPACE.sm,
    alignItems: 'center',
  },
  secondaryLinkWelcome: {
    marginTop: 0,
    paddingVertical: OB_SPACE.xs,
    alignItems: 'center',
  },
  secondaryLinkPressed: {
    opacity: 0.72,
  },
  secondaryLinkText: {
    fontFamily: inter.regular,
    fontSize: OB_TYPE.bodySm.fontSize,
    lineHeight: OB_TYPE.bodySm.lineHeight,
    color: OB.textMuted,
    letterSpacing: 0.05,
  },
  secondaryLinkAction: {
    fontFamily: inter.bold,
    color: OB.gold,
  },
  secondaryLinkSolo: {
    fontFamily: inter.bold,
    fontSize: OB_TYPE.bodySm.fontSize,
    lineHeight: OB_TYPE.bodySm.lineHeight,
    color: OB.gold,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  secondaryLinkSoloPressable: {
    marginTop: OB_SPACE.sm,
    paddingVertical: OB_SPACE.xs,
    alignSelf: 'stretch',
    alignItems: 'center',
    width: '100%',
  },
  moduleCardOuter: {
    flex: 1,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  moduleCardOuterFill: {
    width: '100%',
  },
  moduleCardOuterLanding: {
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  moduleCardOuterHub: {
    shadowOpacity: 0.34,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  moduleCardOuterCommand: {
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  moduleCardPressable: {
    flex: 1,
    alignSelf: 'stretch',
    minWidth: 0,
  },
  moduleCard: {
    flex: 1,
    borderRadius: OB_RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: OB.surfaceCard,
    alignSelf: 'stretch',
  },
  moduleCardLanding: {
    backgroundColor: 'rgba(14, 18, 28, 0.9)',
  },
  moduleCardHub: {
    backgroundColor: 'rgba(14, 18, 28, 0.94)',
  },
  moduleCardCommand: {
    borderRadius: 20,
    backgroundColor: 'rgba(16, 20, 32, 0.96)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  moduleAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 2,
    zIndex: 2,
  },
  moduleAccentHub: {
    width: 4,
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  moduleTopInset: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    zIndex: 2,
  },
  moduleTopInsetLanding: {
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  moduleBottomInset: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    zIndex: 2,
  },
  moduleInnerGlow: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 1,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    zIndex: 1,
  },
  moduleInnerGlowLanding: {
    left: 8,
    right: 8,
    height: 34,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  moduleInnerGlowHub: {
    left: 8,
    right: 8,
    height: 40,
    borderRadius: 16,
  },
  moduleInnerGlowCommand: {
    left: 6,
    right: 6,
    height: 52,
    borderRadius: 18,
  },
  moduleCardInner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    justifyContent: 'flex-start',
  },
  moduleCardInnerLanding: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  moduleCardInnerHub: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },
  moduleCardInnerCommand: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 22,
    justifyContent: 'flex-start',
  },
  moduleCopyCommand: {
    gap: 8,
    flexShrink: 0,
  },
  moduleCopyLanding: {
    gap: 7,
    flex: 1,
    flexShrink: 1,
  },
  moduleIconHalo: {
    alignSelf: 'flex-start',
    borderRadius: OB_RADIUS.icon + 6,
    padding: 3,
    marginBottom: 16,
    shadowOpacity: ECO_GLOW.iconHaloOpacity,
    shadowRadius: ECO_GLOW.iconHaloRadius,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  moduleIconHaloHub: {
    marginBottom: 16,
    padding: 4,
  },
  moduleIconHaloLanding: {
    marginBottom: 12,
    padding: 2,
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: OB_RADIUS.icon,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  moduleIconHub: {
    width: 46,
    height: 46,
    borderRadius: 14,
  },
  moduleIconLanding: {
    width: 42,
    height: 42,
    borderRadius: 13,
  },
  moduleTitle: {
    fontFamily: inter.semibold,
    fontSize: OB_TYPE.body.fontSize,
    lineHeight: 21,
    color: OB.text,
    marginBottom: 6,
    letterSpacing: -0.15,
  },
  moduleTitleLanding: {
    fontFamily: inter.bold,
    fontSize: 17,
    lineHeight: 23,
    marginBottom: 0,
    letterSpacing: 0.02,
  },
  moduleTitleHub: {
    fontSize: OB_TYPE.titleSm.fontSize,
    lineHeight: OB_TYPE.titleSm.lineHeight,
    marginBottom: 8,
  },
  moduleTitleCommand: {
    fontSize: OB_TYPE.body.fontSize,
    lineHeight: OB_TYPE.body.lineHeight,
    marginBottom: 0,
    letterSpacing: -0.2,
  },
  moduleBody: {
    fontFamily: inter.regular,
    fontSize: OB_TYPE.bodySm.fontSize,
    lineHeight: OB_TYPE.bodySm.lineHeight,
    color: OB.textSecondary,
    letterSpacing: 0.04,
    flexShrink: 0,
  },
  moduleBodyLanding: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255, 255, 255, 0.76)',
    letterSpacing: 0.03,
    flexShrink: 1,
  },
  moduleBodyHub: {
    fontSize: 15,
    lineHeight: 22,
    color: OB.textSecondary,
  },
  moduleBodyCommand: {
    fontSize: OB_TYPE.bodySm.fontSize,
    lineHeight: 20,
    color: OB.textSecondary,
    flexShrink: 0,
  },
});
