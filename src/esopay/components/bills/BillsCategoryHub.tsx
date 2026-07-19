import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { BillPayCardItem } from '@/esopay/components/bills/BillPayCard';
import { BillPayCardGrid } from '@/esopay/components/bills/BillPayCardGrid';
import { BillPayCategoryIcon } from '@/esopay/components/bills/BillPayCategoryIcon';
import { ServiceCardIcon } from '@/esopay/components/bills/ServiceCardIcon';
import {
  UTILITY_CATEGORY_META,
  UTILITY_CATEGORY_SLUGS,
  type UtilityCategorySlug,
} from '@/esopay/data/nigeriaBillers';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import { getBillPayCardHelper } from '@/esopay/lib/billPayCardHelpers';
import { getCategoryBillPayVisual } from '@/esopay/lib/categoryBillPayVisual';
import {
  HOME_BILL_CATEGORY_CARD_HEIGHT,
  HOME_BILL_GRID_COLUMN_GAP,
  HOME_BILL_GRID_ROW_GAP,
} from '@/esopay/components/bills/billPayCardTheme';
import { grid } from '@/esopay/theme/homeGrid';

type Props = {
  onSelect: (slug: UtilityCategorySlug) => void;
};

export const BillsCategoryHub = memo(function BillsCategoryHub({ onSelect }: Props) {
  const items = useMemo<BillPayCardItem[]>(
    () =>
      UTILITY_CATEGORY_SLUGS.map((slug, index) => {
        const meta = UTILITY_CATEGORY_META[slug];
        const visual = getCategoryBillPayVisual(slug);
        return {
          id: slug,
          title: meta.title,
          subtitle: getBillPayCardHelper(slug),
          icon: (
            <ServiceCardIcon>
              <BillPayCategoryIcon slug={slug} color={visual.iconColor} size={22} />
            </ServiceCardIcon>
          ),
          visual,
          index,
          onPress: () => onSelect(slug),
          accessibilityLabel: meta.title,
        };
      }),
    [onSelect],
  );

  return (
    <View style={styles.wrap}>
      <EsoPaySectionLabel>Pay utilities</EsoPaySectionLabel>
      <BillPayCardGrid
        items={items}
        embedded
        hubCards
        cardHeight={HOME_BILL_CATEGORY_CARD_HEIGHT}
        contentPaddingH={grid.sm}
        columnGap={HOME_BILL_GRID_COLUMN_GAP}
        rowGap={HOME_BILL_GRID_ROW_GAP}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: grid.sm,
  },
});
