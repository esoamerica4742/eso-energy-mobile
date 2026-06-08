import { memo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { Bell } from 'lucide-react-native';

import type { PowerShieldAlertLevel } from '@/esopay/api/types';

import { PS, psFont, timelineFillRatio } from '@/esopay/components/power-shield/powerShieldTheme';



const NODES = [

  { key: 'warn_10', label: '10% Auto-Top Up' },

  { key: 'critical', label: '5% Critical Panic' },

] as const;



type Props = {

  alertLevel?: PowerShieldAlertLevel;

  active: boolean;

};



export const PowerShieldAlertTimeline = memo(function PowerShieldAlertTimeline({

  alertLevel,

  active,

}: Props) {

  const fill = active ? timelineFillRatio(alertLevel) : 0;

  const isCritical = alertLevel === 'critical' || alertLevel === 'expired';

  const fillColor = active ? (isCritical ? PS.crimson : PS.amber) : PS.inactive;



  return (

    <View style={styles.wrap}>

      <View style={styles.track}>

        <View style={styles.trackBg} />

        <View style={[styles.trackFill, { width: `${fill * 100}%`, backgroundColor: fillColor }]} />

      </View>

      <View style={styles.nodes}>

        {NODES.map((node, index) => {

          const threshold = index === 0 ? 0.45 : 0.95;

          const nodeLit = fill >= threshold;

          const criticalNode = node.key === 'critical';

          return (

            <View key={node.key} style={styles.node}>

              <View

                style={[

                  styles.bellWrap,

                  nodeLit && active

                    ? criticalNode && isCritical

                      ? styles.bellWrapCritical

                      : styles.bellWrapLit

                    : null,

                ]}

              >

                <Bell

                  size={14}

                  color={active && nodeLit ? (criticalNode && isCritical ? PS.crimson : PS.amber) : PS.inactive}

                  strokeWidth={2.2}

                />

              </View>

              <Text

                style={[

                  styles.nodeLabel,

                  active && nodeLit

                    ? criticalNode && isCritical

                      ? styles.nodeLabelCritical

                      : styles.nodeLabelLit

                    : null,

                ]}

                numberOfLines={2}

                textAlign="center"

              >

                {node.label}

              </Text>

            </View>

          );

        })}

      </View>

    </View>

  );

});



const styles = StyleSheet.create({

  wrap: {

    gap: 10,

    paddingHorizontal: 4,

  },

  track: {

    height: 3,

    borderRadius: 999,

    overflow: 'hidden',

    marginHorizontal: 48,

    position: 'relative',

  },

  trackBg: {

    ...StyleSheet.absoluteFillObject,

    backgroundColor: PS.track,

  },

  trackFill: {

    position: 'absolute',

    left: 0,

    top: 0,

    bottom: 0,

    borderRadius: 999,

  },

  nodes: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    paddingHorizontal: 24,

  },

  node: {

    alignItems: 'center',

    gap: 6,

    minWidth: 120,

  },

  bellWrap: {

    width: 32,

    height: 32,

    borderRadius: 16,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: 'rgba(255,255,255,0.04)',

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.06)',

  },

  bellWrapLit: {

    borderColor: 'rgba(245, 166, 35, 0.35)',

    backgroundColor: PS.amberDim,

  },

  bellWrapCritical: {

    borderColor: PS.crimsonBorder,

    backgroundColor: PS.crimsonDim,

  },

  nodeLabel: {

    fontFamily: psFont.bodyMedium,

    fontSize: 12,

    color: PS.inactive,

  },

  nodeLabelLit: {

    color: PS.amber,

  },

  nodeLabelCritical: {

    color: PS.crimson,

  },

});


