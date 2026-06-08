import { StyleSheet, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { CardShell } from '@/components/cards/CardShell';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  filtered?: boolean;
};

export function AlertsEmptyState({ filtered = false }: Props) {
  return (
    <View style={styles.wrap}>
      <CardShell glowColor="mint" borderVariant="gold" style={styles.card}>
        <View style={styles.iconWrap}>
          <ShieldCheck size={28} color={Colors.mint} strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>{filtered ? 'No matches' : 'All clear'}</Text>
        <Text style={styles.copy}>
          {filtered
            ? 'No active alerts match this severity filter.'
            : 'No active alerts across your fleet. Operations are running within thresholds.'}
        </Text>
      </CardShell>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  card: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.mintBorder,
    backgroundColor: Colors.mintGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.mint,
    letterSpacing: -0.2,
  },
  copy: {
    marginTop: Spacing.sm,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
