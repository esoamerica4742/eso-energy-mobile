import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  ChartBar,
  Droplets,
  GraduationCap,
  Phone,
  Recycle,
  Target,
  Tv,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import {
  UTILITY_CATEGORY_META,
  UTILITY_CATEGORY_SLUGS,
  type UtilityCategorySlug,
} from '@/esopay/data/nigeriaBillers';
import {
  BILL_CATEGORY_CARD_HEIGHT,
  BILL_PAY_GRID_COLS,
  BILL_PAY_GRID_H_PAD,
  BILL_PAY_GRID_ITEM_MARGIN,
} from '@/esopay/components/bills/billPayCardTheme';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import { ESO_PAY_GOLD, ESO_PAY_GOLD_MUTED } from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { spacing } from '@/esopay/theme/spacing';
import { inter } from '@/theme/fonts';

const GOLD_TILE = { accent: ESO_PAY_GOLD, iconBg: ESO_PAY_GOLD_MUTED };

const TILE_THEME: Record<UtilityCategorySlug, { Icon: LucideIcon; accent: string; iconBg: string }> = {
  electricity: { Icon: Zap, ...GOLD_TILE },
  airtime: { Icon: Phone, ...GOLD_TILE },
  data: { Icon: ChartBar, ...GOLD_TILE },
  tv: { Icon: Tv, ...GOLD_TILE },
  education: { Icon: GraduationCap, ...GOLD_TILE },
  betting: { Icon: Target, ...GOLD_TILE },
  water: { Icon: Droplets, ...GOLD_TILE },
  waste: { Icon: Recycle, ...GOLD_TILE },
};

type Props = {
  onSelect: (slug: UtilityCategorySlug) => void;
};

export const BillsCategoryHub = memo(function BillsCategoryHub({ onSelect }: Props) {
  const { width } = useWindowDimensions();
  const horizontalPad = BILL_PAY_GRID_H_PAD * 2;
  const colGap = BILL_PAY_GRID_ITEM_MARGIN * 2 * BILL_PAY_GRID_COLS;
  const tileWidth = (width - horizontalPad - colGap) / BILL_PAY_GRID_COLS;
  const tileHeight = BILL_CATEGORY_CARD_HEIGHT;

  return (
    <View style={styles.wrap}>
      <EsoPaySectionLabel>Pay utilities</EsoPaySectionLabel>
      <Text style={styles.headline}>What would you like to pay?</Text>

      <View style={styles.grid}>
        {UTILITY_CATEGORY_SLUGS.map((slug) => {
          const meta = UTILITY_CATEGORY_META[slug];
          const theme = TILE_THEME[slug];
          const { Icon } = theme;

          return (
            <Pressable
              key={slug}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(slug);
              }}
              style={({ pressed }) => [
                styles.tile,
                {
                  width: tileWidth,
                  height: tileHeight,
                  margin: BILL_PAY_GRID_ITEM_MARGIN,
                },
                pressed && styles.tilePressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={meta.title}
            >
              <View style={[styles.iconOrb, { backgroundColor: theme.iconBg }]}>
                <Icon size={26} color={theme.accent} strokeWidth={2.2} />
              </View>
              <Text style={styles.tileTitle}>{meta.title}</Text>
              <Text style={styles.tileSub}>{meta.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: spacing.md,
  },
  headline: {
    fontFamily: inter.bold,
    fontSize: 22,
    color: ds.color.textPrimary,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -BILL_PAY_GRID_ITEM_MARGIN,
    flex: 1,
    alignContent: 'flex-start',
  },
  tile: {
    borderRadius: ds.radius.card,
    backgroundColor: ds.color.surface1,
    borderWidth: 1,
    borderColor: ds.color.border,
    padding: spacing.md,
    justifyContent: 'flex-end',
    gap: 6,
  },
  tilePressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  iconOrb: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: ds.radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontFamily: inter.semibold,
    fontSize: 16,
    color: ds.color.textPrimary,
  },
  tileSub: {
    fontFamily: inter.regular,
    fontSize: 11,
    color: ds.color.textMuted,
  },
});
