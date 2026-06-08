import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonAuthSplash } from '@/components/atoms/Skeleton';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { parseLinkCallbackUrl } from '@/hooks/useEnodeLink';
import { enodeClient } from '@/services/enode';
import { useEnodeToast } from '@/providers/EnodeToastProvider';
import { colors } from '@/theme/tokens';

/**
 * Deep-link landing route: esoenergymobile://link-device/callback
 */
export default function LinkDeviceCallbackScreen() {
  const router = useRouter();
  const toast = useEnodeToast();

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      try {
        const initial = await Linking.getInitialURL();
        if (initial) {
          const { success, error } = parseLinkCallbackUrl(initial);
          if (error) toast.show(error, 'error');
          else if (success) {
            await enodeClient.syncAll();
            toast.show('Device linked', 'success');
          }
        } else {
          await enodeClient.syncAll();
        }
      } catch {
        toast.show('Finishing connection…', 'info');
      }
      if (!cancelled) {
        router.replace('/(tabs)/monitor');
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [router, toast]);

  return (
    <View style={styles.wrap}>
      <SkeletonAuthSplash />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
