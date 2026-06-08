import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';
import { Colors, FontSize, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { FleetSite } from '@/types/fleet';

type Props = {
  site: FleetSite | null;
  title?: string;
  onBack: () => void;
};

export function SiteDetailHeader({ site, title, onBack }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onBack}
        style={styles.back}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ChevronLeft size={22} color={Colors.textPrimary} />
      </Pressable>
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {site?.name ?? title ?? 'Site detail'}
        </Text>
        {site ? (
          <View style={styles.metaRow}>
            <FleetStatusPulse status={site.status} size="sm" />
            <Text style={styles.meta}>{site.city}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    color: Colors.textSecondary,
  },
  spacer: {
    width: 44,
  },
});
