import { StyleSheet, Text, View } from 'react-native';
import { EsoPayPrimaryButton } from '@/esopay/components/EsoPayButtons';
import { HOME_CARD_BORDER, HOME_CARD_SURFACE } from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';

type Props = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function EsoPayInlineError({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <EsoPayPrimaryButton label={retryLabel} onPress={onRetry} style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: ds.radius.card,
    borderWidth: 1,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: HOME_CARD_SURFACE,
    padding: ds.space.screen,
    gap: ds.space.component,
    alignItems: 'center',
  },
  title: {
    fontFamily: ds.font.title,
    fontSize: ds.type.subtitle.fontSize,
    color: ds.color.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontFamily: ds.font.body,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.color.textMuted,
    textAlign: 'center',
  },
  btn: {
    width: '100%',
    marginTop: 4,
  },
});
