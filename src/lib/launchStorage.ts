import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

const HAS_LAUNCHED_BEFORE_KEY = 'hasLaunchedBefore';

export function getHasLaunchedBefore(): boolean {
  return storage.getString(HAS_LAUNCHED_BEFORE_KEY) === 'true';
}

export function setHasLaunchedBefore(): void {
  storage.set(HAS_LAUNCHED_BEFORE_KEY, 'true');
}
