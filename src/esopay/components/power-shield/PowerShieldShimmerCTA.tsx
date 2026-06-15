import { memo } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { EsoPayGoldButton } from '@/esopay/components/EsoPayButtons';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** @deprecated Use EsoPayGoldButton directly. */
export const PowerShieldShimmerCTA = memo(function PowerShieldShimmerCTA({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
}: Props) {
  return (
    <EsoPayGoldButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      style={style}
    />
  );
});
