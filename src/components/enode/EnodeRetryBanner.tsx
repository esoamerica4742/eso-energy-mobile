import { View, Text, Pressable, StyleSheet } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type Props = {
  message: string;
  onRetry: () => void;
  loading?: boolean;
};

export function EnodeRetryBanner({ message, onRetry, loading }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.msg}>{message}</Text>
      <Pressable
        onPress={onRetry}
        disabled={loading}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      >
        <RefreshCw size={14} color={colors.textAccent} />
        <Text style={styles.btnText}>{loading ? 'Retrying…' : 'Retry'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.negativeBg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  msg: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.offlineText,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  btnPressed: { opacity: 0.7 },
  btnText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.badge,
    color: colors.textAccent,
  },
});
