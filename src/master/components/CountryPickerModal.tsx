import { useCallback, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronDown } from 'lucide-react-native';
import { MASTER_COUNTRIES, type MasterCountry } from '@/master/constants';

type Props = {
  visible: boolean;
  selected: MasterCountry;
  onSelect: (country: MasterCountry) => void;
  onClose: () => void;
};

export function CountryPickerModal({ visible, selected, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: { item: MasterCountry }) => {
      const active = item.code === selected.code;
      return (
        <Pressable
          onPress={() => {
            onSelect(item);
            onClose();
          }}
          className="flex-row items-center justify-between border-b border-[#1C2030] px-5 py-4"
        >
          <View className="flex-row items-center gap-3">
            <Text className="text-xl">{item.flag}</Text>
            <View>
              <Text className="text-base font-semibold text-white">{item.name}</Text>
              <Text className="text-sm text-[#8A94A6]">{item.dialCode}</Text>
            </View>
          </View>
          {active ? <Check size={20} color="#FFFFFF" /> : null}
        </Pressable>
      );
    },
    [onClose, onSelect, selected.code],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/70">
        <View
          className="max-h-[70%] rounded-t-3xl bg-[#0D1018]"
          style={{ paddingBottom: insets.bottom }}
        >
          <View className="border-b border-[#1C2030] px-5 py-4">
            <Text className="text-center text-lg font-bold text-white">Select country</Text>
          </View>
          <FlatList data={MASTER_COUNTRIES} keyExtractor={(c) => c.code} renderItem={renderItem} />
        </View>
      </View>
    </Modal>
  );
}

type FieldProps = {
  label: string;
  selected: MasterCountry;
  onPress: () => void;
};

export function CountrySelectField({ label, selected, onPress }: FieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8A94A6]">
        {label}
      </Text>
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between rounded-xl border border-[#1C2030] bg-[#0D1018] px-4 py-3.5"
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">{selected.flag}</Text>
          <Text className="text-base text-white">
            {selected.name} ({selected.dialCode})
          </Text>
        </View>
        <ChevronDown size={18} color="#8A94A6" />
      </Pressable>
    </View>
  );
}
