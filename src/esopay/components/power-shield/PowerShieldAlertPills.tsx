import { memo, useEffect, useRef } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { Lock } from 'lucide-react-native';

import Animated, {

  Easing,

  useAnimatedStyle,

  useSharedValue,

  withRepeat,

  withSequence,

  withTiming,

} from 'react-native-reanimated';

import type { PowerShieldAlertLevel } from '@/esopay/api/types';

import { PS, psFont } from '@/esopay/components/power-shield/powerShieldTheme';



export type AlertPillKey = 'warn_10' | 'critical';



type Props = {

  locked?: boolean;

  alertLevel?: PowerShieldAlertLevel;

  notifyWarn10?: boolean;

  notifyCritical5?: boolean;

  onArmHaptic?: (pill: AlertPillKey) => void;

};



function isPillArmed(

  pill: AlertPillKey,

  alertLevel: PowerShieldAlertLevel | undefined,

  notify: boolean,

): boolean {

  if (!notify || !alertLevel || alertLevel === 'unknown') return false;

  if (pill === 'warn_10') {

    return ['warn_10', 'critical', 'expired'].includes(alertLevel);

  }

  return ['critical', 'expired'].includes(alertLevel);

}



function AlertPill({

  label,

  armed,

  locked,

  critical,

}: {

  label: string;

  armed: boolean;

  locked: boolean;

  critical?: boolean;

}) {

  const pulse = useSharedValue(1);



  useEffect(() => {

    if (!armed || locked) {

      pulse.value = 1;

      return;

    }

    pulse.value = withRepeat(

      withSequence(

        withTiming(critical ? 1.06 : 1.04, { duration: 700, easing: Easing.inOut(Easing.ease) }),

        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),

      ),

      -1,

      true,

    );

  }, [armed, locked, critical, pulse]);



  const animStyle = useAnimatedStyle(() => ({

    transform: [{ scale: pulse.value }],

  }));



  return (

    <Animated.View

      style={[

        styles.pill,

        locked && styles.pillLocked,

        armed && !locked && (critical ? styles.pillCritical : styles.pillArmed),

        animStyle,

      ]}

    >

      {locked ? <Lock size={11} color={PS.locked} strokeWidth={2.2} /> : null}

      <Text

        style={[

          styles.pillText,

          locked && styles.pillTextLocked,

          armed && !locked && (critical ? styles.pillTextCritical : styles.pillTextArmed),

        ]}

      >

        {label}

      </Text>

    </Animated.View>

  );

}



export const PowerShieldAlertPills = memo(function PowerShieldAlertPills({

  locked = false,

  alertLevel,

  notifyWarn10 = true,

  notifyCritical5 = true,

  onArmHaptic,

}: Props) {

  const hapticSent = useRef<Set<AlertPillKey>>(new Set());



  const pills: { key: AlertPillKey; label: string; notify: boolean; critical?: boolean }[] = [

    { key: 'warn_10', label: '10%', notify: notifyWarn10 },

    { key: 'critical', label: '5%', notify: notifyCritical5, critical: true },

  ];



  useEffect(() => {

    if (locked || !onArmHaptic) return;

    pills.forEach(({ key, notify }) => {

      if (isPillArmed(key, alertLevel, notify) && !hapticSent.current.has(key)) {

        hapticSent.current.add(key);

        onArmHaptic(key);

      }

    });

  }, [alertLevel, locked, notifyWarn10, notifyCritical5, onArmHaptic]);



  return (

    <View style={styles.row}>

      {pills.map(({ key, label, notify, critical }) => (

        <AlertPill

          key={key}

          label={label}

          locked={locked}

          armed={isPillArmed(key, alertLevel, notify)}

          critical={critical}

        />

      ))}

    </View>

  );

});



const styles = StyleSheet.create({

  row: {

    flexDirection: 'row',

    justifyContent: 'center',

    gap: 10,

    flexWrap: 'wrap',

  },

  pill: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 5,

    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 999,

    borderWidth: 1,

    borderColor: PS.border,

    backgroundColor: PS.surface,

  },

  pillLocked: {

    opacity: 0.55,

  },

  pillArmed: {

    borderColor: `${PS.gold}88`,

    backgroundColor: PS.goldDim,

  },

  pillCritical: {

    borderColor: 'rgba(220, 38, 38, 0.65)',

    backgroundColor: 'rgba(127, 29, 29, 0.35)',

  },

  pillText: {

    fontFamily: psFont.medium,

    fontWeight: '600',

    fontSize: 12,

    color: PS.textMuted,

    letterSpacing: 0.3,

  },

  pillTextLocked: {

    color: PS.textDim,

  },

  pillTextArmed: {

    color: PS.gold,

  },

  pillTextCritical: {

    color: PS.crimson,

  },

});


