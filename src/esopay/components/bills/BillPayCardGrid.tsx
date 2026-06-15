import { memo, useMemo, type ReactNode } from 'react';

import { FlatList, StyleSheet, View } from 'react-native';

import { BillPayCard, type BillPayCardItem } from '@/esopay/components/bills/BillPayCard';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';

import {

  BILL_PAY_GRID_COLS,

  BILL_PAY_GRID_H_PAD,

  BILL_PAY_GRID_ITEM_MARGIN,

} from '@/esopay/components/bills/billPayCardTheme';

import { luxury } from '@/esopay/theme/luxury';

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
};



function GridList({
  items,
  embedded,
  paddingBottom,
  indexOffset = 0,
  footer,
  hubCards = false,
}: {
  items: BillPayCardItem[];
  embedded: boolean;
  paddingBottom: number;
  indexOffset?: number;
  footer?: ReactNode;
  hubCards?: boolean;
}) {

  if (items.length === 0) return null;



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

        { paddingBottom: Math.max(paddingBottom, spacing.sm) },

      ]}

      columnWrapperStyle={styles.columnWrapper}

      ListFooterComponent={footer ?? undefined}

      renderItem={({ item, index }) => (

        <View style={styles.gridItem}>

          <BillPayCard
            {...item}
            layout="grid"
            index={indexOffset + index}
            animateEntry={!embedded}
            hubCards={hubCards}
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
    color: luxury.warmWhite,
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

    color: luxury.warmWhite,

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

    margin: BILL_PAY_GRID_ITEM_MARGIN,

  },

});

