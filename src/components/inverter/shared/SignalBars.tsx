import { View, StyleSheet } from 'react-native';
import { Colors } from '@/tokens/design';

const BAR_HEIGHTS = [6, 9, 12, 15, 18];

type Props = {
  level: number;
  maxLevel?: number;
  inline?: boolean;
};

export function SignalBars({ level, maxLevel = 5, inline = false }: Props) {
  return (
    <View style={[styles.wrap, inline ? styles.inline : styles.floating]}>
      {Array.from({ length: maxLevel }, (_, index) => {
        const active = index < level;
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: BAR_HEIGHTS[index] ?? 18,
                backgroundColor: active ? Colors.gold : Colors.textMuted,
                opacity: active ? 1 : 0.25,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  inline: {
    flexShrink: 0,
  },
  floating: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
  },
});
