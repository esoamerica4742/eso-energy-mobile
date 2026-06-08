import { type ReactNode, useEffect } from 'react';

import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import * as TabsPrimitive from '@rn-primitives/tabs';

import Animated, {

  useAnimatedStyle,

  useSharedValue,

  withSpring,

} from 'react-native-reanimated';

import { motionSpring } from '@/lib/motion/presets';

import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';



type TabItem = { value: string; label: string };



type Props = {

  value: string;

  onValueChange: (value: string) => void;

  items: TabItem[];

  children: ReactNode;

  variant?: 'dashboard' | 'wallet';

};



export function PremiumTabs({ value, onValueChange, items, children, variant = 'dashboard' }: Props) {

  const accent = colors.gold;

  const isWallet = variant === 'wallet';

  const indicatorX = useSharedValue(0);

  const indicatorW = useSharedValue(0);

  const tabLayouts = useSharedValue<Record<string, { x: number; width: number }>>({});



  useEffect(() => {

    const layout = tabLayouts.value[value];

    if (!layout) return;

    indicatorX.value = withSpring(layout.x, motionSpring.dock);

    indicatorW.value = withSpring(layout.width, motionSpring.dock);

  }, [value, indicatorX, indicatorW, tabLayouts]);



  const indicatorStyle = useAnimatedStyle(() => ({

    transform: [{ translateX: indicatorX.value }],

    width: indicatorW.value,

  }));



  const onTabLayout = (tabValue: string) => (e: LayoutChangeEvent) => {

    const { x, width } = e.nativeEvent.layout;

    tabLayouts.value = { ...tabLayouts.value, [tabValue]: { x, width } };

    if (tabValue === value) {

      indicatorX.value = x;

      indicatorW.value = width;

    }

  };



  return (

    <TabsPrimitive.Root value={value} onValueChange={onValueChange}>

      <View style={[styles.listWrap, isWallet && styles.listWrapWallet]}>

        <TabsPrimitive.List style={[styles.list, isWallet && styles.listWallet]}>

          {items.map((item) => (

            <TabsPrimitive.Trigger key={item.value} value={item.value} asChild>

              <Pressable

                style={styles.trigger}

                onLayout={onTabLayout(item.value)}

                accessibilityRole="tab"

                accessibilityState={{ selected: value === item.value }}

              >

                <Text

                  style={[

                    styles.triggerText,

                    isWallet && styles.triggerTextWallet,

                    value === item.value && {

                      color: accent,

                      fontFamily: fonts.semibold,

                    },

                  ]}

                >

                  {item.label}

                </Text>

              </Pressable>

            </TabsPrimitive.Trigger>

          ))}

        </TabsPrimitive.List>

        <Animated.View style={[styles.indicator, { backgroundColor: accent }, indicatorStyle]} />

      </View>

      {children}

    </TabsPrimitive.Root>

  );

}



export function PremiumTabPanel({ value, children }: { value: string; children: ReactNode }) {

  return (

    <TabsPrimitive.Content value={value} style={styles.content}>

      {children}

    </TabsPrimitive.Content>

  );

}



const styles = StyleSheet.create({

  listWrap: {

    marginHorizontal: spacing.xl,

    marginBottom: spacing.md,

    position: 'relative',

  },

  listWrapWallet: {

    marginHorizontal: 20,

  },

  list: {

    flexDirection: 'row',

    backgroundColor: colors.bgElevated,

    borderRadius: radius.button,

    borderWidth: 1,

    borderColor: colors.borderSubtle,

    padding: 4,

  },

  listWallet: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.card,
    borderColor: colors.goldBorder,
  },

  trigger: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    paddingVertical: spacing.sm + 2,

    paddingHorizontal: spacing.md,

    zIndex: 1,

  },

  triggerText: {

    fontFamily: fonts.medium,

    fontSize: fontSize.badge,

    color: colors.textSecondary,

  },

  triggerTextWallet: {

    fontFamily: fonts.regular,

    fontSize: 13,

    color: colors.textTertiary,

  },

  indicator: {

    position: 'absolute',

    top: 4,

    bottom: 4,

    left: 4,

    borderRadius: radius.button - 2,

    opacity: 0.22,

  },

  content: {

    flex: 1,

  },

});


