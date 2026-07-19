import { memo, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import type { RecentUtilityPayment } from '@/esopay/api/types';
import {
  buildOrderedCategoryBillers,
  type CategoryBillerEntry,
} from '@/esopay/lib/buildCategoryBillPayCards';
import { getProviderCardTitle } from '@/esopay/lib/billPayCardHelpers';
import { getDiscoBrandStyle } from '@/esopay/data/billerBrands';
import type { UtilityCategorySlug } from '@/esopay/data/nigeriaBillers';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import {
  ESO_PAY_TEXT_PRIMARY,
  ESO_PAY_TEXT_SECONDARY,
  HOME_CARD_BORDER,
} from '@/esopay/theme/brandColors';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  slug: UtilityCategorySlug;
  billers: CategoryBillerEntry[];
  recentPayments: RecentUtilityPayment[];
  onSelect: (entry: CategoryBillerEntry) => void;
  title?: string;
  paddingBottom?: number;
};

function meterTypeLabel(name: string): 'Prepaid' | 'Postpaid' | null {
  if (/postpaid/i.test(name)) return 'Postpaid';
  if (/prepaid/i.test(name)) return 'Prepaid';
  return null;
}

function companyTitle(meta: CategoryBillerEntry['meta']): string {
  const base = getProviderCardTitle(meta)
    .replace(/\s+(Prepaid|Postpaid)\s*$/i, '')
    .trim();
  return base || meta.name;
}

function normalizeMatchKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export const ProviderSelectList = memo(function ProviderSelectList({
  slug,
  billers,
  recentPayments,
  onSelect,
  title = 'Select provider',
  paddingBottom = 0,
}: Props) {
  const ordered = useMemo(
    () => buildOrderedCategoryBillers(slug, billers, recentPayments),
    [billers, recentPayments, slug],
  );

  const recentIds = useMemo(() => {
    const ids = new Set<string>();
    for (const payment of recentPayments) {
      const nameKey = normalizeMatchKey(payment.provider.name);
      const codeKey = normalizeMatchKey(payment.provider.monnify_biller_code);
      const hit = billers.find(({ provider: p, meta }) => {
        if (p.id === payment.provider.id) return true;
        const pName = normalizeMatchKey(p.name);
        const mCode = normalizeMatchKey(meta.monnify_biller_code);
        return (
          pName === nameKey ||
          pName.includes(nameKey) ||
          nameKey.includes(pName) ||
          mCode === codeKey
        );
      });
      if (hit) ids.add(hit.provider.id);
    }
    return ids;
  }, [billers, recentPayments]);

  return (
    <View style={styles.wrap}>
      <EsoPaySectionLabel containerStyle={styles.labelPad}>{title}</EsoPaySectionLabel>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: paddingBottom + spacing.md }}
      >
        <View style={styles.card}>
          {ordered.map((item, index) => {
            const brand = getDiscoBrandStyle(item.meta);
            const meter = meterTypeLabel(item.meta.name);
            const paidBefore = recentIds.has(item.provider.id);
            const isLast = index === ordered.length - 1;
            return (
              <View key={item.provider.id}>
                <Pressable
                  onPress={() => onSelect(item)}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`${companyTitle(item.meta)}${meter ? `, ${meter}` : ''}`}
                >
                  <View style={[styles.logo, { backgroundColor: brand.logoBg }]}>
                    <Text style={[styles.logoText, { color: brand.logoFg }]} numberOfLines={1}>
                      {brand.logoText}
                    </Text>
                  </View>
                  <View style={styles.body}>
                    <Text style={styles.name} numberOfLines={1}>
                      {companyTitle(item.meta)}
                    </Text>
                    <View style={styles.metaRow}>
                      {meter ? (
                        <View style={styles.meterChip}>
                          <Text style={styles.meterChipText}>{meter}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.coverage} numberOfLines={1}>
                        {paidBefore ? 'Paid before' : item.meta.stateLabel}
                      </Text>
                    </View>
                  </View>
                  <CaretRight size={16} color={ESO_PAY_TEXT_SECONDARY} weight="bold" />
                </Pressable>
                {isLast ? null : <View style={styles.separator} />}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: spacing.sm,
  },
  labelPad: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HOME_CARD_BORDER,
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 70,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    lineHeight: 20,
    color: ESO_PAY_TEXT_PRIMARY,
    includeFontPadding: false,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  meterChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  meterChipText: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.72)',
    includeFontPadding: false,
  },
  coverage: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 12,
    color: ESO_PAY_TEXT_SECONDARY,
    includeFontPadding: false,
  },
});
