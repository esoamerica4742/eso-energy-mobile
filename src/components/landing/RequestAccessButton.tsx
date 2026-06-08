import { ActivityIndicator, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  loading: boolean;
  onPress: () => void;
};

export function RequestAccessButton({ loading, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Request Access"
      className="min-h-[48px] active:opacity-80"
    >
      <LinearGradient
        colors={['#FFFFFF', '#E4E4E7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="min-h-[48px] items-center justify-center rounded-full px-5"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#09090B" />
        ) : (
          <Text className="font-bold text-sm tracking-tight text-zinc-900">Request Access</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}
