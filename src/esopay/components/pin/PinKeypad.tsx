import { memo, useCallback, type ReactNode } from 'react';

import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Backspace, Fingerprint } from 'phosphor-react-native';

import Animated, {

  useAnimatedStyle,

  useReducedMotion,

  useSharedValue,

  withSpring,

  withTiming,

} from 'react-native-reanimated';

import { inter } from '@/theme/fonts';



const WARM_WHITE = '#FFFFFF';

const GOLD = '#FFFFFF';

const KEY_BG = '#1C1C1E';

const KEY_PRESSED = '#2C2C2E';

const KEY_BORDER = 'rgba(255, 255, 255, 0.08)';

const KEY_HEIGHT = 72;

const WELCOME_KEY_BG = '#1C1C1E';

const WELCOME_KEY_PRESSED = '#2C2C2E';

const WELCOME_KEY_BORDER = 'rgba(255, 255, 255, 0.14)';

const WELCOME_KEY_BORDER_TOP = 'rgba(255, 255, 255, 0.05)';

const WELCOME_KEY_SIZE = 76;

const QUIET_KEY_BG = '#1C1C1E';

const QUIET_KEY_PRESSED = '#2C2C2E';

const QUIET_KEY_SIZE = 76;

const QUIET_WHITE = '#FFFFFF';

const KEY_SPRING = { damping: 20, stiffness: 340, mass: 0.65 };

const PRESS_TIMING = { duration: 70 };



const AnimatedPressable = Animated.createAnimatedComponent(Pressable);



type PinKeypadVariant = 'default' | 'welcomeBack' | 'quiet';



const KEYPAD_ROWS = [

  ['1', '2', '3'],

  ['4', '5', '6'],

  ['7', '8', '9'],

] as const;



type Props = {

  onDigit: (digit: string) => void;

  onBackspace: () => void;

  disabled?: boolean;

  backspaceDisabled?: boolean;

  showBiometric?: boolean;

  onBiometricPress?: () => void;

  horizontalPadding?: number;

  gap?: number;

  style?: StyleProp<ViewStyle>;

  variant?: PinKeypadVariant;

};



const KeypadKey = memo(function KeypadKey({

  label,

  onPress,

  disabled,

  reduceMotion,

  accessibilityLabel,

  children,

  variant,

}: {

  label?: string;

  onPress: () => void;

  disabled?: boolean;

  reduceMotion: boolean;

  accessibilityLabel: string;

  children?: ReactNode;

  variant: PinKeypadVariant;

}) {

  const isWelcome = variant === 'welcomeBack';

  const isQuiet = variant === 'quiet';

  const isRound = isWelcome || isQuiet;

  const keyBg = isQuiet ? QUIET_KEY_BG : isWelcome ? WELCOME_KEY_BG : KEY_BG;

  const keyPressed = isQuiet ? QUIET_KEY_PRESSED : isWelcome ? WELCOME_KEY_PRESSED : KEY_PRESSED;



  const scale = useSharedValue(1);

  const opacity = useSharedValue(1);

  const bg = useSharedValue(keyBg);



  const animStyle = useAnimatedStyle(() => ({

    transform: [{ scale: scale.value }],

    opacity: opacity.value,

    backgroundColor: bg.value,

  }));



  const handlePressIn = useCallback(() => {

    if (disabled) return;

    bg.value = keyPressed;

    if (reduceMotion) return;

    scale.value = withTiming(0.94, PRESS_TIMING);

    opacity.value = withTiming(0.72, PRESS_TIMING);

  }, [disabled, keyPressed, opacity, reduceMotion, scale, bg]);



  const handlePressOut = useCallback(() => {

    if (disabled) return;

    bg.value = withTiming(keyBg, { duration: 110 });

    if (reduceMotion) return;

    scale.value = withSpring(1, KEY_SPRING);

    opacity.value = withTiming(1, PRESS_TIMING);

  }, [disabled, keyBg, opacity, reduceMotion, scale, bg]);



  const slotStyle = isRound ? styles.keySlotWelcome : styles.keySlot;

  const cellStyle = isQuiet
    ? styles.keyCellQuiet
    : isWelcome
      ? styles.keyCellWelcome
      : styles.keyCell;

  const labelStyle = isQuiet
    ? styles.keyLabelQuiet
    : isWelcome
      ? styles.keyLabelWelcome
      : styles.keyLabel;



  return (

    <View style={slotStyle}>

      <AnimatedPressable

        onPress={onPress}

        onPressIn={handlePressIn}

        onPressOut={handlePressOut}

        disabled={disabled}

        style={[

          cellStyle,

          isWelcome ? styles.keyCellWelcomeBorder : null,

          animStyle,

        ]}

        accessibilityRole="button"

        accessibilityLabel={accessibilityLabel}

        accessibilityState={{ disabled: Boolean(disabled) }}

      >

        {children ?? (

          <Text style={labelStyle}>{label}</Text>

        )}

      </AnimatedPressable>

    </View>

  );

});



