import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  message: string;
  onRetry: () => void;
};

export function AlertsErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconOrb}>
        <AlertTriangle size={24} color={Colors.alert} strokeWidth={2} />
      </View>
      <Text style={styles.title}>Could not load alerts</Text>
      <Text style={styles.copy}>{message}</Text>
      <Pressable style={styles.btn} onPress={onRetry} accessibilityRole="button">
        <Text style={styles.btnText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.alertBorder,
    backgroundColor: Colors.alertMuted,
    alignItems: 'center',
  },
  iconOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.alertBorder,
  },
  title: {
    marginTop: Spacing.md,
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
  },
  copy: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  btn: {
    marginTop: Spacing.lg,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldWhisper,
  },
  btnText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.caption,
    color: Colors.gold,
    letterSpacing: 0.4,
  },
});
