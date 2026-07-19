import { View, StyleSheet, type ViewProps } from 'react-native';
import { Colors, Radius } from '@/tokens/design';

type Props = ViewProps & {
  children: React.ReactNode;
  glowColor?: 'gold' | 'mint' | 'none';
  borderVariant?: 'gold' | 'amber' | 'alert' | 'muted';
};

const BORDER_COLORS = {
  gold: 'rgba(255,255,255,0.12)',
  amber: Colors.warningBorder,
  alert: Colors.alertBorder,
  muted: Colors.borderSubtle,
} as const;

export function CardShell({
  children,
  glowColor = 'none',
  borderVariant = 'muted',
  style,
  ...rest
}: Props) {
  return (
    <View style={[styles.outer, style]} {...rest}>
      {/* glowColor kept for API compat — quiet dialect never paints ambient blobs. */}
      {glowColor !== 'none' ? null : null}
      <View style={[styles.card, { borderColor: BORDER_COLORS[borderVariant] }]}>
        <View style={styles.innerHighlight} pointerEvents="none" />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
