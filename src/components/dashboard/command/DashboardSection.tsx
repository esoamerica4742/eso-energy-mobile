import { type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, MonitoringLayout, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  title: string;
  meta?: string;
  children: ReactNode;
  first?: boolean;
};

export function DashboardSection({ title, meta, children, first = false }: Props) {
  return (
    <View style={[styles.block, first && styles.blockFirst]}>
      <View style={styles.headerRow}>
        <View style={styles.left}>
          <View style={styles.rule} />
          <Text style={styles.title}>{title}</Text>
        </View>
        {meta ? (
          <View style={styles.metaBadge}>
            <Text style={styles.meta}>{meta}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.stack}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: MonitoringLayout.sectionGap,
  },
  blockFirst: {
    marginTop: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MonitoringLayout.cardMarginH,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
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
    width: 2,
    height: 12,
    borderRadius: 1,
    backgroundColor: Colors.gold,
    opacity: 0.85,
  },
  title: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
  stack: {
    gap: MonitoringLayout.cardGap,
  },
});
