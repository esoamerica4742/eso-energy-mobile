import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Download } from 'lucide-react-native';
import { CardShell } from '@/components/cards/CardShell';
import { MiniSparkline } from '@/components/fleet/command/MiniSparkline';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { ReportExportItem } from '@/lib/reportsData';

type Props = {
  item: ReportExportItem;
  onPress?: () => void;
};

export function ReportExportCard({ item, onPress }: Props) {
  const trendStatus = item.status === 'ready' ? 'live' : 'degraded';

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.heroValue}`}
    >
      <CardShell glowColor="gold" borderVariant="gold" style={styles.shell}>
        <View style={styles.topRow}>
          <View style={styles.iconBox}>
            <item.icon size={18} color={Colors.gold} strokeWidth={1.8} />
          </View>
          <View style={styles.badges}>
            <View style={styles.formatBadge}>
              <Text style={styles.formatText}>{item.format}</Text>
            </View>
            <View style={styles.readyBadge}>
              <Text style={styles.readyText}>READY</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>

        <View style={styles.heroRow}>
          <View style={styles.heroBlock}>
            <Text style={styles.heroValue}>{item.heroValue}</Text>
            <Text style={styles.heroLabel}>{item.heroLabel}</Text>
          </View>
          <MiniSparkline values={item.trend} status={trendStatus} width={96} height={36} />
        </View>

        <View style={styles.footer}>
          <Download size={14} color={Colors.gold} strokeWidth={2} />
          <Text style={styles.footerText}>Export report</Text>
        </View>
      </CardShell>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldWhisper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  formatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
  },
  formatText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  readyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.mintBorder,
    backgroundColor: Colors.mintGlow,
  },
  readyText: {
    fontFamily: fonts.bold,
    fontSize: FontSize.label,
    color: Colors.mint,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: FontSize.sub,
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  heroBlock: {
    flex: 1,
  },
  heroValue: {
    fontFamily: fonts.bold,
    fontSize: FontSize.unit,
    color: Colors.gold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  heroLabel: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: FontSize.caption,
    color: Colors.gold,
    letterSpacing: 0.4,
  },
});
