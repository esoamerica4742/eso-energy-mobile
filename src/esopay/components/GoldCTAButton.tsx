import { memo } from 'react';
import { type ViewStyle } from 'react-native';
import { EsoPayGoldButton } from '@/esopay/components/EsoPayButtons';

type Props = {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  style?: ViewStyle;
};

/** Flat gold CTA — Add Funds & Power Shield actions only. */
export const GoldCTAButton = memo(function GoldCTAButton({
  label,
  onPress,
  isLoading = false,
  isDisabled = false,
  style,
}: Props) {
  return (
    <EsoPayGoldButton
      label={label}
      onPress={onPress}
      loading={isLoading}
      disabled={isDisabled}
      style={style}
    />
  );
});
