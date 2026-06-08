import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Zap } from 'lucide-react-native';
import { PS, psFont } from '@/esopay/components/power-shield/powerShieldTheme';

export const PowerShieldHeader = memo(function PowerShieldHeader() {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Zap size={26} color={PS.amber} strokeWidth={2.4} fill="rgba(245, 166, 35, 0.15)" />
        <Text style={styles.title}>Power Shield</Text>
      </View>
      <Text style={styles.subtitle}>
        Automated blackout protection and smart reloads before your prepaid token runs out.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: psFont.display,
    fontSize: 28,
    color: PS.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: psFont.body,
    fontSize: 14,
    lineHeight: 20,
    color: PS.textMuted,
  },
});
