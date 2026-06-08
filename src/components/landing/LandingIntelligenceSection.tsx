import { StyleSheet, Text, View } from 'react-native';
import { InverterTelemetryCard } from './InverterTelemetryCard';

type Props = {
  paddingHorizontal?: number;
};

/** Live inverter cards for the marketing landing page. */
export function LandingIntelligenceSection({ paddingHorizontal = 24 }: Props) {
  return (
    <View style={[styles.wrap, { paddingHorizontal }]}>
      <Text style={styles.label}>LIVE COMMAND PREVIEW</Text>
      <InverterTelemetryCard enabled />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
    paddingVertical: 8,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    letterSpacing: 2,
    color: '#71717A',
    marginBottom: 4,
  },
});
