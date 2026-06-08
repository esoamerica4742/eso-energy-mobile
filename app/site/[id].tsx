import { useLocalSearchParams } from 'expo-router';
import { SiteDetailScreen } from '@/screens/SiteDetailScreen';

export default function SiteDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return <SiteDetailScreen siteId={id} />;
}
