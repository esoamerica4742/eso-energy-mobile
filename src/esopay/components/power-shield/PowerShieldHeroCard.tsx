import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PowerShieldMeter } from '@/esopay/api/types';
import { EsoPayGoldButton } from '@/esopay/components/EsoPayButtons';
import { PowerShieldOrb } from '@/esopay/components/power-shield/PowerShieldOrb';
import {
  PS,
  formatBurnUnitsLabel,
  psFont,
  statusPillForMeter,
} from '@/esopay/components/power-shield/powerShieldTheme';
import { formatCapacityPct } from '@/esopay/lib/powerShieldUi';
import { ds } from '@/esopay/theme/designSystem';

type Props = {
  active: boolean;
  meter?: PowerShieldMeter | null;
  onActivate: () => void;
  activating?: boolean;
};

export const PowerShieldHeroCard = memo(function PowerShieldHeroCard({
  active,
  meter,
  onActivate,
  activating = false,
}: Props) {
  const dailyKobo =
    meter?.user_daily_spend_kobo ?? meter?.learned_daily_spend_kobo ?? meter?.daily_spend_kobo ?? 0;
  const pill = statusPillForMeter(active, meter);

  const statusCopy =
    active && dailyKobo > 0
      ? formatBurnUnitsLabel(dailyKobo)
      : 'Burn rate unlocks after your first top-up';

  const headline =
    active && meter
      ? `${formatCapacityPct(meter.capacity_remaining_pct ?? meter.volume_remaining_pct)} remaining`
      : null;

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.pill,
          styles.pillPosition,
          active
            ? { backgroundColor: pill.bg, borderColor: pill.border }
            : styles.pillInactive,
        ]}
      >
        <View
          style={[
            styles.pillDot,
            active ? { backgroundColor: pill.dot } : styles.pillDotInactive,
          ]}
        />
        <Text
          style={[
            styles.pillText,
            active ? { color: pill.text } : styles.pillTextInactive,
          ]}
        >
          {pill.label}
        </Text>
      </View>

      <PowerShieldOrb active={active} />

      {headline ? <Text style={styles.headline}>{headline}</Text> : null}

      <View style={styles.dividerWrap}>
        <View style={styles.divider} />
      </View>

      <Text style={styles.statusCopy}>{statusCopy}</Text>

      <EsoPayGoldButton
        label={active ? 'Power Shield Active' : 'Activate Power Shield'}
        onPress={onActivate}
        loading={activating}
        active={active}
        style={styles.cta}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    borderRadius: ds.radius.wallet,
    backgroundColor: PS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: ds.space.section,
    paddingHorizontal: ds.space.section,
    paddingBottom: 24,
    gap: ds.space.component,
    alignItems: 'center',
  },
  headline: {
    fontFamily: psFont.display,
    fontSize: ds.type.title.fontSize,
    color: PS.text,
    textAlign: 'center',
    marginTop: 4,
  },
  dividerWrap: {
    alignItems: 'center',
    marginTop: 4,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: PS.border,
  },
  statusCopy: {
    fontFamily: psFont.body,
    fontSize: ds.type.label.fontSize,
    lineHeight: ds.type.label.lineHeight,
    color: PS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: ds.radius.pill,
    borderWidth: 1,
  },
  pillPosition: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  pillInactive: {
    backgroundColor: PS.surface2,
    borderRadius: 20,
    borderWidth: 0,
    paddingHorizontal: 12,
    gap: 0,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillDotInactive: {
    backgroundColor: PS.textMuted,
    marginRight: 6,
  },
  pillText: {
    fontFamily: psFont.bodyMedium,
    fontSize: ds.type.caption.fontSize,
  },
  pillTextInactive: {
    fontFamily: psFont.medium,
    fontSize: 11,
    fontWeight: '500',
    color: PS.textSecondary,
  },
  cta: {
    marginTop: 12,
  },
});
