import { ScrollView, StyleSheet } from 'react-native';
import { spacing } from '@/theme/tokens';
import { CARD_WIDTH, KpiCard } from './KpiCard';
import { SavingsKpiCard } from './SavingsKpiCard';

const KPIS = [
  { label: 'Total Load',    value: '847.3', unit: 'kW', delta: '+12%',  positive: true,  accent: 'default' },
  { label: 'Solar Output',  value: '612.1', unit: 'kW', delta: '+8%',   positive: true,  accent: 'teal'    },
  { label: 'Grid Draw',     value: '235.2', unit: 'kW', delta: '−3%',   positive: true,  accent: 'default' },
  { label: 'Cost Today',    value: '₦184K', unit: '',   delta: '−5%',   positive: true,  accent: 'gold'    },
] as const;

export function KpiCardsRow() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + spacing.md}
      decelerationRate="fast"
      contentContainerStyle={styles.content}
    >
      <SavingsKpiCard />
      {KPIS.map((k) => (
        <KpiCard key={k.label} {...k} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
});
