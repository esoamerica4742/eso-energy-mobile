import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ChartBar,
  GraduationCap,
  Phone,
  Target,
  Tv,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import type { BillFilterTab } from '@/esopay/data/utilities';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import {
  ESO_PAY_BG,
  ESO_PAY_GOLD,
  ESO_PAY_GOLD_MUTED,
  ESO_PAY_GOLD_MUTED_06,
  ESO_PAY_SURFACE,
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
} from '@/esopay/theme/brandColors';
import { ds } from '@/esopay/theme/designSystem';
import { fonts } from '@/esopay/theme/typography';

const ELECTRICITY_ACCENT = ESO_PAY_GOLD;

export type BillCategoryTile = {
  key: string;
  label: string;
  filter: BillFilterTab;
  color: string;
  Icon: LucideIcon;
};

/** Opay-style quick category shortcuts — tap jumps to that folder */
export const BILL_CATEGORY_TILES: BillCategoryTile[] = [
  { key: 'elec', label: 'Electricity', filter: 'ELECTRICITY', color: '#F59E0B', Icon: Zap },
  { key: 'air', label: 'Airtime', filter: 'AIRTIME', color: '#10B981', Icon: Phone },
  { key: 'data', label: 'Data', filter: 'DATA', color: '#38BDF8', Icon: ChartBar },
  { key: 'tv', label: 'Cable TV', filter: 'CABLE TV', color: '#A855F7', Icon: Tv },
  { key: 'edu', label: 'Education', filter: 'EDUCATION', color: '#FB923C', Icon: GraduationCap },
  { key: 'bet', label: 'Betting', filter: 'BETTING', color: '#F43F5E', Icon: Target },
];

type Props = {
  activeFilter: BillFilterTab;
  onSelect: (filter: BillFilterTab) => void;
};

export const BillCategoriesRow = memo(function BillCategoriesRow({ activeFilter, onSelect }: Props) {
  return (
    <View style={styles.section}>
      <EsoPaySectionLabel>Pay a bill</EsoPaySectionLabel>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        nestedScrollEnabled
      >
        {BILL_CATEGORY_TILES.map((tile) => {
          const active = activeFilter === tile.filter;
          const Icon = tile.Icon;
          if (!Icon) return null;

          return (
            <Pressable
              key={tile.key}
              onPress={() => onSelect(tile.filter)}
              style={({ pressed }) => [
                styles.tile,
                { borderColor: active ? tile.color : 'rgba(255,255,255,0.08)' },
                active && { backgroundColor: ESO_PAY_GOLD_MUTED },
                pressed && styles.tilePressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={tile.label}
              accessibilityState={{ selected: active }}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${tile.color}22` }]}>
                <Icon size={22} color={tile.color} strokeWidth={2.2} />
              </View>
              <Text style={styles.tileLabel} numberOfLines={1}>
                {tile.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: ESO_PAY_TEXT_PRIMARY,
  },
  row: {
    gap: 10,
    paddingRight: 4,
  },
  tile: {
    width: 76,
    minHeight: 88,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D0F17',
  },
  tilePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    lineHeight: 12,
    color: '#F4F4F6',
    textAlign: 'center',
  },
});
