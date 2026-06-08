import { View, Text, StyleSheet } from 'react-native';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { DeltaDir } from '@/types/dashboard';

type Props = {
  delta: number;
  label: string;
  direction: DeltaDir;
  muted?: boolean;
};

export function LiveBadge({ delta, label, direction, muted = false }: Props) {
  const positive = direction === 'up';
  const Icon = positive ? TrendingUp : TrendingDown;
  const accent = muted ? Colors.textMuted : positive ? Colors.mint : Colors.gold;
  const bg = muted ? Colors.surfaceRaised : positive ? Colors.mintGlow : Colors.goldWhisper;
  const border = muted ? Colors.borderSubtle : positive ? Colors.mintBorder : Colors.goldBorder;
  const prefix = positive ? '+' : '-';

  return (
    <View style={[styles.wrap, { backgroundColor: bg, borderColor: border }]}>
      <Icon size={14} color={accent} strokeWidth={2} />
      <Text style={[styles.text, { color: accent }]} numberOfLines={1}>
        {`${prefix}${delta.toFixed(1)}% ${label}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderWidth: 1,
    borderRadius: Radius.pill,
    minHeight: 40,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    letterSpacing: 1,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
});
