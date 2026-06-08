import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { enodeClient } from '@/services/enode';
import { ENODE_DEVICES_KEY } from '@/hooks/useEnodeDevices';

WebBrowser.maybeCompleteAuthSession();

export function useEnodeLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const session = await enodeClient.createLinkSession('inverter');
      const redirectUri = enodeClient.getRedirectUri();

      const result = await WebBrowser.openAuthSessionAsync(
        session.linkUrl,
        redirectUri,
      );

      if (result.type === 'success') {
        await enodeClient.syncAll();
        return { status: 'linked' as const, url: result.url };
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return { status: 'cancelled' as const };
      }

      return { status: 'unknown' as const };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ENODE_DEVICES_KEY });
      void queryClient.invalidateQueries({ queryKey: ['enode', 'connection'] });
    },
  });
}

export function parseLinkCallbackUrl(url: string): {
  success: boolean;
  error?: string;
} {
  const parsed = Linking.parse(url);
  const success =
    parsed.queryParams?.success === 'true' ||
    parsed.path === 'link-device/callback' ||
    parsed.hostname === 'link-device';
  const error =
    typeof parsed.queryParams?.error === 'string'
      ? parsed.queryParams.error
      : undefined;
  return { success: success && !error, error };
}
