/**
 * Site selector — shows active site name, tap to open bottom-sheet picker.
 */
import { useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { MapPin, ChevronDown, Check } from 'lucide-react-native';
import { useSiteStore } from '@/stores/siteStore';
import { usePowerShieldCriticalPanic } from '@/esopay/hooks/usePowerShieldCriticalPanic';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

export function SiteSelector() {
  const { sites, activeSiteId, setActiveSite, activeSite } = useSiteStore();
  const sheetRef = useRef<BottomSheet>(null);
  const current  = activeSite();
  const crisis = usePowerShieldCriticalPanic();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!crisis) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [crisis, pulse]);

  const crisisStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const openSheet = useCallback(() => {
    void Haptics.selectionAsync();
    sheetRef.current?.expand();
  }, []);

  const select = useCallback((id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSite(id);
    sheetRef.current?.close();
  }, [setActiveSite]);

  return (
    <>
      <Animated.View style={crisis ? crisisStyle : undefined}>
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          crisis && styles.triggerCrisis,
          pressed && styles.triggerPressed,
        ]}
        onPress={openSheet}
      >
        <MapPin size={13} color={colors.gold} strokeWidth={2} />
        <Text style={styles.siteName} numberOfLines={1}>
          {current?.name ?? 'Select site'}
        </Text>
        {sites.length > 1 ? (
          <ChevronDown size={13} color={colors.textTertiary} strokeWidth={2} />
        ) : null}
      </Pressable>
      </Animated.View>

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['40%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.bgSurface }}
        handleIndicatorStyle={{ backgroundColor: colors.borderDefault }}
      >
        <BottomSheetView style={styles.sheet}>
          <Text style={styles.sheetTitle}>Select Site</Text>
          {sites.map((site) => {
            const active = site.id === activeSiteId;
            return (
              <Pressable
                key={site.id}
                style={({ pressed }) => [
                  styles.sheetRow,
                  active && styles.sheetRowActive,
                  pressed && styles.sheetRowPressed,
                ]}
                onPress={() => select(site.id)}
              >
                <View>
                  <Text style={[styles.sheetName, active && styles.sheetNameActive]}>
                    {site.name}
                  </Text>
                  {site.location ? (
                    <Text style={styles.sheetLoc}>{site.location}</Text>
                  ) : null}
                </View>
                {active ? (
                  <Check size={16} color={colors.gold} strokeWidth={2.5} />
                ) : null}
              </Pressable>
            );
          })}
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.goldBg,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 100,
    alignSelf: 'flex-start',
    maxWidth: 220,
  },
  triggerPressed: { opacity: 0.75 },
  triggerCrisis: {
    borderColor: 'rgba(220, 38, 38, 0.75)',
    borderWidth: 2,
    backgroundColor: 'rgba(69, 10, 10, 0.45)',
  },
  siteName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.badge,
    color: colors.gold,
    flexShrink: 1,
  },
  sheet: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  sheetTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.title,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  sheetRowActive: {},
  sheetRowPressed: { opacity: 0.65 },
  sheetName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.value,
    color: colors.textSecondary,
  },
  sheetNameActive: {
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
  },
  sheetLoc: {
    fontFamily: fonts.regular,
    fontSize: fontSize.badge,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
