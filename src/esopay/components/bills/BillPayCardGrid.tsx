import { memo, useMemo, type ReactNode } from 'react';

import { FlatList, StyleSheet, View } from 'react-native';

import { BillPayCard, type BillPayCardItem } from '@/esopay/components/bills/BillPayCard';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';

import {

  BILL_PAY_GRID_COLS,

  BILL_PAY_GRID_H_PAD,

  BILL_PAY_GRID_ITEM_MARGIN,

} from '@/esopay/components/bills/billPayCardTheme';

import { spacing } from '@/esopay/theme/spacing';

import { fonts } from '@/esopay/theme/typography';



export type { BillPayCardItem };



export type BillPayGridSection = {

  id: string;

  title: string;

  items: BillPayCardItem[];

};



type Props = {

  title?: string;

  items?: BillPayCardItem[];

  sections?: BillPayGridSection[];

  paddingBottom?: number;

  /** Disable inner scroll when nested inside a parent ScrollView (e.g. Home). */

  embedded?: boolean;

  /** Optional footer below the grid (e.g. provider support prompt). */

  footer?: ReactNode;

  /** Compact home/bills hub card styling. */
  hubCards?: boolean;

  /** Override card height for dense grids (e.g. Home services). */
  cardHeight?: number;

  /** Horizontal padding inside the grid container (0 to align with parent). */
  contentPaddingH?: number;

  /** Vertical padding at the top of the grid content. */
  contentPaddingTop?: number;

  /** Space between columns in the grid. */
  columnGap?: number;

  /** Space between rows in the grid. */
  rowGap?: number;

  /** Legacy: fine-tune outer item spacing. Prefer columnGap/rowGap. */
  itemMargin?: number;
};

function resolveGridSpacing({
  contentPaddingH,
  contentPaddingTop,
  columnGap,
  rowGap,
  itemMargin,
}: {
  contentPaddingH: number | undefined;
  contentPaddingTop: number | undefined;
  columnGap: number | undefined;
  rowGap: number | undefined;
  itemMargin: number | undefined;
}) {
  const hPad = contentPaddingH ?? BILL_PAY_GRID_H_PAD;
  const topPad = contentPaddingTop ?? spacing.xs;

  // If a legacy margin is provided, map it to a symmetric grid gap.
  const resolvedColumnGap =
    columnGap ?? (itemMargin != null ? itemMargin * 2 : BILL_PAY_GRID_ITEM_MARGIN * 2);
  const resolvedRowGap =
    rowGap ?? (itemMargin != null ? itemMargin * 2 : BILL_PAY_GRID_ITEM_MARGIN * 2);

  // Item padding is half the gap so items line up perfectly between columns/rows.
  const itemPadH = Math.max(0, resolvedColumnGap / 2);
  const itemPadV = Math.max(0, resolvedRowGap / 2);

  // Compensate outer edges so the visual margins stay consistent.
  const outerPadH = Math.max(0, hPad - itemPadH);

  return {
    topPad,
    itemPadH,
    itemPadV,
    outerPadH,
  };
}



function GridList({
  items,
  embedded,
  paddingBottom,
  indexOffset = 0,
  footer,
  hubCards = false,
  cardHeight,
  contentPaddingH,
  contentPaddingTop,
  columnGap,
  rowGap,
  itemMargin,
}: {
  items: BillPayCardItem[];
  embedded: boolean;
  paddingBottom: number;
  indexOffset?: number;
  footer?: ReactNode;
  hubCards?: boolean;
  cardHeight?: number;
  contentPaddingH?: number;
  contentPaddingTop?: number;
  columnGap?: number;
  rowGap?: number;
  itemMargin?: number;
}) {

  if (items.length === 0) return null;

  const spacingModel = resolveGridSpacing({
    contentPaddingH,
    contentPaddingTop,
    columnGap,
    rowGap,
    itemMargin,
  });



  return (

    <FlatList

      data={items}

      keyExtractor={(item) => item.id}

      numColumns={BILL_PAY_GRID_COLS}

      scrollEnabled={!embedded}

      nestedScrollEnabled={embedded}

      removeClippedSubviews={false}

      showsVerticalScrollIndicator={false}

      style={embedded ? styles.listEmbedded : styles.list}

      contentContainerStyle={[

        styles.gridContent,

        {
          paddingHorizontal: spacingModel.outerPadH,
          paddingTop: spacingModel.topPad,
          paddingBottom: Math.max(paddingBottom, spacing.sm) + spacingModel.itemPadV,
        },

      ]}

      columnWrapperStyle={styles.columnWrapper}

      ListFooterComponent={footer ?? undefined}

      renderItem={({ item, index }) => (

        <View
          style={[
            styles.gridItem,
            {
              paddingHorizontal: spacingModel.itemPadH,
              paddingVertical: spacingModel.itemPadV,
            },
          ]}
        >

          <BillPayCard
            {...item}
            layout="grid"
            index={indexOffset + index}
            animateEntry={!embedded}
            hubCards={hubCards}
            height={cardHeight}
          />

        </View>

      )}

    />

  );

}



