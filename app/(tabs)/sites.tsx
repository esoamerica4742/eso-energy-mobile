import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MapPin, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SitesLoadingContent } from '@/components/atoms/Skeleton';
import { LoadingCrossfade } from '@/components/atoms/LoadingCrossfade';
import { AddSiteModal } from '@/components/sites/AddSiteModal';
import { FleetCommandScreen } from '@/screens/FleetCommandScreen';
import { useSitesFleet } from '@/hooks/useSitesFleet';
import { canCreateSites } from '@/lib/monitoring/rbac';
import { selectRole, useAuthStore } from '@/stores/authStore';
import { colors, fonts } from '@/theme/tokens';

export default function SitesScreen() {
  const { addSite } = useLocalSearchParams<{ addSite?: string }>();
  const role = useAuthStore(selectRole);
  const canAddSite = canCreateSites(role);
  const { data: sites = [], isPending, isFetching, refetch } = useSitesFleet();
  const [refreshing, setRefreshing] = useState(false);
  const [addSiteOpen, setAddSiteOpen] = useState(false);

  useEffect(() => {
    if (addSite === '1' && canAddSite) {
      setAddSiteOpen(true);
    }
  }, [addSite, canAddSite]);

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
              {canAddSite
                ? 'Create your first site, then connect inverters from the Monitor tab.'
                : 'Ask an administrator to add a site, then connect inverters from the Monitor tab.'}
            </Text>
            {canAddSite ? (
              <Pressable style={styles.addBtn} onPress={() => setAddSiteOpen(true)}>
                <Plus size={18} color={colors.bgBase} />
                <Text style={styles.addBtnText}>Add site</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
        <AddSiteModal open={addSiteOpen} onOpenChange={setAddSiteOpen} onCreated={() => void refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LoadingCrossfade loading={isPending} skeleton={<SitesLoadingContent />}>
        <FleetCommandScreen
          refreshing={refreshing}
          onRefresh={onRefresh}
          canAddSite={canAddSite}
          onAddSite={() => setAddSiteOpen(true)}
        />
      </LoadingCrossfade>
      <AddSiteModal open={addSiteOpen} onOpenChange={setAddSiteOpen} onCreated={() => void refetch()} />
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
  addBtn: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.gold,
  },
  addBtnText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.bgBase,
  },
});
