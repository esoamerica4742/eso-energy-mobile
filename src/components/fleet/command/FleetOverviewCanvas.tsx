import { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { FleetMapPin } from '@/components/fleet/command/FleetMapPin';
import { buildFleetMapRegion, projectFleetSite } from '@/lib/fleetMapProjection';
import { Colors, FontSize, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import type { FleetSite } from '@/types/fleet';

type Props = {
  sites: FleetSite[];
  selectedSiteId: string | null;
  onSelectSite: (siteId: string) => void;
};

const GRID_LINES = 8;
const HAIRLINE = 'rgba(255,255,255,0.10)';
const HAIRLINE_SOFT = 'rgba(255,255,255,0.04)';

export function FleetOverviewCanvas({ sites, selectedSiteId, onSelectSite }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const region = useMemo(() => buildFleetMapRegion(sites), [sites]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) setSize({ width, height });
  };

  const pins = useMemo(() => {
    if (!size.width || !size.height) return [];
    return sites.map((site) => ({
      site,
      ...projectFleetSite(site, region, size.width, size.height),
    }));
  }, [region, sites, size.height, size.width]);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <LinearGradient
        colors={['#1C1C1E', '#000000', '#000000']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {size.width > 0 && size.height > 0 ? (
        <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill}>
          {Array.from({ length: GRID_LINES }).flatMap((_, i) => {
            const y = (size.height / GRID_LINES) * (i + 1);
            const x = (size.width / GRID_LINES) * (i + 1);
            return [
              <Line
                key={`h-${i}`}
                x1={0}
                y1={y}
                x2={size.width}
                y2={y}
                stroke={HAIRLINE_SOFT}
                strokeWidth={StyleSheet.hairlineWidth}
              />,
              <Line
                key={`v-${i}`}
                x1={x}
                y1={0}
                x2={x}
                y2={size.height}
                stroke={HAIRLINE_SOFT}
                strokeWidth={StyleSheet.hairlineWidth}
              />,
            ];
          })}

          <Path
            d={`M ${size.width * 0.18} ${size.height * 0.72}
                C ${size.width * 0.34} ${size.height * 0.58}, ${size.width * 0.52} ${size.height * 0.62}, ${size.width * 0.64} ${size.height * 0.48}
                C ${size.width * 0.76} ${size.height * 0.36}, ${size.width * 0.86} ${size.height * 0.42}, ${size.width * 0.9} ${size.height * 0.55}`}
            stroke={HAIRLINE}
            strokeWidth={StyleSheet.hairlineWidth}
            fill="none"
          />

          {pins.length > 1
            ? pins.slice(1).map((pin, index) => {
                const prev = pins[index];
                return (
                  <Line
                    key={`link-${pin.site.id}`}
                    x1={prev.x}
                    y1={prev.y}
                    x2={pin.x}
                    y2={pin.y}
                    stroke={HAIRLINE}
                    strokeWidth={StyleSheet.hairlineWidth}
                    strokeDasharray="4 6"
                  />
                );
              })
            : null}

          <Circle
            cx={size.width * 0.5}
            cy={size.height * 0.52}
            r={Math.min(size.width, size.height) * 0.34}
            stroke={HAIRLINE_SOFT}
            strokeWidth={StyleSheet.hairlineWidth}
            fill="transparent"
          />
        </Svg>
      ) : null}

      {pins.map(({ site, x, y }) => {
        const selected = selectedSiteId === site.id;
        return (
          <Pressable
            key={site.id}
            onPress={() => onSelectSite(site.id)}
            style={[
              styles.pinHit,
              {
                left: x - 22,
                top: y - 22,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${site.name}, ${site.status}`}
            accessibilityState={{ selected }}
          >
            <FleetMapPin status={site.status} selected={selected} />
            {selected ? (
              <View style={styles.pinLabel}>
                <Text style={styles.pinLabelText} numberOfLines={1}>
                  {site.name}
                </Text>
                <Text style={styles.pinLabelMeta}>{site.load.toFixed(1)} kW</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}

      <View style={styles.legend} pointerEvents="none">
        <Text style={styles.legendTitle}>Fleet map</Text>
        <Text style={styles.legendCopy}>Tap a site pin to inspect load and status.</Text>
      </View>

      <View style={styles.vignetteTop} pointerEvents="none" />
      <View style={styles.vignetteBottom} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Colors.bg,
    overflow: 'hidden',
  },
  pinHit: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinLabel: {
    position: 'absolute',
    top: 34,
    minWidth: 108,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
  },
  pinLabelText: {
    fontFamily: fonts.semibold,
    fontSize: FontSize.caption,
    color: Colors.textPrimary,
  },
  pinLabelMeta: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: FontSize.label,
    color: 'rgba(255,255,255,0.55)',
  },
  legend: {
    position: 'absolute',
    left: Spacing.md,
    top: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderSubtle,
    backgroundColor: 'rgba(0,0,0,0.72)',
    maxWidth: 220,
  },
  legendTitle: {
    fontFamily: fonts.semibold,
    fontSize: FontSize.caption,
    color: Colors.textPrimary,
    letterSpacing: 0.4,
  },
  legendCopy: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: FontSize.label,
    lineHeight: 15,
    color: Colors.textSecondary,
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
});
