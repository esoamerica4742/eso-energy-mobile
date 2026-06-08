import type { LucideIcon } from 'lucide-react-native';
import type { AppProduct } from '@/lib/navigation/productRoutes';

export type PlatformCardVariant = 'monitoring' | 'esopay';

export type CommandCenterModule = {
  id: string;
  product: AppProduct;
  title: string;
  description: string;
  variant: PlatformCardVariant;
  icon: LucideIcon;
};
