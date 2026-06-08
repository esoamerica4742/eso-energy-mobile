import { Text, View } from 'react-native';
import { GlassCard } from '@/screens/onboarding/components/GlassCard';
import { OnboardingAlertRow } from '@/screens/onboarding/components/OnboardingAlertRow';
import { ONBOARDING_COLORS as C } from '@/screens/onboarding/theme';

const ALERTS = [
  {
    icon: '⚡',
    title: 'INV-003',
    body: 'Voltage spike detected',
    statusChip: '2 min ago',
    footnote: 'Urgent',
    tone: 'red' as const,
  },
  {
    icon: '🔋',
    title: 'BAT-007',
    body: 'Capacity drop predicted',
    statusChip: '14 hrs',
    footnote: 'Predicted failure',
    tone: 'amber' as const,
  },
  {
    icon: '✅',
    title: 'TRF-002',
    body: 'All parameters normal',
    statusChip: 'OK · Resolved',
    tone: 'green' as const,
  },
];

export function AlertTimelineCard() {
  return (
    <GlassCard>
      <Text
        className="text-[14px] tracking-[1.6px]"
        style={{ color: C.muted, fontFamily: 'Inter_600SemiBold' }}
      >
        ALERT TIMELINE
      </Text>
      <View className="mt-4 gap-3">
        {ALERTS.map((row) => (
          <OnboardingAlertRow key={row.title} {...row} />
        ))}
      </View>
    </GlassCard>
  );
}
