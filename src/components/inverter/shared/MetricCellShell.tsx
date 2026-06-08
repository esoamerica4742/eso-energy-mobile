import { View, StyleSheet, type ViewProps } from 'react-native';
import { Colors, Radius, Spacing } from '@/tokens/design';

type Props = ViewProps & {
  children: React.ReactNode;
  accentBorder?: string;
};

export function MetricCellShell({ children, accentBorder, style, ...rest }: Props) {
  return (
    <View
      style={[
        styles.shell,
        accentBorder ? { borderColor: accentBorder } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    minHeight: 112,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: 'hidden',
  },
});