export const PinKeypad = memo(function PinKeypad({

  onDigit,

  onBackspace,

  disabled = false,

  backspaceDisabled = false,

  showBiometric = false,

  onBiometricPress,

  horizontalPadding = 24,

  gap = 10,

  style,

  variant = 'quiet',

}: Props) {

  const reduceMotion = useReducedMotion() ?? false;

  const isWelcome = variant === 'welcomeBack';

  const isQuiet = variant === 'quiet';

  const isRound = isWelcome || isQuiet;

  const accentColor = isQuiet ? QUIET_WHITE : GOLD;

  const rowStyle = isRound ? styles.keyRowWelcome : styles.keyRow;

  const emptySlotStyle = isRound ? styles.keySlotWelcome : styles.keySlot;



  return (

    <View style={[styles.keypad, { paddingHorizontal: horizontalPadding, gap }, style]}>

      {KEYPAD_ROWS.map((row, rowIndex) => (

        <View key={rowIndex} style={[rowStyle, { gap }]}>

          {row.map((key) => (

            <KeypadKey

              key={key}

              label={key}

              onPress={() => onDigit(key)}

              disabled={disabled}

              reduceMotion={reduceMotion}

              accessibilityLabel={`Digit ${key}`}

              variant={variant}

            />

          ))}

        </View>

      ))}



      <View style={[rowStyle, { gap }]}>

        {showBiometric && onBiometricPress ? (

          <KeypadKey

            onPress={onBiometricPress}

            disabled={disabled}

            reduceMotion={reduceMotion}

            accessibilityLabel="Unlock with biometrics"

            variant={variant}

          >

            {isQuiet ? (
              <Fingerprint size={26} color={accentColor} weight="regular" />
            ) : (
              <Fingerprint
                size={26}
                color={GOLD}
                weight="duotone"
                duotoneColor="rgba(255,255,255,0.35)"
              />
            )}

          </KeypadKey>

        ) : (

          <View style={emptySlotStyle} />

        )}

        <KeypadKey

          label="0"

          onPress={() => onDigit('0')}

          disabled={disabled}

          reduceMotion={reduceMotion}

          accessibilityLabel="Digit 0"

          variant={variant}

        />

        <KeypadKey

          onPress={onBackspace}

          disabled={disabled || backspaceDisabled}

          reduceMotion={reduceMotion}

          accessibilityLabel="Backspace"

          variant={variant}

        >

          <Backspace

            size={26}

            color={isQuiet || isWelcome ? accentColor : WARM_WHITE}

            weight="regular"

          />

        </KeypadKey>

      </View>

    </View>

  );

});



const styles = StyleSheet.create({

  keypad: {

    width: '100%',

  },

  keyRow: {

    flexDirection: 'row',

    alignItems: 'center',

  },

  keyRowWelcome: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

  },

  keySlot: {

    flex: 1,

    height: KEY_HEIGHT,

  },

  keySlotWelcome: {

    width: WELCOME_KEY_SIZE,

    height: WELCOME_KEY_SIZE,

  },

  keyCell: {

    width: '100%',

    height: '100%',

    borderRadius: 16,

    borderWidth: 1,

    borderColor: KEY_BORDER,

    overflow: 'hidden',

    alignItems: 'center',

    justifyContent: 'center',

  },

  keyCellWelcome: {

    width: WELCOME_KEY_SIZE,

    height: WELCOME_KEY_SIZE,

    borderRadius: WELCOME_KEY_SIZE / 2,

    overflow: 'hidden',

    alignItems: 'center',

    justifyContent: 'center',

  },

  keyCellQuiet: {

    width: QUIET_KEY_SIZE,

    height: QUIET_KEY_SIZE,

    borderRadius: QUIET_KEY_SIZE / 2,

    overflow: 'hidden',

    alignItems: 'center',

    justifyContent: 'center',

  },

  keyCellWelcomeBorder: {

    borderWidth: 1,

    borderColor: WELCOME_KEY_BORDER,

    borderTopColor: WELCOME_KEY_BORDER_TOP,

  },

  keyLabel: {

    fontFamily: inter.medium,

    fontSize: 24,

    color: WARM_WHITE,

  },

  keyLabelWelcome: {

    fontFamily: inter.semibold,

    fontSize: 25,

    color: '#F8F4EC',

    letterSpacing: 0.3,

  },

  keyLabelQuiet: {

    fontFamily: inter.medium,

    fontSize: 26,

    color: QUIET_WHITE,

  },

});


