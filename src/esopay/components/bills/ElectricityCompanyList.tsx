import { memo, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import type { RecentUtilityPayment } from '@/esopay/api/types';
import type { CategoryBillerEntry } from '@/esopay/lib/buildCategoryBillPayCards';
import {
  groupElectricityCompanies,
  orderElectricityCompanies,
  type ElectricityCompanyGroup,
} from '@/esopay/lib/electricityCompanies';
import { getDiscoBrandStyle } from '@/esopay/data/billerBrands';
import { EsoPaySectionLabel } from '@/esopay/components/EsoPaySectionLabel';
import { ESO_PAY_TEXT_PRIMARY } from '@/esopay/theme/brandColors';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  billers: CategoryBillerEntry[];
  recentPayments: RecentUtilityPayment[];
  onSelect: (company: ElectricityCompanyGroup) => void;
  title?: string;
  paddingBottom?: number;
};

export const ElectricityCompanyList = memo(function ElectricityCompanyList({
  billers,
  recentPayments,
  onSelect,
  title = 'Select electricity company',
  paddingBottom = 0,
}: Props) {
  const ordered = useMemo(() => {
    const groups = groupElectricityCompanies(billers);
    return orderElectricityCompanies(groups, recentPayments);
  }, [billers, recentPayments]);

  return (
    <View style={styles.wrap}>
      <EsoPaySectionLabel containerStyle={styles.labelPad}>{title}</EsoPaySectionLabel>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: paddingBottom + spacing.md }}
      >
        <View style={styles.card}>
          {ordered.map((company, index) => {
            const brand = getDiscoBrandStyle(company.brandMeta);
            const isLast = index === ordered.length - 1;
            return (
              <View key={company.id}>
                <Pressable
                  onPress={() => onSelect(company)}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={company.title}
                >
                  <View style={[styles.logo, { backgroundColor: brand.logoBg }]}>
                    <Text style={[styles.logoText, { color: brand.logoFg }]} numberOfLines={1}>
                      {brand.logoText}
                    </Text>
                  </View>
                  <View style={styles.body}>
                    <Text style={styles.name} numberOfLines={1}>
                      {company.title}
                    </Text>
                    <Text style={styles.coverage} numberOfLines={1}>
                      {company.stateLabel}
                    </Text>
                  </View>
                  <CaretRight size={14} color="rgba(255,255,255,0.35)" weight="bold" />
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
  wrap: { flex: 1, gap: spacing.md },
  labelPad: { paddingHorizontal: 20 },
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.045)',
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 76,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  rowPressed: { backgroundColor: 'rgba(255,255,255,0.055)' },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  logoText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  body: { flex: 1, minWidth: 0, gap: 4 },
  name: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: ESO_PAY_TEXT_PRIMARY,
    includeFontPadding: false,
  },
  coverage: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: 'rgba(255,255,255,0.42)',
    includeFontPadding: false,
  },
});
