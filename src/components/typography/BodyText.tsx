import { Text, StyleSheet, type TextProps } from 'react-native';
import { Colors, FontSize, FontWeight } from '@/tokens/design';

type Props = TextProps & {
  children: string;
  tone?: 'primary' | 'secondary' | 'muted';
};

export function BodyText({ children, tone = 'primary', style, ...rest }: Props) {
  const color =
    tone === 'secondary' ? Colors.textSecondary : tone === 'muted' ? Colors.textMuted : Colors.textPrimary;

  return (
    <Text style={[styles.base, { color }, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.body * 1.45,
  },
});
