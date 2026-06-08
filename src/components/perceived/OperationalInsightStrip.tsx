import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ListeningBlink } from '@/components/monitoring/WaitingStateMotion';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';
import { FleetStatusPulse } from '@/components/fleet/command/FleetStatusPulse';
import type { OperationalInsight } from '@/lib/perceivedRealtime';
import { Colors, FontSize, MonitoringLayout, Radius, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  insight: OperationalInsight | null;
  streaming?: boolean;
};

const LEVEL_COLOR: Record<OperationalInsight['level'], string> = {
  info: Colors.battery,
  watch: Colors.warning,
  critical: Colors.alert,
};

/** Single rotating operational insight — enterprise, non-chatbot. */
export const OperationalInsightStrip = memo(function OperationalInsightStrip({
  insight,
  streaming = true,
}: Props) {
  const reduced = useReducedMotion();
  if (!insight) return null;

  const color = LEVEL_COLOR[insight.level];
  const awaitingSync =
    !streaming &&
    (insight.id === 'awaiting-sync' ||
      insight.message.toLowerCase().includes('awaiting') ||
      insight.context?.toLowerCase().includes('telemetry stream paused'));

  const content = (
    <View style={styles.wrap}>
      {streaming ? (
        <FleetStatusPulse status="live" size="sm" reducedMotion={reduced} />
      ) : (
        <View style={styles.dotMuted} />
      )}
      <View style={styles.rulesPill}>
        <Text style={styles.rulesText}>{streaming ? 'RULES · LIVE' : 'RULES · PAUSED'}</Text>
      </View>
      <View style={styles.copy}>
        {awaitingSync ? (
          <ListeningBlink>
            <Text style={[styles.message, { color }]} numberOfLines={1}>
              {insight.message}
            </Text>
          </ListeningBlink>
        ) : (
          <Text style={[styles.message, { color }]} numberOfLines={1}>
            {insight.message}
          </Text>
        )}
        {insight.context ? (
          awaitingSync ? (
            <ListeningBlink>
              <Text style={styles.context} numberOfLines={1}>
                {insight.context}
              </Text>
            </ListeningBlink>
          ) : (
            <Text style={styles.context} numberOfLines={1}>
              {insight.context}
            </Text>
          )
        ) : null}
      </View>
    </View>
  );

  if (reduced) return content;

  return (
    <Animated.View entering={FadeIn.duration(280)} exiting={FadeOut.duration(200)}>
      {content}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: MonitoringLayout.cardMarginH,
    marginBottom: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
  },
  dotMuted: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  rulesPill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceRaised,
  },
  rulesText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 0.6,
    color: Colors.textMuted,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  message: {
    fontFamily: fonts.semibold,
    fontSize: FontSize.caption,
    letterSpacing: -0.1,
  },
  context: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: FontSize.micro,
    color: Colors.textMuted,
  },
});
