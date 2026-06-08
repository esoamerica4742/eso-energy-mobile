import { Text, StyleSheet, type TextProps } from 'react-native';
import { Colors, FontSize, FontWeight } from '@/tokens/design';

type Props = TextProps & {
  children: string;
};

export function PageLabel({ children, style, ...rest }: Props) {
  return (
    <Text style={[styles.base, style]} numberOfLines={1} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: Colors.textSecondary,
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
