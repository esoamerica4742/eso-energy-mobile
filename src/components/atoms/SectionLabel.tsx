import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = { text: string; meta?: string };

export function SectionLabel({ text, meta }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.rule} />
        <Text style={styles.text}>{text}</Text>
      </View>
      {meta ? (
        <View style={styles.metaBadge}>
          <Text style={styles.meta}>{meta}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 0,
  },
  rule: {
    width: 3,
    height: 14,
    borderRadius: 1,
    backgroundColor: Colors.gold,
  },
  text: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  metaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
  },
  meta: {
    fontFamily: fonts.bold,
    fontSize: FontSize.micro,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
