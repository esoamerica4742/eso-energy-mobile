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

/** Primary white-pill CTA (legacy name kept for callers). */
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
