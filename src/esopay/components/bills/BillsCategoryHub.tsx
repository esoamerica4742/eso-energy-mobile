import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import { luxury } from '@/esopay/theme/luxury';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

const TILE_THEME: Record<
  UtilityCategorySlug,
  { Icon: LucideIcon; gradient: [string, string]; glow: string }
> = {
  electricity: { Icon: Zap, gradient: ['#F59E0B', '#B45309'], glow: 'rgba(245,158,11,0.25)' },
  airtime: { Icon: Phone, gradient: ['#10B981', '#047857'], glow: 'rgba(16,185,129,0.22)' },
  data: { Icon: ChartBar, gradient: ['#38BDF8', '#0369A1'], glow: 'rgba(56,189,248,0.22)' },
  tv: { Icon: Tv, gradient: ['#A855F7', '#6B21A8'], glow: 'rgba(168,85,247,0.22)' },
  education: { Icon: GraduationCap, gradient: ['#FB923C', '#C2410C'], glow: 'rgba(251,146,60,0.22)' },
  betting: { Icon: Target, gradient: ['#F43F5E', '#BE123C'], glow: 'rgba(244,63,94,0.22)' },
  water: { Icon: Droplets, gradient: ['#0EA5E9', '#0284C7'], glow: 'rgba(14,165,233,0.22)' },
  waste: { Icon: Recycle, gradient: ['#84CC16', '#65A30D'], glow: 'rgba(132,204,22,0.22)' },
};

type Props = {
  onSelect: (slug: UtilityCategorySlug) => void;
};

export const BillsCategoryHub = memo(function BillsCategoryHub({ onSelect }: Props) {
  const { width, height } = useWindowDimensions();
  const gap = 14;
  const horizontalPad = spacing.lg * 2;
  const tileWidth = (width - horizontalPad - gap) / 2;
  // Fit 3 rows within available body (below title) on most phones
  const tileHeight = Math.min(132, Math.max(108, (height * 0.42 - gap * 2) / 3));

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>Pay utilities</Text>
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
                  shadowColor: theme.glow,
                },
                pressed && styles.tilePressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={meta.title}
            >
              <LinearGradient colors={theme.gradient} style={styles.iconOrb}>
                <Icon size={28} color="#FFFFFF" strokeWidth={2.2} />
              </LinearGradient>
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
  eyebrow: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: luxury.warmWhite,
  },
  headline: {
    fontFamily: fonts.uiBold,
    fontSize: 22,
    color: luxury.textPrimary,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    flex: 1,
    alignContent: 'flex-start',
  },
  tile: {
    borderRadius: 18,
    backgroundColor: luxury.surface,
    borderWidth: 1,
    borderColor: luxury.goldBorder,
    padding: spacing.md,
    justifyContent: 'flex-end',
    gap: 6,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
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
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: luxury.textPrimary,
  },
  tileSub: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: luxury.textMuted,
  },
});
