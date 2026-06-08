import { useCallback } from 'react';

import {

  ActivityIndicator,

  FlatList,

  Pressable,

  RefreshControl,

  StyleSheet,

  Text,

  View,

} from 'react-native';

import { useRouter } from 'expo-router';

import { ChevronRight, Zap } from 'lucide-react-native';

import type { UtilityProvider } from '@/esopay/api/types';

import { useUtilityProviders } from '@/esopay/api/hooks/useBilling';

import { EsoPayHeader } from '@/esopay/components/EsoPayHeader';

import { EsoPayScreenShell } from '@/esopay/components/EsoPayScreenShell';

import { usePaymentModal } from '@/esopay/context/PaymentModalContext';

import { esopayFonts } from '@/esopay/theme/fonts';

import { EsoPayTokens as T } from '@/esopay/theme/tokens';



function ProviderRow({

  provider,

  onPress,

}: {

  provider: UtilityProvider;

  onPress: () => void;

}) {

  return (

    <Pressable

      onPress={onPress}

      style={({ pressed }) => [styles.providerRow, pressed && styles.providerRowPressed]}

    >

      <View style={styles.providerIcon}>

        <Zap size={T.icon.inline} color={T.color.gold.primary} strokeWidth={2} />

      </View>

      <View style={styles.providerBody}>

        <Text style={styles.providerName}>{provider.name}</Text>

        <Text style={styles.providerMeta}>

          {provider.category} · {provider.monnify_biller_code}

        </Text>

      </View>

      <ChevronRight size={18} color={T.color.gold.muted} strokeWidth={2} />

    </Pressable>

  );

}



export function BuyUtilitiesScreen() {

  const router = useRouter();

  const { openPayment } = usePaymentModal();

  const providersQuery = useUtilityProviders();



  const providers = providersQuery.data ?? [];

  const refreshing = providersQuery.isFetching && !providersQuery.isLoading;



  const onRefresh = useCallback(() => {

    void providersQuery.refetch();

  }, [providersQuery]);



  const listHeader = (

    <View style={styles.intro}>

      <Text style={styles.introTitle}>Ad-hoc utility purchase</Text>

      <Text style={styles.introCaption}>

        Select a biller to validate a meter and pay from your Monnify wallet.

      </Text>

    </View>

  );



  if (providersQuery.isLoading && providers.length === 0) {

    return (

      <EsoPayScreenShell>

        <EsoPayHeader title="Buy Utilities" canGoBack onBack={() => router.back()} />

        <View style={styles.loader}>

          <ActivityIndicator color={T.color.gold.primary} size="large" />

        </View>

      </EsoPayScreenShell>

    );

  }



  return (

    <EsoPayScreenShell>

      <EsoPayHeader title="Buy Utilities" canGoBack onBack={() => router.back()} />

      <FlatList

        data={providers}

        keyExtractor={(item) => item.id}

        renderItem={({ item }) => (

          <ProviderRow provider={item} onPress={() => openPayment({ provider: item })} />

        )}

        ListHeaderComponent={listHeader}

        ListEmptyComponent={

          <View style={styles.empty}>

            <Zap size={T.icon.emptyState} color={T.color.gold.muted} strokeWidth={1.5} />

            <Text style={styles.emptyTitle}>No billers available</Text>

            <Text style={styles.emptyCaption}>

              Utility providers will appear once your wallet is provisioned.

            </Text>

          </View>

        }

        contentContainerStyle={styles.listContent}

        refreshControl={

          <RefreshControl

            refreshing={refreshing}

            onRefresh={onRefresh}

            tintColor={T.color.gold.primary}

          />

        }

      />

    </EsoPayScreenShell>

  );

}



const styles = StyleSheet.create({

  listContent: {

    paddingHorizontal: T.layout.screenMargin,

    paddingBottom: T.spacing.xxxl,

    flexGrow: 1,

  },

  intro: {

    paddingTop: T.spacing.lg,

    paddingBottom: T.spacing.xl,

    gap: T.spacing.sm,

  },

  introTitle: {

    fontFamily: esopayFonts.heading,

    fontSize: T.type.h2.size,

    color: T.color.text.primary,

  },

  introCaption: {

    fontFamily: esopayFonts.body,

    fontSize: T.type.body.size,

    lineHeight: T.type.body.lineHeight,

    color: T.color.text.secondary,

  },

  providerRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: T.spacing.md,

    backgroundColor: T.color.bg.surface,

    borderRadius: T.radius.sm,

    borderWidth: 1,

    borderColor: T.color.border.subtle,

    padding: T.layout.cardPaddingHorizontal,

    marginBottom: T.spacing.sm,

    ...T.shadow.card,

  },

  providerRowPressed: {

    borderColor: T.color.border.active,

    backgroundColor: `${T.color.gold.primary}10`,

  },

  providerIcon: {

    width: 40,

    height: 40,

    borderRadius: T.radius.sm,

    backgroundColor: T.color.bg.inset,

    borderWidth: 1,

    borderColor: T.color.border.subtle,

    alignItems: 'center',

    justifyContent: 'center',

  },

  providerBody: {

    flex: 1,

    minWidth: 0,

  },

  providerName: {

    fontFamily: esopayFonts.subheading,

    fontSize: T.type.body.size,

    color: T.color.text.primary,

  },

  providerMeta: {

    marginTop: 2,

    fontFamily: esopayFonts.mono,

    fontSize: T.type.caption.size,

    color: T.color.text.secondary,

    textTransform: 'capitalize',

  },

  empty: {

    alignItems: 'center',

    paddingTop: T.spacing['6xl'],

    gap: T.spacing.md,

  },

  emptyTitle: {

    fontFamily: esopayFonts.heading,

    fontSize: T.type.h3.size,

    color: T.color.text.primary,

  },

  emptyCaption: {

    textAlign: 'center',

    fontFamily: esopayFonts.body,

    fontSize: T.type.body.size,

    lineHeight: T.type.body.lineHeight,

    color: T.color.text.secondary,

  },

  loader: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

  },

});


