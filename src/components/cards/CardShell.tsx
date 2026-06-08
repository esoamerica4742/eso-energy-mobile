import { View, StyleSheet, type ViewProps } from 'react-native';
import { Colors, Radius, Shadow } from '@/tokens/design';

type Props = ViewProps & {
  children: React.ReactNode;
  glowColor?: 'gold' | 'mint' | 'none';
  borderVariant?: 'gold' | 'amber' | 'alert' | 'muted';
};

const BORDER_COLORS = {
  gold: Colors.goldBorder,
  amber: Colors.warningBorder,
  alert: Colors.alertBorder,
  muted: Colors.borderSubtle,
} as const;

export function CardShell({
  children,
  glowColor = 'gold',
  borderVariant = 'gold',
  style,
  ...rest
}: Props) {
  const glowBg =
    glowColor === 'mint' ? Colors.mintGlow : glowColor === 'gold' ? Colors.goldGlow : 'transparent';

  return (
    <View style={[styles.outer, style]} {...rest}>
      {glowColor !== 'none' ? <View style={[styles.ambientGlow, { backgroundColor: glowBg }]} pointerEvents="none" /> : null}
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
  ambientGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 220,
    height: 220,
    marginLeft: -110,
    marginTop: -110,
    borderRadius: 110,
    opacity: 0.9,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 18,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadow.card,
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },
});
