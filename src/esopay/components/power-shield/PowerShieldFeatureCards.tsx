import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bell, BellRinging } from 'phosphor-react-native';
import { PS, psFont } from '@/esopay/components/power-shield/powerShieldTheme';
import { ds } from '@/esopay/theme/designSystem';

export const PowerShieldFeatureCards = memo(function PowerShieldFeatureCards() {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <Bell size={ds.size.iconFeature} color={PS.gold} weight="duotone" duotoneColor={PS.gold} />
        <Text style={styles.title}>Auto-Top Up</Text>
        <Text style={styles.valueGold}>10%</Text>
        <Text style={styles.subtitle}>Reload threshold</Text>
      </View>
      <View style={styles.card}>
        <BellRinging
          size={ds.size.iconFeature}
          color={PS.gold}
          weight="duotone"
          duotoneColor={PS.gold}
        />
        <Text style={styles.title}>Critical Alert</Text>
        <Text style={styles.valueError}>5%</Text>
        <Text style={styles.subtitle}>Emergency threshold</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: ds.space.component,
  },
  card: {
    flex: 1,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: PS.border,
    borderRadius: ds.radius.card,
    padding: ds.space.screen,
    gap: 6,
  },
  title: {
    fontFamily: psFont.bodyMedium,
    fontSize: 14,
    color: PS.text,
    marginTop: 4,
  },
  valueGold: {
    fontFamily: psFont.bold,
    fontSize: 20,
    color: PS.gold,
  },
  valueError: {
    fontFamily: psFont.bold,
    fontSize: 20,
    color: PS.error,
  },
  subtitle: {
    fontFamily: psFont.body,
    fontSize: 12,
    color: PS.textMuted,
  },
});
