import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { CardShell } from '@/components/cards/CardShell';
import { Spacing } from '@/tokens/design';
import type { PremiumNavRowProps } from '@/components/navigation/PremiumNavRow';

type Props = {
  children: ReactNode;
  glowColor?: 'gold' | 'mint' | 'none';
};

export function SettingsSectionGroup({ children, glowColor = 'none' }: Props) {
  const items = Children.toArray(children).filter(isValidElement);
  const count = items.length;

  return (
    <CardShell glowColor={glowColor} borderVariant="muted" style={styles.shell}>
      {items.map((child, index) => {
        if (!isValidElement(child)) return child;
        const isLast = index === count - 1;
        return cloneElement(child as ReactElement<PremiumNavRowProps>, {
          embedded: true,
          embeddedLast: isLast,
          key: child.key ?? `settings-row-${index}`,
        });
      })}
    </CardShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: 4,
  },
});
