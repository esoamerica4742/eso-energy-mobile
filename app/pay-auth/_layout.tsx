import { Stack } from 'expo-router';

/** Deprecated — only index redirects to email login. */
export default function PayAuthDeprecatedLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
