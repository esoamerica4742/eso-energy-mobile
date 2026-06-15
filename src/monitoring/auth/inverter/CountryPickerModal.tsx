import { useCallback, useEffect } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { InverterCountry } from '@/monitoring/auth/inverter/countries';
import { INVERTER_AUTH } from '@/monitoring/auth/inverter/tokens';

type Props = {
  visible: boolean;
  countries: InverterCountry[];
  selected: InverterCountry;
  onSelect: (country: InverterCountry) => void;
  onClose: () => void;
};

export function CountryPickerModal({
  visible,
  countries,
  selected,
  onSelect,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.min(windowHeight * 0.52, 420);
  const translateY = useSharedValue(sheetHeight);

  const finishClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const animateClose = useCallback(() => {
    translateY.value = withTiming(sheetHeight, { duration: 250 }, (finished) => {
      if (finished) runOnJS(finishClose)();
    });
  }, [finishClose, sheetHeight, translateY]);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [translateY, visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSelect = useCallback(
    (country: InverterCountry) => {
      onSelect(country);
      animateClose();
    },
    [animateClose, onSelect],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={animateClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={animateClose} accessibilityLabel="Close" />
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 16, minHeight: sheetHeight },
            sheetStyle,
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Country</Text>
            <Pressable
              onPress={animateClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close country picker"
            >
              <Ionicons name="close" size={24} color={INVERTER_AUTH.TEAL} />
            </Pressable>
          </View>

          <FlatList
            data={countries}
            keyExtractor={(item) => item.name}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item.name === selected.name;
              return (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={[styles.row, isSelected && styles.rowSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>
                    {item.flag}  {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: INVERTER_AUTH.BG_SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INVERTER_AUTH.BORDER_DEFAULT,
  },
  headerTitle: {
    color: INVERTER_AUTH.TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '700',
  },
  row: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  rowSelected: {
    backgroundColor: INVERTER_AUTH.TEAL_GLOW,
  },
  rowText: {
    color: INVERTER_AUTH.TEXT_SECONDARY,
    fontSize: 16,
  },
  rowTextSelected: {
    color: INVERTER_AUTH.TEAL,
    fontWeight: '600',
  },
});
