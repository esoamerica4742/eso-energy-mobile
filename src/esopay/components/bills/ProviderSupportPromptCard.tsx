import { Pressable, StyleSheet, Text, View } from 'react-native';
import { openEsoEnergySupportEmail } from '@/esopay/lib/esoEnergyLinks';
import { ESO_PAY_GOLD } from '@/esopay/theme/brandColors';
import { fonts } from '@/esopay/theme/typography';

export function ProviderSupportPromptCard() {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.prompt}>Can't find your provider?</Text>
        <Pressable
          onPress={() => {
            void openEsoEnergySupportEmail().catch(() => {});
          }}
          accessibilityRole="link"
          accessibilityLabel="Contact support"
        >
          <Text style={styles.link}>Contact support →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 32,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  prompt: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: '#8B9BB4',
    textAlign: 'center',
  },
  link: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    fontWeight: '600',
    color: ESO_PAY_GOLD,
    textAlign: 'center',
  },
});
