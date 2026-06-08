import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppProduct } from '@/lib/navigation/productRoutes';

const KEY = '@eso/last_product';

export async function getLastProduct(): Promise<AppProduct | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === 'monitoring' || raw === 'esopay') return raw;
    return null;
  } catch {
    return null;
  }
}

export async function setLastProduct(product: AppProduct): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, product);
  } catch {
    // Non-fatal — boot falls back to access picker.
  }
}