export const BillPayCardGrid = memo(function BillPayCardGrid({
  title,
  items,
  sections,
  paddingBottom = 0,
  embedded = false,
  footer,
  hubCards = false,
  cardHeight,
  contentPaddingH,
  contentPaddingTop,
  columnGap,
  rowGap,
  itemMargin,
}: Props) {

  const flatSections = useMemo(() => {

    if (sections?.length) {

      return sections.filter((s) => s.items.length > 0);

    }

    if (items?.length) {

      return [{ id: 'default', title: title ?? '', items }];

    }

    return [];

  }, [sections, items, title]);



  if (flatSections.length === 0) return null;



  const multiSection = flatSections.length > 1 || (flatSections[0]?.title && !title);



  if (!multiSection) {

    const only = flatSections[0];

    if (!only) return null;

    return (

      <View style={[styles.wrap, embedded && styles.wrapEmbedded]}>

        {title ? (
          <EsoPaySectionLabel containerStyle={styles.labelPad}>{title}</EsoPaySectionLabel>
        ) : null}

        <GridList
          items={only.items}
          embedded={embedded}
          paddingBottom={paddingBottom}
          footer={footer}
          hubCards={hubCards}
          cardHeight={cardHeight}
          contentPaddingH={contentPaddingH}
          contentPaddingTop={contentPaddingTop}
          columnGap={columnGap}
          rowGap={rowGap}
          itemMargin={itemMargin}
        />

      </View>

    );

  }



  let indexOffset = 0;

  return (

    <View style={[styles.wrap, embedded && styles.wrapEmbedded]}>

      {title ? (
        <EsoPaySectionLabel containerStyle={styles.labelPad}>{title}</EsoPaySectionLabel>
      ) : null}

      {flatSections.map((section) => {

        const sectionEl = (

          <View key={section.id} style={styles.sectionBlock}>

            {section.title ? (
              <EsoPaySectionLabel containerStyle={styles.sectionLabelPad} style={styles.sectionLabelTracking}>
                {section.title}
              </EsoPaySectionLabel>
            ) : null}

            <GridList
              items={section.items}
              embedded={embedded}
              paddingBottom={0}
              indexOffset={indexOffset}
              hubCards={hubCards}
              cardHeight={cardHeight}
              contentPaddingH={contentPaddingH}
              contentPaddingTop={contentPaddingTop}
              columnGap={columnGap}
              rowGap={rowGap}
              itemMargin={itemMargin}
            />

          </View>

        );

        indexOffset += section.items.length;

        return sectionEl;

      })}

      {paddingBottom > 0 ? <View style={{ height: paddingBottom }} /> : null}

    </View>

  );

});



const styles = StyleSheet.create({

  wrap: {

    flex: 1,

    gap: spacing.sm,

  },

  wrapEmbedded: {

    flexGrow: 0,

  },

  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: 'rgba(245, 240, 232, 0.92)',
    paddingHorizontal: BILL_PAY_GRID_H_PAD,
  },
  labelPad: {
    paddingHorizontal: BILL_PAY_GRID_H_PAD,
  },
  sectionLabelPad: {
    paddingHorizontal: BILL_PAY_GRID_H_PAD,
    marginTop: spacing.xs,
  },
  sectionLabelTracking: {
    letterSpacing: 2.2,
  },

  sectionBlock: {

    gap: spacing.xs,

  },

  sectionLabel: {

    fontFamily: fonts.uiMedium,

    fontSize: 10,

    letterSpacing: 2.2,

    textTransform: 'uppercase',

    color: 'rgba(245, 240, 232, 0.92)',

    paddingHorizontal: BILL_PAY_GRID_H_PAD,

    marginTop: spacing.xs,

  },

  list: {

    flex: 1,

  },

  listEmbedded: {

    flexGrow: 0,

    backgroundColor: 'transparent',

  },

  gridContent: {

    paddingHorizontal: BILL_PAY_GRID_H_PAD,

    paddingTop: spacing.xs,

  },

  columnWrapper: {

    flexDirection: 'row',

    alignItems: 'stretch',

  },

  gridItem: {

    flex: 1,

    margin: 0,

  },

});

