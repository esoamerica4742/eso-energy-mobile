import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Lightning } from 'phosphor-react-native';
import { PS, psFont } from '@/esopay/components/power-shield/powerShieldTheme';
import { ds } from '@/esopay/theme/designSystem';

export const PowerShieldHeader = memo(function PowerShieldHeader() {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Lightning
          size={ds.size.iconFeature}
          color={PS.gold}
          weight="duotone"
          duotoneColor={PS.gold}
        />
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
    gap: ds.space.inline,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: psFont.display,
    fontSize: ds.type.headline.fontSize,
    lineHeight: ds.type.headline.lineHeight,
    color: PS.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: psFont.body,
    fontSize: 14,
    lineHeight: 20,
    color: PS.textSecondary,
    marginTop: ds.space.inline,
    flexShrink: 1,
    width: '100%',
  },
});
