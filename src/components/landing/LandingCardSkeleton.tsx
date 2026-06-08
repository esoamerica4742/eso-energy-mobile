import { View } from 'react-native';
import { SkeletonBlock } from '@/components/atoms/Skeleton';
import { EnterpriseCard } from './EnterpriseCard';

export function LandingCardSkeleton() {
  return (
    <EnterpriseCard>
      <SkeletonBlock width="66%" height={16} borderRadius={4} />
      <View className="mt-5 flex-row gap-4">
        <View className="flex-1 gap-2">
          <SkeletonBlock width="50%" height={12} borderRadius={4} />
          <SkeletonBlock width="75%" height={32} borderRadius={6} />
        </View>
        <View className="flex-1 gap-2">
          <SkeletonBlock width="50%" height={12} borderRadius={4} />
          <SkeletonBlock width="75%" height={32} borderRadius={6} />
        </View>
      </View>
      <SkeletonBlock height={48} borderRadius={6} style={{ marginTop: 16 }} />
    </EnterpriseCard>
  );
}
