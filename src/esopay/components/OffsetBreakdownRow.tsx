import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Cpu } from 'lucide-react-native';
import type { InverterOffset } from '@/esopay/api/types';
import { LiveStatusDot } from '@/esopay/components/LiveStatusDot';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T, type EsoPayStatusKey } from '@/esopay/theme/tokens';
import { formatKwh } from '@/lib/format';

type Props = {
  offset: InverterOffset;
};

function offsetLiveStatus(offset: InverterOffset): EsoPayStatusKey {
  if (offset.is_live) return 'live';
  if (offset.offset_percentage >= 80) return 'live';
  if (offset.offset_percentage > 0) return 'partial';
  return 'offline';
}

export const OffsetBreakdownRow = memo(function OffsetBreakdownRow({ offset }: Props) {
  const status = offsetLiveStatus(offset);

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <View style={styles.serialBlock}>
          <Cpu size={16} color={T.color.gold.muted} strokeWidth={2} />
          <Text style={styles.serial} numberOfLines={1}>
            {offset.inverter_serial}
          </Text>
        </View>
        <View style={styles.liveBlock}>
          <LiveStatusDot status={status} size={6} />
          <Text style={styles.percent}>{offset.offset_percentage.toFixed(1)}%</Text>
        </View>
      </View>

      <Text style={styles.generation}>{formatKwh(offset.generation_kwh)} generated</Text>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(100, Math.max(0, offset.offset_percentage))}%` },
          ]}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    backgroundColor: T.color.bg.surface,
    borderRadius: T.radius.sm,
    borderWidth: 1,
    borderColor: T.color.border.subtle,
    padding: T.spacing.lg,
    marginBottom: T.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: T.spacing.xs,
  },
  serialBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.sm,
    flex: 1,
    paddingRight: T.spacing.sm,
  },
  serial: {
    flex: 1,
    fontFamily: esopayFonts.mono,
    fontSize: T.type.mono.size,
    lineHeight: T.type.mono.lineHeight,
    color: T.color.text.primary,
  },
  liveBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.xs,
  },
  percent: {
    fontFamily: esopayFonts.body,
    fontSize: T.type.label.size,
    color: T.color.gold.shimmer,
  },
  generation: {
    fontFamily: esopayFonts.mono,
    fontSize: T.type.caption.size,
    color: T.color.text.secondary,
    marginBottom: T.spacing.sm,
  },
  track: {
    height: 4,
    borderRadius: T.radius.full,
    backgroundColor: T.color.bg.inset,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: T.radius.full,
    backgroundColor: T.color.gold.primary,
  },
});
