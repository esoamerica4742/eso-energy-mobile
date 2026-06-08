import { useCallback, useState } from 'react';

import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { SitesLoadingContent } from '@/components/atoms/Skeleton';
import { LoadingCrossfade } from '@/components/atoms/LoadingCrossfade';

import { FleetCommandScreen } from '@/screens/FleetCommandScreen';

import { useSitesFleet } from '@/hooks/useSitesFleet';

import { colors, fonts } from '@/theme/tokens';



export default function SitesScreen() {

  const { data: sites = [], isPending, isFetching, refetch } = useSitesFleet();

  const [refreshing, setRefreshing] = useState(false);



  const onRefresh = useCallback(async () => {

    setRefreshing(true);

    try {

      await refetch();

    } finally {

      setRefreshing(false);

    }

  }, [refetch]);



  if (sites.length === 0 && !isPending) {

    return (

      <SafeAreaView style={styles.safe} edges={['top']}>

        <ScrollView

          contentContainerStyle={styles.emptyScroll}

          refreshControl={

            <RefreshControl

              refreshing={refreshing || isFetching}

              onRefresh={onRefresh}

              tintColor={colors.gold}

              colors={[colors.gold, colors.solarDot, colors.dieselDot]}

              progressBackgroundColor={colors.bgSurface}

            />

          }

        >

          <View style={styles.empty}>

            <View style={styles.emptyOrb}>
              <MapPin size={28} color={colors.gold} strokeWidth={2} />
            </View>

            <Text style={styles.emptyTitle}>No sites found</Text>

            <Text style={styles.emptySub}>

              Add a site on web admin or contact support. Open the Dashboard tab to connect inverters.

            </Text>

          </View>

        </ScrollView>

      </SafeAreaView>

    );

  }



  return (

    <SafeAreaView style={styles.safe} edges={['top']}>

      <LoadingCrossfade loading={isPending} skeleton={<SitesLoadingContent />}>

        <FleetCommandScreen refreshing={refreshing} onRefresh={onRefresh} />

      </LoadingCrossfade>

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: colors.bgBase },

  emptyScroll: { flexGrow: 1, minHeight: '100%' },

  empty: {

    marginHorizontal: 16,

    marginTop: 48,

    borderRadius: 16,

    borderWidth: 1,

    borderColor: colors.borderSubtle,

    backgroundColor: colors.bgSurface,

    padding: 24,

    alignItems: 'center',

  },

  emptyOrb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldBg,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
  },

  emptyTitle: {

    marginTop: 12,

    fontFamily: fonts.bold,

    fontSize: 18,

    color: colors.textPrimary,

  },

  emptySub: {

    marginTop: 6,

    textAlign: 'center',

    fontFamily: fonts.regular,

    color: colors.textSecondary,

  },

});

