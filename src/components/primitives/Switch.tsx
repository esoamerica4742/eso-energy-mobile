import { StyleSheet } from 'react-native';
import * as SwitchPrimitive from '@rn-primitives/switch';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { motionSpring } from '@/lib/motion/presets';
import { colors } from '@/theme/tokens';

type Props = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  variant?: 'dashboard' | 'wallet';
};

export function PremiumSwitch({
  checked,
  onCheckedChange,
  disabled,
  variant = 'dashboard',
}: Props) {
  const accent = variant === 'wallet' ? '#00c896' : colors.gold;
  const trackOff = variant === 'wallet' ? '#0f2d22' : colors.bgHighlit;
  const thumbTravel = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    thumbTravel.value = withSpring(checked ? 1 : 0, motionSpring.snappy);
  }, [checked, thumbTravel]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbTravel.value * 18 }],
  }));

  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      style={[
        styles.track,
        { backgroundColor: checked ? `${accent}44` : trackOff, borderColor: checked ? accent : colors.borderSubtle },
        disabled && styles.disabled,
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled: Boolean(disabled) }}
    >
      <SwitchPrimitive.Thumb asChild>
        <Animated.View style={[styles.thumb, { backgroundColor: checked ? accent : colors.textSecondary }, thumbStyle]} />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

const THUMB = 22;
const TRACK_W = 48;
const TRACK_H = 28;

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    borderWidth: 1,
    padding: 3,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  disabled: { opacity: 0.45 },
});
