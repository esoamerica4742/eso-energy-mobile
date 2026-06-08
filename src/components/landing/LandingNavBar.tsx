import { View, Text } from 'react-native';
import { RequestAccessButton } from './RequestAccessButton';

type Props = {
  loading: boolean;
  onRequestAccess: () => void;
};

export function LandingNavBar({ loading, onRequestAccess }: Props) {
  return (
    <View className="min-h-[48px] flex-row items-center justify-between px-5 pt-2">
      <View>
        <Text className="font-bold tracking-widest text-white">ESO ENERGY</Text>
        <Text className="font-mono text-[9px] text-zinc-600">COMMAND DECK v2.6</Text>
      </View>
      <RequestAccessButton loading={loading} onPress={onRequestAccess} />
    </View>
  );
}
